import { Router } from 'express';
import Registration from '../models/Registration.js';
import { authenticate, optionalAuthenticate, requireAdmin } from '../middleware/auth.js';
import User from '../models/User.js';

const router = Router();
const requiredText = value => typeof value === 'string' && value.trim().length > 0;

router.post('/', optionalAuthenticate, async (req, res) => {
  try {
    const { fullName, email, phone, city, age, eventId, eventTitle, category, emergencyContact, consent } = req.body || {};
    if (![fullName, email, phone, city, eventId, eventTitle].every(requiredText) || age === undefined || !consent) {
      return res.status(400).json({ message: 'Please complete all required fields and accept the consent statement.' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return res.status(400).json({ message: 'Enter a valid email address.' });
    const parsedAge = Number(age);
    if (!Number.isInteger(parsedAge) || parsedAge < 5 || parsedAge > 100) return res.status(400).json({ message: 'Age must be between 5 and 100.' });
    let userId = null;
    if (req.authPayload?.sub) {
      const user = await User.findById(req.authPayload.sub).select('_id email');
      if (user && user.email === normalizedEmail) userId = user._id;
      else if (user) return res.status(400).json({ message: 'Use the email address connected to your signed-in account.' });
    }
    const registration = await Registration.create({ fullName: fullName.trim(), email: normalizedEmail, phone: phone.trim(), city: city.trim(), age: parsedAge, eventId: eventId.trim(), eventTitle: eventTitle.trim(), category, emergencyContact, consent: true, user: userId, status: 'pending' });
    return res.status(201).json({ message: 'Registration saved.', registrationId: registration._id });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ message: 'This email is already registered for this event.' });
    if (error?.name === 'ValidationError') return res.status(400).json({ message: 'Some form details are invalid.' });
    console.error('Registration create failed:', error.message);
    return res.status(500).json({ message: 'Server error while saving registration.' });
  }
});

router.get('/mine', authenticate, async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json({ registrations });
  } catch (error) { res.status(500).json({ message: 'Could not load your registrations.' }); }
});

router.get('/admin', authenticate, requireAdmin, async (_req, res) => {
  try {
    const [registrations, total, pending, confirmed, cancelled] = await Promise.all([
      Registration.find().sort({ createdAt: -1 }).limit(500).lean(),
      Registration.countDocuments(),
      Registration.countDocuments({ status: 'pending' }),
      Registration.countDocuments({ status: 'confirmed' }),
      Registration.countDocuments({ status: 'cancelled' }),
    ]);
    res.json({ registrations, stats: { total, pending, confirmed, cancelled } });
  } catch { res.status(500).json({ message: 'Could not load admin dashboard.' }); }
});

router.patch('/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const status = req.body?.status;
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) return res.status(400).json({ message: 'Invalid registration status.' });
    const registration = await Registration.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!registration) return res.status(404).json({ message: 'Registration not found.' });
    res.json({ message: 'Registration status updated.', registration });
  } catch { res.status(500).json({ message: 'Could not update registration status.' }); }
});

export default router;
