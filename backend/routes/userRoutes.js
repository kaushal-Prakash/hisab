import e from "express";
import { changeName, login, signout, signup } from "../controllers/userController.js";
import upload from "../middleware/upload.js";
import authMiddleware from "../middleware/auth.js";
const router = e.Router();

router.post("/signup",upload, signup);
router.post("/login",login);
router.get("/signout",signout);
router.post("/change-name",authMiddleware,changeName)

export default router;