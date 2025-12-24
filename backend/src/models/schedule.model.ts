import mongoose, { Document, Schema } from 'mongoose';

export type ScheduleType = 'once' | 'recurring';

export interface ISchedule extends Document {
  userId: mongoose.Types.ObjectId;
  platformId: mongoose.Types.ObjectId;
  name: string;
  recipients: mongoose.Types.ObjectId[];
  message: string;
  templateId?: mongoose.Types.ObjectId;
  scheduleType: ScheduleType;
  // For one-time
  scheduledAt?: Date;
  // For recurring
  cronExpression?: string;
  timezone: string;
  days?: string[];
  time?: string;
  isEnabled: boolean;
  agendaJobId?: string;
  lastRun?: Date;
  nextRun?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const scheduleSchema = new Schema<ISchedule>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    platformId: {
      type: Schema.Types.ObjectId,
      ref: 'Platform',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    recipients: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Recipient',
      },
    ],
    message: {
      type: String,
      required: true,
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'Template',
    },
    scheduleType: {
      type: String,
      enum: ['once', 'recurring'],
      required: true,
    },
    scheduledAt: Date,
    cronExpression: String,
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
    },
    days: [String],
    time: String,
    isEnabled: {
      type: Boolean,
      default: true,
    },
    agendaJobId: String,
    lastRun: Date,
    nextRun: Date,
  },
  {
    timestamps: true,
  }
);

scheduleSchema.index({ userId: 1, isEnabled: 1 });

export const Schedule = mongoose.model<ISchedule>('Schedule', scheduleSchema);
