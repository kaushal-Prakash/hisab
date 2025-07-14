import e from "express";
import {
  addMember,
  createGroup,
  deleteGroup,
  getUserGroups,
  getGroupExpenses
} from "../controllers/groupController.js";
import authMiddleware from "../middleware/auth.js";
const router = e.Router();

router.get("/get-user-groups", authMiddleware, getUserGroups);
router.post("/add-member", authMiddleware, addMember);
router.post("/create-group",authMiddleware, createGroup);
router.post("/delete-group",authMiddleware, deleteGroup);
router.get("/get-group-expenses/:groupId",authMiddleware, getGroupExpenses);

export default router;
