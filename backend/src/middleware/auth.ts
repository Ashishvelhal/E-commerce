import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthRequest, IUser } from '../types';

interface DecodedToken {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

const getSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'fallback_secret' || secret.length < 32) {
    console.error('FATAL: JWT_SECRET is missing, too short, or uses the insecure default. Set a strong secret in .env');
    process.exit(1);
  }
  return secret;
};

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const secret = process.env.JWT_SECRET || '';
      const decoded = jwt.verify(token, secret) as DecodedToken;

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      if (decoded.role && decoded.role !== user.role) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      req.user = user as IUser;
      next();
    } catch (error) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }
};

export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Forbidden',
    });
  }
};

export const admin = adminOnly;

export { getSecret };
