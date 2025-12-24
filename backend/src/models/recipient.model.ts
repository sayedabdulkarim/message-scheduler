import mongoose, { Document, Schema } from 'mongoose';

export interface IRecipient extends Document {
  userId: mongoose.Types.ObjectId;
  platformId: mongoose.Types.ObjectId;
  name: string;
  identifier: string; // Phone number or email
  createdAt: Date;
}

const recipientSchema = new Schema<IRecipient>(
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
    identifier: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

recipientSchema.index({ userId: 1, platformId: 1 });

export const Recipient = mongoose.model<IRecipient>('Recipient', recipientSchema);
