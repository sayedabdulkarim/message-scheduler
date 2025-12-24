import mongoose, { Document, Schema } from 'mongoose';

export interface ITemplate extends Document {
  userId?: mongoose.Types.ObjectId;
  name: string;
  category: string;
  message: string;
  isSystem: boolean;
  createdAt: Date;
}

const templateSchema = new Schema<ITemplate>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['greeting', 'reminder', 'birthday', 'custom'],
      default: 'custom',
    },
    message: {
      type: String,
      required: true,
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Template = mongoose.model<ITemplate>('Template', templateSchema);
