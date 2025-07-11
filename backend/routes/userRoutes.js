import e from "express";
import { changeName, changePassword, changePhoto, getUser, isAuthenticated, login, signout, signup } from "../controllers/userController.js";
import upload from "../middleware/upload.js";
import authMiddleware from "../middleware/auth.js";
import { createOtp, verifyOtp } from "../controllers/otpController.js";
const router = e.Router();

router.post("/signup",upload, signup);
router.post("/login",login);
router.get("/signout",signout);
router.post("/change-name",authMiddleware,changeName)
router.post("/change-password",authMiddleware,changePassword);
router.get("/create-otp",authMiddleware,createOtp);
router.post("/verify-otp",authMiddleware,verifyOtp);
router.post("/change-photo",authMiddleware,upload, changePhoto);
router.get("/is-authenticated",authMiddleware, isAuthenticated);
router.get("/get-user",authMiddleware, getUser);

export default router;