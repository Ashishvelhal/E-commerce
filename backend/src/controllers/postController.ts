import { Request, Response } from 'express';
import { Post } from '../models/Post';
import { AuthRequest } from '../types';

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

// @desc    Get all published posts / announcements
// @route   GET /api/posts
// @access  Public
export const getPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, tag, search, all } = req.query;
    const query: any = {};

    if (all !== 'true') {
      query.isPublished = true;
    }

    if (category) {
      query.category = category;
    }

    if (tag) {
      query.tags = tag;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
      ];
    }

    const posts = await Post.find(query)
      .populate('author', 'name avatar')
      .populate('featuredProduct', 'title slug thumbnail price')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Get post by slug or ID
// @route   GET /api/posts/:identifier
// @access  Public
export const getPostByIdentifier = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier } = req.params;
    let post;

    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      post = await Post.findById(identifier)
        .populate('author', 'name avatar')
        .populate('featuredProduct');
    } else {
      post = await Post.findOne({ slug: identifier })
        .populate('author', 'name avatar')
        .populate('featuredProduct');
    }

    if (!post) {
      res.status(404).json({ success: false, message: 'Post not found' });
      return;
    }

    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Create a new post/announcement (Admin only)
// @route   POST /api/posts
// @access  Private/Admin
export const createPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { title, content, summary, bannerImage, category, tags, isPublished, featuredProduct } = req.body;

    let slug = slugify(title);
    const existing = await Post.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const post = await Post.create({
      title,
      slug,
      content,
      summary,
      bannerImage: bannerImage || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80',
      author: req.user._id,
      category: category || 'Updates',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map((t: string) => t.trim()) : []),
      isPublished: isPublished !== undefined ? isPublished : true,
      featuredProduct: featuredProduct || null,
    });

    const populated = await Post.findById(post._id).populate('author', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Update a post (Admin only)
// @route   PUT /api/posts/:id
// @access  Private/Admin
export const updatePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    let post = await Post.findById(id);

    if (!post) {
      res.status(404).json({ success: false, message: 'Post not found' });
      return;
    }

    if (req.body.title && req.body.title !== post.title) {
      req.body.slug = `${slugify(req.body.title)}-${Date.now().toString().slice(-4)}`;
    }

    if (typeof req.body.tags === 'string') {
      req.body.tags = req.body.tags.split(',').map((t: string) => t.trim());
    }

    post = await Post.findByIdAndUpdate(id, req.body, { new: true });

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: post,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Delete a post (Admin only)
// @route   DELETE /api/posts/:id
// @access  Private/Admin
export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      res.status(404).json({ success: false, message: 'Post not found' });
      return;
    }
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
