import Otp from "../models/Otp.js";
import mailTransporter from "../services/nodemailer.js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
dotenv.config();

const createOtp = async (req, res) => {
  const email  = req.user?.email;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(otpCode,10);

  try {
    // Remove previous OTPs for the same email
    await Otp.deleteMany({ email });

    // Save new OTP
    await Otp.create({ email, otp: hashedOtp });

    // Send email

    await mailTransporter.sendMail({
      from: "Hisab",
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otpCode}. It will expire in 10 minutes.`
    });

    res.status(200).json({ message: "OTP sent to email" });

  } catch (error) {
    console.error("Create OTP error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

const verifyOtp = async (req, res) => {
  const { otp } = req.body;
  const email = req.user?.email;

  if (!otp || !email) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    const existingOtp = await Otp.findOne({ email });

    if (!existingOtp) {
      return res.status(400).json({ message: "OTP not found or expired" });
    }

    const matched = await bcrypt.compare(otp, existingOtp.otp); //compare hashed OTP

    if (!matched) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await Otp.deleteMany({ email }); // delete used OTP
    res.status(200).json({ message: "OTP verified successfully" });

  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "OTP verification failed" });
  }
};

export { createOtp, verifyOtp };