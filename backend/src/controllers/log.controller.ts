import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Log } from '../models';

// Get logs (paginated)
export const getLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const { scheduleId, status, platform } = req.query;

    const query: any = { userId: req.user?._id };
    if (scheduleId) query.scheduleId = scheduleId;
    if (status) query.status = status;
    if (platform) query.platform = platform;

    const [logs, total] = await Promise.all([
      Log.find(query)
        .populate('scheduleId', 'name')
        .sort({ sentAt: -1 })
        .skip(skip)
        .limit(limit),
      Log.countDocuments(query),
    ]);

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ message: 'Error getting logs' });
  }
};

// Get stats
export const getStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;

    const [totalSent, totalFailed, todaySent, platformStats] = await Promise.all([
      // Total sent
      Log.countDocuments({ userId, status: 'sent' }),

      // Total failed
      Log.countDocuments({ userId, status: 'failed' }),

      // Today sent
      Log.countDocuments({
        userId,
        status: 'sent',
        sentAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),

      // By platform
      Log.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: { platform: '$platform', status: '$status' },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Format platform stats
    const platforms: Record<string, { sent: number; failed: number }> = {};
    platformStats.forEach((stat: any) => {
      const { platform, status } = stat._id;
      if (!platforms[platform]) {
        platforms[platform] = { sent: 0, failed: 0 };
      }
      platforms[platform][status as 'sent' | 'failed'] = stat.count;
    });

    res.json({
      stats: {
        totalSent,
        totalFailed,
        todaySent,
        successRate: totalSent + totalFailed > 0
          ? Math.round((totalSent / (totalSent + totalFailed)) * 100)
          : 0,
        platforms,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Error getting stats' });
  }
};
