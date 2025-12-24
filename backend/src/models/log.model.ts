import mongoose, { Document, Schema } from 'mongoose';

export type LogStatus = 'sent' | 'failed' | 'pending';

export interface ILog extends Document {
  userId: mongoose.Types.ObjectId;
  scheduleId: mongoose.Types.ObjectId;
  platform: string;
  recipient: string;
  message: string;
  status: LogStatus;
  error?: string;
  sentAt: Date;
}

const logSchema = new Schema<ILog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    scheduleId: {
      type: Schema.Types.ObjectId,
      ref: 'Schedule',
      required: true,
    },
    platform: {
      type: String,
      required: true,
    },
    recipient: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['sent', 'failed', 'pending'],
      default: 'pending',
    },
    error: String,
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

logSchema.index({ userId: 1, sentAt: -1 });
logSchema.index({ scheduleId: 1 });

export const Log = mongoose.model<ILog>('Log', logSchema);
