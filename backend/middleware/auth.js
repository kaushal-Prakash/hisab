import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authMiddleware = async (req, res, next) => {
  try {
    const cookie = req.headers.cookie;
    if (!cookie) {
      return res.status(401).json({
        isAuthenticated: false,
        message: "Not authorized - No cookie found"
      });
    }

    // Extract token using regex or split
    const token = cookie
      .split(';')
      .find(c => c.trim().startsWith('token='))
      ?.split('=')[1];

    if (!token) {
      return res.status(401).json({
        isAuthenticated: false,
        message: "Not authorized - Token not found in cookie"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        isAuthenticated: false,
        message: "User not found"
      });
    }

    req.user = { userId: user._id }; 

    next();

  } catch (error) {
    console.error('JWT Error:', error.message);
    res.status(401).json({
      isAuthenticated: false,
      message: error.message.includes('jwt expired')
        ? "Session expired. Please login again."
        : "Invalid token"
    });
  }
};

export default authMiddleware;
