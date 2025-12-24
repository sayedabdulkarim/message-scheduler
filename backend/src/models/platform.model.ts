import mongoose, { Document, Schema } from 'mongoose';

export type PlatformType = 'email' | 'whatsapp' | 'telegram';

export interface IPlatform extends Document {
  userId: mongoose.Types.ObjectId;
  platform: PlatformType;
  isVerified: boolean;
  data: {
    // Email
    email?: string;
    // WhatsApp
    phoneNumber?: string;
    sessionData?: string; // Encrypted
    // Telegram
    chatId?: string;
    username?: string;
  };
  connectedAt: Date;
  lastUsed?: Date;
}

const platformSchema = new Schema<IPlatform>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    platform: {
      type: String,
      enum: ['email', 'whatsapp', 'telegram'],
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    data: {
      email: String,
      phoneNumber: String,
      sessionData: String,
      chatId: String,
      username: String,
    },
    connectedAt: {
      type: Date,
      default: Date.now,
    },
    lastUsed: Date,
  },
  {
    timestamps: true,
  }
);

// Compound index: one platform per user
platformSchema.index({ userId: 1, platform: 1 }, { unique: true });

export const Platform = mongoose.model<IPlatform>('Platform', platformSchema);
