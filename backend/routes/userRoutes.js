import e from "express";
import { login, signout, signup } from "../controllers/userController.js";
import upload from "../middleware/upload.js";
const router = e.Router();

router.post("/signup",upload, signup);
router.post("/login",login);
router.get("/signout",signout);

export default router;