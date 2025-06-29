import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from cookies (using cookie-parser)
    const token = req.cookies?.token || req.cookies?.__session;
    if (!token) {
      return res.status(401).json({
        success: false,
        isAuthenticated: false,
        message: "Authorization denied - No token provided"
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded?.id) {
      return res.status(401).json({
        success: false,
        isAuthenticated: false,
        message: "Invalid token - User identifier missing"
      });
    }

    // Find user and exclude password
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        isAuthenticated: false,
        message: "User not found"
      });
    }

    // Attach user to request
    req.user = user;
    next();

  } catch (error) {
    console.error('Authentication Error:', error.message);
    return res.status(401).json({
      success: false,
      isAuthenticated: false,
      message: "Authorization denied - Invalid token"
    });
  }
};

export default authMiddleware;