import mongoose, { Document, Schema } from 'mongoose';

export type OtpType = 'email_verification' | 'password_reset' | 'telegram_verification';

export interface IOtp extends Document {
  userId?: mongoose.Types.ObjectId;
  email?: string;
  type: OtpType;
  code: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
}

const otpSchema = new Schema<IOtp>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    email: String,
    type: {
      type: String,
      enum: ['email_verification', 'password_reset', 'telegram_verification'],
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index - auto delete when expired
    },
    attempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

otpSchema.index({ email: 1, type: 1 });

export const Otp = mongoose.model<IOtp>('Otp', otpSchema);
