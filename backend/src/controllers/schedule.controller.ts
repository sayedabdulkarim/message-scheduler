import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Schedule, Platform, Recipient, Log } from '../models';
import { scheduleJob, cancelJob } from '../services/scheduler.service';

// Get all schedules
export const getSchedules = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const schedules = await Schedule.find({ userId: req.user?._id })
      .populate('platformId', 'platform data')
      .populate('recipients', 'name identifier')
      .sort({ createdAt: -1 });

    res.json({ schedules });
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({ message: 'Error getting schedules' });
  }
};

// Create schedule
export const createSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      platformId,
      recipients,
      message,
      scheduleType,
      scheduledAt,
      time,
      days,
      timezone,
    } = req.body;

    const userId = req.user?._id;

    // Verify platform exists and is verified
    const platform = await Platform.findOne({
      _id: platformId,
      userId,
      isVerified: true,
    });

    if (!platform) {
      res.status(400).json({ message: 'Platform not found or not verified' });
      return;
    }

    // Build cron expression for recurring
    let cronExpression: string | undefined;
    if (scheduleType === 'recurring' && time && days) {
      const [hour, minute] = time.split(':');
      const dayMap: Record<string, number> = {
        sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
      };
      const cronDays = days.map((d: string) => dayMap[d.toLowerCase()]).join(',');
      cronExpression = `${minute} ${hour} * * ${cronDays}`;
    }

    // Create schedule
    const schedule = new Schedule({
      userId,
      platformId,
      name,
      recipients,
      message,
      scheduleType,
      scheduledAt: scheduleType === 'once' ? new Date(scheduledAt) : undefined,
      cronExpression,
      time,
      days,
      timezone: timezone || 'Asia/Kolkata',
      isEnabled: true,
    });

    await schedule.save();

    // Schedule the job
    await scheduleJob(schedule);

    res.status(201).json({
      message: 'Schedule created successfully',
      schedule,
    });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({ message: 'Error creating schedule' });
  }
};

// Get single schedule
export const getSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const schedule = await Schedule.findOne({
      _id: req.params.id,
      userId: req.user?._id,
    })
      .populate('platformId', 'platform data')
      .populate('recipients', 'name identifier');

    if (!schedule) {
      res.status(404).json({ message: 'Schedule not found' });
      return;
    }

    res.json({ schedule });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ message: 'Error getting schedule' });
  }
};

// Update schedule
export const updateSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, recipients, message, time, days, isEnabled } = req.body;

    const schedule = await Schedule.findOne({
      _id: req.params.id,
      userId: req.user?._id,
    });

    if (!schedule) {
      res.status(404).json({ message: 'Schedule not found' });
      return;
    }

    // Update fields
    if (name) schedule.name = name;
    if (recipients) schedule.recipients = recipients;
    if (message) schedule.message = message;
    if (time) schedule.time = time;
    if (days) schedule.days = days;
    if (typeof isEnabled === 'boolean') schedule.isEnabled = isEnabled;

    // Rebuild cron if time or days changed
    if ((time || days) && schedule.scheduleType === 'recurring') {
      const [hour, minute] = (time || schedule.time || '07:00').split(':');
      const dayMap: Record<string, number> = {
        sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
      };
      const scheduleDays = days || schedule.days || ['mon', 'tue', 'wed', 'thu', 'fri'];
      const cronDays = scheduleDays.map((d: string) => dayMap[d.toLowerCase()]).join(',');
      schedule.cronExpression = `${minute} ${hour} * * ${cronDays}`;
    }

    await schedule.save();

    // Reschedule job
    await cancelJob(schedule._id.toString());
    if (schedule.isEnabled) {
      await scheduleJob(schedule);
    }

    res.json({ message: 'Schedule updated', schedule });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ message: 'Error updating schedule' });
  }
};

// Delete schedule
export const deleteSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const schedule = await Schedule.findOneAndDelete({
      _id: req.params.id,
      userId: req.user?._id,
    });

    if (!schedule) {
      res.status(404).json({ message: 'Schedule not found' });
      return;
    }

    // Cancel job
    await cancelJob(schedule._id.toString());

    res.json({ message: 'Schedule deleted' });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({ message: 'Error deleting schedule' });
  }
};

// Toggle schedule
export const toggleSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const schedule = await Schedule.findOne({
      _id: req.params.id,
      userId: req.user?._id,
    });

    if (!schedule) {
      res.status(404).json({ message: 'Schedule not found' });
      return;
    }

    schedule.isEnabled = !schedule.isEnabled;
    await schedule.save();

    // Schedule or cancel job
    if (schedule.isEnabled) {
      await scheduleJob(schedule);
    } else {
      await cancelJob(schedule._id.toString());
    }

    res.json({
      message: `Schedule ${schedule.isEnabled ? 'enabled' : 'disabled'}`,
      isEnabled: schedule.isEnabled,
    });
  } catch (error) {
    console.error('Toggle schedule error:', error);
    res.status(500).json({ message: 'Error toggling schedule' });
  }
};

// Test schedule (send immediately)
export const testSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const schedule = await Schedule.findOne({
      _id: req.params.id,
      userId: req.user?._id,
    })
      .populate('platformId')
      .populate('recipients');

    if (!schedule) {
      res.status(404).json({ message: 'Schedule not found' });
      return;
    }

    // Import and execute send function
    const { executeSchedule } = await import('../services/scheduler.service');
    await executeSchedule(schedule);

    res.json({ message: 'Test message sent' });
  } catch (error) {
    console.error('Test schedule error:', error);
    res.status(500).json({ message: 'Error sending test message' });
  }
};
