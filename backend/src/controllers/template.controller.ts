import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Template } from '../models';

// Get all templates (system + user's)
export const getTemplates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const templates = await Template.find({
      $or: [{ isSystem: true }, { userId: req.user?._id }],
    }).sort({ isSystem: -1, createdAt: -1 });

    res.json({ templates });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ message: 'Error getting templates' });
  }
};

// Create template
export const createTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, category, message } = req.body;

    const template = new Template({
      userId: req.user?._id,
      name,
      category: category || 'custom',
      message,
      isSystem: false,
    });

    await template.save();

    res.status(201).json({
      message: 'Template created',
      template,
    });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ message: 'Error creating template' });
  }
};

// Update template
export const updateTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, category, message } = req.body;

    // Can only update own templates, not system ones
    const template = await Template.findOneAndUpdate(
      { _id: req.params.id, userId: req.user?._id, isSystem: false },
      { name, category, message },
      { new: true }
    );

    if (!template) {
      res.status(404).json({ message: 'Template not found or cannot be edited' });
      return;
    }

    res.json({ message: 'Template updated', template });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ message: 'Error updating template' });
  }
};

// Delete template
export const deleteTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const template = await Template.findOneAndDelete({
      _id: req.params.id,
      userId: req.user?._id,
      isSystem: false,
    });

    if (!template) {
      res.status(404).json({ message: 'Template not found or cannot be deleted' });
      return;
    }

    res.json({ message: 'Template deleted' });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ message: 'Error deleting template' });
  }
};
