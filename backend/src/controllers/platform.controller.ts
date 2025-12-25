import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Platform, Otp } from '../models';
import { generateOtp, getOtpExpiry } from '../utils/otp';
import { io } from '../app';

// Store active WhatsApp clients
const whatsappClients: Map<string, any> = new Map();

// Get all platforms
export const getPlatforms = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const platforms = await Platform.find({ userId: req.user?._id });

    res.json({
      platforms: platforms.map((p) => ({
        id: p._id,
        platform: p.platform,
        isVerified: p.isVerified,
        data: {
          email: p.data.email,
          phoneNumber: p.data.phoneNumber,
          username: p.data.username,
        },
        connectedAt: p.connectedAt,
        lastUsed: p.lastUsed,
      })),
    });
  } catch (error) {
    console.error('Get platforms error:', error);
    res.status(500).json({ message: 'Error getting platforms' });
  }
};

// Connect WhatsApp - Generate QR
export const connectWhatsApp = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id.toString();
    if (!userId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    // Dynamic import for whatsapp-web.js
    const { Client, LocalAuth } = await import('whatsapp-web.js');
    const qrcode = await import('qrcode');

    // Check if already connected
    if (whatsappClients.has(userId)) {
      res.status(400).json({ message: 'WhatsApp already connecting or connected' });
      return;
    }

    // Create new client
    const client = new Client({
      authStrategy: new LocalAuth({ clientId: userId }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    });

    whatsappClients.set(userId, client);

    // QR Code event
    client.on('qr', async (qr: string) => {
      const qrDataUrl = await qrcode.toDataURL(qr);
      io.to(userId).emit('whatsapp:qr', { qr: qrDataUrl });
    });

    // Ready event
    client.on('ready', async () => {
      const info = client.info;

      // Save or update platform
      await Platform.findOneAndUpdate(
        { userId, platform: 'whatsapp' },
        {
          userId,
          platform: 'whatsapp',
          isVerified: true,
          data: {
            phoneNumber: info.wid.user,
          },
          connectedAt: new Date(),
        },
        { upsert: true }
      );

      io.to(userId).emit('whatsapp:ready', { phoneNumber: info.wid.user });
    });

    // Disconnected event
    client.on('disconnected', async () => {
      whatsappClients.delete(userId);
      await Platform.findOneAndUpdate(
        { userId, platform: 'whatsapp' },
        { isVerified: false }
      );
      io.to(userId).emit('whatsapp:disconnected');
    });

    // Initialize
    await client.initialize();

    res.json({ message: 'WhatsApp connection initiated. Scan QR code.' });
  } catch (error) {
    console.error('Connect WhatsApp error:', error);
    res.status(500).json({ message: 'Error connecting WhatsApp' });
  }
};

// Get WhatsApp status
export const getWhatsAppStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id.toString();
    if (!userId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const platform = await Platform.findOne({ userId, platform: 'whatsapp' });
    const client = whatsappClients.get(userId);

    res.json({
      isConnected: !!platform?.isVerified,
      isClientActive: !!client,
      phoneNumber: platform?.data?.phoneNumber,
    });
  } catch (error) {
    console.error('Get WhatsApp status error:', error);
    res.status(500).json({ message: 'Error getting status' });
  }
};

// Disconnect WhatsApp
export const disconnectWhatsApp = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id.toString();
    if (!userId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    // Destroy client if exists
    const client = whatsappClients.get(userId);
    if (client) {
      await client.destroy();
      whatsappClients.delete(userId);
    }

    // Update platform
    await Platform.findOneAndUpdate(
      { userId, platform: 'whatsapp' },
      { isVerified: false, 'data.sessionData': null }
    );

    res.json({ message: 'WhatsApp disconnected' });
  } catch (error) {
    console.error('Disconnect WhatsApp error:', error);
    res.status(500).json({ message: 'Error disconnecting' });
  }
};

// Verify Telegram
export const verifyTelegram = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { code } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    // Find OTP
    const otpDoc = await Otp.findOne({
      userId,
      type: 'telegram_verification',
      code,
      expiresAt: { $gt: new Date() },
    });

    if (!otpDoc) {
      res.status(400).json({ message: 'Invalid or expired code' });
      return;
    }

    // Update platform (chatId should be stored when bot receives the code)
    const platform = await Platform.findOne({ userId, platform: 'telegram' });
    if (!platform) {
      res.status(400).json({ message: 'Telegram not linked. Send /start to bot first.' });
      return;
    }

    platform.isVerified = true;
    await platform.save();

    // Delete OTP
    await Otp.deleteOne({ _id: otpDoc._id });

    res.json({ message: 'Telegram verified successfully' });
  } catch (error) {
    console.error('Verify Telegram error:', error);
    res.status(500).json({ message: 'Error verifying Telegram' });
  }
};

// Disconnect Telegram
export const disconnectTelegram = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;

    await Platform.findOneAndUpdate(
      { userId, platform: 'telegram' },
      { isVerified: false, 'data.chatId': null, 'data.username': null }
    );

    res.json({ message: 'Telegram disconnected' });
  } catch (error) {
    console.error('Disconnect Telegram error:', error);
    res.status(500).json({ message: 'Error disconnecting' });
  }
};

// Export whatsapp clients for use in scheduler
export { whatsappClients };
