import express from "express";
import {
    addPersonalSettlement,
  addSettlement,
  getGroupSettlements,
} from "../controllers/settlementController.js";
import authMiddleware from "../middleware/auth.js";
const router = express.Router();

router.post("/add", authMiddleware, addSettlement);
router.get("/group/:groupId", authMiddleware, getGroupSettlements);
router.post("/add-personal-settlement", authMiddleware, addPersonalSettlement);

export default router;
