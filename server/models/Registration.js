import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 150 },
  phone: { type: String, required: true, trim: true, maxlength: 25 },
  city: { type: String, required: true, trim: true, maxlength: 100 },
  age: { type: Number, required: true, min: 5, max: 100 },
  eventId: { type: String, required: true, trim: true },
  eventTitle: { type: String, required: true, trim: true, maxlength: 150 },
  category: { type: String, default: 'Open', trim: true, maxlength: 40 },
  emergencyContact: { type: String, trim: true, maxlength: 100, default: '' },
  consent: { type: Boolean, required: true, validate: value => value === true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending', index: true },
}, { timestamps: true });

registrationSchema.index({ email: 1, eventId: 1 }, { unique: true });
export default mongoose.model('Registration', registrationSchema);
