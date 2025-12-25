import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Recipient, Platform } from '../models';

// Get all recipients
export const getRecipients = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { platformId } = req.query;

    const query: any = { userId: req.user?._id };
    if (platformId) query.platformId = platformId;

    const recipients = await Recipient.find(query)
      .populate('platformId', 'platform')
      .sort({ createdAt: -1 });

    res.json({ recipients });
  } catch (error) {
    console.error('Get recipients error:', error);
    res.status(500).json({ message: 'Error getting recipients' });
  }
};

// Create recipient
export const createRecipient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { platformId, name, identifier } = req.body;

    // Verify platform belongs to user
    const platform = await Platform.findOne({
      _id: platformId,
      userId: req.user?._id,
    });

    if (!platform) {
      res.status(400).json({ message: 'Platform not found' });
      return;
    }

    const recipient = new Recipient({
      userId: req.user?._id,
      platformId,
      name,
      identifier,
    });

    await recipient.save();

    res.status(201).json({
      message: 'Recipient added',
      recipient,
    });
  } catch (error) {
    console.error('Create recipient error:', error);
    res.status(500).json({ message: 'Error adding recipient' });
  }
};

// Update recipient
export const updateRecipient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, identifier } = req.body;

    const recipient = await Recipient.findOneAndUpdate(
      { _id: req.params.id, userId: req.user?._id },
      { name, identifier },
      { new: true }
    );

    if (!recipient) {
      res.status(404).json({ message: 'Recipient not found' });
      return;
    }

    res.json({ message: 'Recipient updated', recipient });
  } catch (error) {
    console.error('Update recipient error:', error);
    res.status(500).json({ message: 'Error updating recipient' });
  }
};

// Delete recipient
export const deleteRecipient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const recipient = await Recipient.findOneAndDelete({
      _id: req.params.id,
      userId: req.user?._id,
    });

    if (!recipient) {
      res.status(404).json({ message: 'Recipient not found' });
      return;
    }

    res.json({ message: 'Recipient deleted' });
  } catch (error) {
    console.error('Delete recipient error:', error);
    res.status(500).json({ message: 'Error deleting recipient' });
  }
};
