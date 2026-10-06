import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User';
import { AuthRequest } from '../types';

const loginSchema = z.object({
  email:    z.string().email('Invalid email format').max(254),
  password: z.string().min(1, 'Password is required').max(128),
});

const registerSchema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
  email:    z.string().email('Invalid email format').max(254),
  password: z.string()
    .min(8,  'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

const generateAccessToken = (id: string, role: string): string => {
  const secret = process.env.JWT_SECRET || '';
  return jwt.sign({ id, role }, secret, { expiresIn: '15m' } as jwt.SignOptions);
};

const generateRefreshToken = (id: string, role: string): string => {
  const secret = process.env.JWT_SECRET || '';
  return jwt.sign({ id, role, isRefresh: true }, secret, { expiresIn: '7d' } as jwt.SignOptions);
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: parsed.error.errors[0].message,
      });
      return;
    }

    const { name, email, password } = parsed.data;

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      res.status(400).json({ success: false, message: 'An account with this email already exists' });
      return;
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'user',
    });

    const token = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString(), user.role);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      data: {
        _id:      user._id,
        name:     user.name,
        email:    user.email,
        role:     user.role,
        avatar:   user.avatar,
        wishlist: user.wishlist,
        token,
        refreshToken,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      await bcrypt.hash('dummy_timing_equalization', 10);
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const { email, password } = parsed.data;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      await bcrypt.hash('dummy_timing_equalization', 10);
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const token = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString(), user.role);

    res.json({
      success: true,
      message: 'Logged in successfully',
      data: {
        _id:       user._id,
        name:      user.name,
        email:     user.email,
        role:      user.role,
        avatar:    user.avatar,
        wishlist:  user.wishlist,
        addresses: user.addresses,
        token,
        refreshToken,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const secret = process.env.JWT_SECRET || '';
    const decoded = jwt.verify(refreshToken, secret) as { id: string; role: string; isRefresh?: boolean };

    if (!decoded.isRefresh) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const token = generateAccessToken(user._id.toString(), user.role);
    const newRefreshToken = generateRefreshToken(user._id.toString(), user.role);

    res.json({
      success: true,
      data: {
        token,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (req.body.name)     user.name   = String(req.body.name).trim().slice(0, 100);
    if (req.body.avatar)   user.avatar = String(req.body.avatar).slice(0, 500);
    if (req.body.phone !== undefined) user.phone = String(req.body.phone).slice(0, 20);
    if (req.body.addresses) user.addresses = req.body.addresses;

    if (req.body.password) {
      if (String(req.body.password).length < 8) {
        res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
        return;
      }
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id:       updatedUser._id,
        name:      updatedUser.name,
        email:     updatedUser.email,
        role:      updatedUser.role,
        avatar:    updatedUser.avatar,
        phone:     updatedUser.phone,
        addresses: updatedUser.addresses,
        wishlist:  updatedUser.wishlist,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const toggleWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { productId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const existsIndex = user.wishlist.findIndex((id) => id.toString() === productId);
    let action = 'added';

    if (existsIndex > -1) {
      user.wishlist.splice(existsIndex, 1);
      action = 'removed';
    } else {
      user.wishlist.push(productId as any);
    }

    await user.save();
    res.json({ success: true, message: `Product ${action} from wishlist`, data: user.wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
