import TelegramBot from 'node-telegram-bot-api';
import { Platform, Otp, User } from '../models';
import { generateOtp, getOtpExpiry } from '../utils/otp';

let bot: TelegramBot | null = null;

// Initialize Telegram Bot
export const initTelegramBot = (): void => {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    console.log('Telegram bot token not provided, skipping initialization');
    return;
  }

  bot = new TelegramBot(token, { polling: true });

  // /start command
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const username = msg.from?.username;

    await bot?.sendMessage(
      chatId,
      `Welcome to Message Scheduler Bot!\n\n` +
      `To link your account:\n` +
      `1. Go to the Message Scheduler website\n` +
      `2. Click "Connect Telegram"\n` +
      `3. Use the command: /link <your-email>\n\n` +
      `Example: /link john@example.com`
    );
  });

  // /link command - start verification
  bot.onText(/\/link (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const email = match?.[1]?.trim();
    const username = msg.from?.username;

    if (!email) {
      await bot?.sendMessage(chatId, 'Please provide your email: /link your@email.com');
      return;
    }

    // Find user by email
    const user = await User.findOne({ email, isEmailVerified: true });
    if (!user) {
      await bot?.sendMessage(chatId, 'No verified account found with this email.');
      return;
    }

    // Generate verification code
    const otp = generateOtp();

    // Delete existing OTPs
    await Otp.deleteMany({ userId: user._id, type: 'telegram_verification' });

    // Create new OTP
    await Otp.create({
      userId: user._id,
      type: 'telegram_verification',
      code: otp,
      expiresAt: getOtpExpiry(10),
    });

    // Create or update platform (unverified)
    await Platform.findOneAndUpdate(
      { userId: user._id, platform: 'telegram' },
      {
        userId: user._id,
        platform: 'telegram',
        isVerified: false,
        data: {
          chatId: chatId.toString(),
          username: username || '',
        },
      },
      { upsert: true }
    );

    await bot?.sendMessage(
      chatId,
      `Verification code: ${otp}\n\n` +
      `Enter this code on the website to complete linking.\n` +
      `Code expires in 10 minutes.`
    );
  });

  // /status command
  bot.onText(/\/status/, async (msg) => {
    const chatId = msg.chat.id;

    const platform = await Platform.findOne({
      'data.chatId': chatId.toString(),
      platform: 'telegram',
    }).populate('userId', 'email');

    if (platform?.isVerified) {
      await bot?.sendMessage(
        chatId,
        `Account linked to: ${(platform.userId as any)?.email}\nStatus: Connected`
      );
    } else {
      await bot?.sendMessage(chatId, 'Not linked to any account. Use /link <email> to connect.');
    }
  });

  // /disconnect command
  bot.onText(/\/disconnect/, async (msg) => {
    const chatId = msg.chat.id;

    const platform = await Platform.findOneAndUpdate(
      { 'data.chatId': chatId.toString(), platform: 'telegram' },
      { isVerified: false, 'data.chatId': null, 'data.username': null }
    );

    if (platform) {
      await bot?.sendMessage(chatId, 'Disconnected from Message Scheduler.');
    } else {
      await bot?.sendMessage(chatId, 'Not connected to any account.');
    }
  });

  console.log('Telegram bot initialized');
};

// Send message via Telegram
export const sendTelegramMessage = async (chatId: string, message: string): Promise<void> => {
  if (!bot) {
    throw new Error('Telegram bot not initialized');
  }

  await bot.sendMessage(chatId, message);
};

export { bot };
