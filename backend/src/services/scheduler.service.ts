import Agenda from 'agenda';
import { Schedule, Log, Platform, Recipient, ISchedule } from '../models';
import { sendScheduledMessage } from './email.service';
import { sendTelegramMessage } from './telegram.service';
import { whatsappClients } from '../controllers/platform.controller';

let agenda: Agenda;

// Initialize Agenda
export const initAgenda = async (): Promise<void> => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/message-scheduler';

  agenda = new Agenda({
    db: { address: mongoUri, collection: 'agendaJobs' },
    processEvery: '30 seconds',
  });

  // Define job handler
  agenda.define('send-message', async (job) => {
    const { scheduleId } = job.attrs.data as { scheduleId: string };

    const schedule = await Schedule.findById(scheduleId)
      .populate('platformId')
      .populate('recipients');

    if (!schedule || !schedule.isEnabled) {
      return;
    }

    await executeSchedule(schedule);
  });

  await agenda.start();

  // Load existing schedules
  const schedules = await Schedule.find({ isEnabled: true });
  for (const schedule of schedules) {
    await scheduleJob(schedule);
  }

  console.log('Agenda scheduler started');
};

// Execute schedule - send messages
export const executeSchedule = async (schedule: ISchedule): Promise<void> => {
  const platform = await Platform.findById(schedule.platformId);
  if (!platform || !platform.isVerified) {
    console.error('Platform not verified:', schedule.platformId);
    return;
  }

  const recipients = await Recipient.find({ _id: { $in: schedule.recipients } });

  for (const recipient of recipients) {
    try {
      switch (platform.platform) {
        case 'email':
          await sendScheduledMessage(
            recipient.identifier,
            'Scheduled Message',
            schedule.message
          );
          break;

        case 'telegram':
          await sendTelegramMessage(recipient.identifier, schedule.message);
          break;

        case 'whatsapp':
          const client = whatsappClients.get(schedule.userId.toString());
          if (client) {
            const chatId = `${recipient.identifier.replace(/\D/g, '')}@c.us`;
            await client.sendMessage(chatId, schedule.message);
          } else {
            throw new Error('WhatsApp client not connected');
          }
          break;
      }

      // Log success
      await Log.create({
        userId: schedule.userId,
        scheduleId: schedule._id,
        platform: platform.platform,
        recipient: recipient.identifier,
        message: schedule.message,
        status: 'sent',
        sentAt: new Date(),
      });
    } catch (error: any) {
      // Log failure
      await Log.create({
        userId: schedule.userId,
        scheduleId: schedule._id,
        platform: platform.platform,
        recipient: recipient.identifier,
        message: schedule.message,
        status: 'failed',
        error: error.message,
        sentAt: new Date(),
      });
    }
  }

  // Update last run
  schedule.lastRun = new Date();
  await schedule.save();
};

// Schedule a job
export const scheduleJob = async (schedule: ISchedule): Promise<void> => {
  if (!agenda) return;

  // Cancel existing job if any
  await cancelJob(schedule._id.toString());

  if (!schedule.isEnabled) return;

  if (schedule.scheduleType === 'once' && schedule.scheduledAt) {
    // One-time job
    await agenda.schedule(schedule.scheduledAt, 'send-message', {
      scheduleId: schedule._id.toString(),
    });
  } else if (schedule.scheduleType === 'recurring' && schedule.cronExpression) {
    // Recurring job
    await agenda.every(schedule.cronExpression, 'send-message', {
      scheduleId: schedule._id.toString(),
    }, { timezone: schedule.timezone || 'Asia/Kolkata' });
  }
};

// Cancel a job
export const cancelJob = async (scheduleId: string): Promise<void> => {
  if (!agenda) return;

  await agenda.cancel({ 'data.scheduleId': scheduleId });
};

export { agenda };
