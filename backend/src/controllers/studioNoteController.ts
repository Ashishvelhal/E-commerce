import { Request, Response } from 'express';
import { StudioNote } from '../models/StudioNote';

// Smart auto-categorization based on text content
export const detectCategory = (text: string): 'formula' | 'order_customization' | 'todo' | 'idea' | 'general' => {
  const lower = text.toLowerCase();

  if (
    lower.includes('pigment') ||
    lower.includes('mica') ||
    lower.includes('alcohol ink') ||
    lower.includes('ratio') ||
    lower.includes('part a') ||
    lower.includes('part b') ||
    lower.includes('epoxy') ||
    lower.includes('hardener') ||
    lower.includes('glitter') ||
    lower.includes('flakes') ||
    lower.includes('cure time')
  ) {
    return 'formula';
  }

  if (
    lower.includes('order') ||
    lower.includes('customer') ||
    lower.includes('client') ||
    lower.includes('custom') ||
    lower.includes('name plate') ||
    lower.includes('engrav') ||
    lower.includes('gift')
  ) {
    return 'order_customization';
  }

  if (
    lower.includes('todo') ||
    lower.includes('to-do') ||
    lower.includes('to do') ||
    lower.includes('remind') ||
    lower.includes('demold') ||
    lower.includes('sand') ||
    lower.includes('polish') ||
    lower.includes('package') ||
    lower.includes('reorder') ||
    lower.includes('clean') ||
    lower.includes('check')
  ) {
    return 'todo';
  }

  if (
    lower.includes('idea') ||
    lower.includes('concept') ||
    lower.includes('design') ||
    lower.includes('new product') ||
    lower.includes('try') ||
    lower.includes('future')
  ) {
    return 'idea';
  }

  return 'general';
};

// Helper to auto-generate concise title
const generateTitle = (text: string): string => {
  const clean = text.replace(/^note down:?|^take a note:?|^write:?|^remind me to:?/i, '').trim();
  const words = clean.split(' ');
  if (words.length <= 6) return clean;
  return words.slice(0, 6).join(' ') + '...';
};

// @desc    Create a new studio note (manual or voice)
// @route   POST /api/studio-notes
// @access  Private/Admin
export const createStudioNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { content, title, category, priority, productType, rawResinGramsDeducted, materialCost, tags } = req.body;

    if (!content || !content.trim()) {
      res.status(400).json({ success: false, message: 'Note content is required' });
      return;
    }

    const autoCategory = category || detectCategory(content);
    const autoTitle = title || generateTitle(content);

    const note = await StudioNote.create({
      title: autoTitle,
      content: content.trim(),
      category: autoCategory,
      priority: priority || (autoCategory === 'todo' ? 'high' : 'medium'),
      productType: productType || '',
      rawResinGramsDeducted: rawResinGramsDeducted || 0,
      materialCost: materialCost || 0,
      tags: tags || [],
      author: (req as any).user?.name || 'Admin Partner',
    });

    res.status(201).json({
      success: true,
      message: 'Studio note recorded successfully',
      data: note,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Get all studio notes with filtering and search
// @route   GET /api/studio-notes
// @access  Private/Admin
export const getStudioNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, isCompleted, search, pinnedOnly } = req.query;

    const query: any = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (isCompleted !== undefined) {
      query.isCompleted = isCompleted === 'true';
    }

    if (pinnedOnly === 'true') {
      query.isPinned = true;
    }

    if (search && typeof search === 'string' && search.trim()) {
      const regex = new RegExp(search.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');
      query.$or = [{ title: regex }, { content: regex }, { tags: regex }, { productType: regex }];
    }

    // Pinned notes first, then latest created
    const notes = await StudioNote.find(query).sort({ isPinned: -1, createdAt: -1 });

    const totalCount = await StudioNote.countDocuments();
    const uncompletedTodoCount = await StudioNote.countDocuments({ category: 'todo', isCompleted: false });

    res.json({
      success: true,
      count: notes.length,
      uncompletedTodoCount,
      totalCount,
      data: notes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Get latest studio note (for "Read my last note" voice command)
// @route   GET /api/studio-notes/latest
// @access  Private/Admin
export const getLatestStudioNote = async (_req: Request, res: Response): Promise<void> => {
  try {
    const note = await StudioNote.findOne().sort({ createdAt: -1 });
    if (!note) {
      res.status(404).json({ success: false, message: 'No studio notes found' });
      return;
    }

    res.json({
      success: true,
      data: note,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Toggle completion status of a note / task
// @route   PATCH /api/studio-notes/:id/toggle-complete
// @access  Private/Admin
export const toggleNoteComplete = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const note = await StudioNote.findById(id);

    if (!note) {
      res.status(404).json({ success: false, message: 'Studio note not found' });
      return;
    }

    note.isCompleted = !note.isCompleted;
    await note.save();

    res.json({
      success: true,
      message: `Note marked as ${note.isCompleted ? 'completed' : 'pending'}`,
      data: note,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Toggle pin status of a note
// @route   PATCH /api/studio-notes/:id/toggle-pin
// @access  Private/Admin
export const toggleNotePin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const note = await StudioNote.findById(id);

    if (!note) {
      res.status(404).json({ success: false, message: 'Studio note not found' });
      return;
    }

    note.isPinned = !note.isPinned;
    await note.save();

    res.json({
      success: true,
      message: `Note ${note.isPinned ? 'pinned to top' : 'unpinned'}`,
      data: note,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Update a studio note
// @route   PUT /api/studio-notes/:id
// @access  Private/Admin
export const updateStudioNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, content, category, priority, isCompleted, isPinned, tags, productType } = req.body;

    const note = await StudioNote.findById(id);
    if (!note) {
      res.status(404).json({ success: false, message: 'Studio note not found' });
      return;
    }

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (category !== undefined) note.category = category;
    if (priority !== undefined) note.priority = priority;
    if (isCompleted !== undefined) note.isCompleted = isCompleted;
    if (isPinned !== undefined) note.isPinned = isPinned;
    if (tags !== undefined) note.tags = tags;
    if (productType !== undefined) note.productType = productType;

    await note.save();

    res.json({
      success: true,
      message: 'Studio note updated',
      data: note,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Delete a studio note
// @route   DELETE /api/studio-notes/:id
// @access  Private/Admin
export const deleteStudioNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const note = await StudioNote.findByIdAndDelete(id);

    if (!note) {
      res.status(404).json({ success: false, message: 'Studio note not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Studio note deleted successfully',
      data: { id },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
