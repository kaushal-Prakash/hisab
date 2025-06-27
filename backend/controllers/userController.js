import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";
import ImageKit from "imagekit";
import { console } from "inspector";

dotenv.config();
const SECRET = process.env.JWT_SECRET;

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// Helper to create JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, SECRET, { expiresIn: "7d" });
};

// Helper to convert file to base64
const fileToBase64 = (file) => file.buffer.toString("base64");

// Helper to upload photo to ImageKit
const uploadPhoto = async (file, name) => {
  try {
    const response = await imagekit.upload({
      file: fileToBase64(file),
      fileName: `${name}-${Date.now()}.jpg`,
      folder: "/hisab-profile-photos",
    });
    return response.url;
  } catch (error) {
    console.error("Image upload error:", error);
    throw new Error("Failed to upload image");
  }
};

// SIGNUP
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const photo = req.file; // Now using multer file object

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    let photoUrl = null;
    if (photo) {
      // Upload photo to ImageKit if provided
      photoUrl = await uploadPhoto(photo, name);
    }

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      photo: photoUrl,
    });

    const token = generateToken(newUser._id);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "User registered",
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      message: error.message || "Internal Server Error",
    });
  }
};

// LOGIN remains the same
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const signout = (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({ message: "User logged out successfully!" });
  } catch (error) {
    console.error("Error in user logout: ", error);
    res.status(500).json({ message: "Server error during logout" });
  }
};

const changeName = async (req, res) => {
  try {
    // Check if req.user exists
    if (!req.user) {
      console.log("req.user is undefined");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.userId;
    const newName = req.body?.newName;

    if (!newName) {
      return res.status(400).json({ message: "New name is required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name: newName },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Updated User ✅:", updatedUser);

    res.status(200).json({
      message: "Name updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("❌ Name change error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export { signup, login, signout, changeName };
