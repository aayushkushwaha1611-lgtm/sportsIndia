import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function authenticate(req, res, next) {
  try {
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Please sign in to continue.' });
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'development-only-change-this-secret');
    const user = await User.findById(payload.sub).select('name email role');
    if (!user) return res.status(401).json({ message: 'Account not found. Please sign in again.' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Your session expired. Please sign in again.' });
  }
}

export function optionalAuthenticate(req, res, next) {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7) : null;
  if (!token) return next();
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'development-only-change-this-secret');
    req.authPayload = payload;
  } catch { /* Public registration remains available if no valid session is supplied. */ }
  next();
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin access is required.' });
  next();
}
