import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const tokenFor = user => jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET || 'development-only-change-this-secret', { expiresIn: '7d' });
const publicUser = user => ({ id: user._id, name: user.name, email: user.email, role: user.role });

router.post('/signup', async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    if (name.length < 2 || name.length > 100) return res.status(400).json({ message: 'Name must be between 2 and 100 characters.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Enter a valid email address.' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must contain at least 8 characters.' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'An account with this email already exists.' });
    const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12), role: 'user' });
    return res.status(201).json({ token: tokenFor(user), user: publicUser(user) });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ message: 'An account with this email already exists.' });
    console.error('Signup failed:', error.message);
    return res.status(500).json({ message: 'Could not create account right now.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: 'Email or password is incorrect.' });
    return res.json({ token: tokenFor(user), user: publicUser(user) });
  } catch (error) {
    console.error('Login failed:', error.message);
    return res.status(500).json({ message: 'Could not sign in right now.' });
  }
});

router.get('/me', authenticate, (req, res) => res.json({ user: publicUser(req.user) }));
export default router;
