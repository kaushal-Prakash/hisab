import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // OTP will expire after 600 seconds = 10 minutes
  }
});

// Create new model if not exists
// Otherwise use existing model
export default mongoose.model.user || mongoose.model('Otp', otpSchema);
