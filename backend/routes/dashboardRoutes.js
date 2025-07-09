import express from "express";
import authMiddleware from "../middleware/auth.js";
import { getDashboardData, getMonthlySpending, getTotalSpent } from "../controllers/dashboardController.js";
const router = express.Router();

router.get("/get-dashboard-data", authMiddleware, getDashboardData);
router.get("/get-total-year-spent", authMiddleware, getTotalSpent);
router.get("/get-total-monthly-spent", authMiddleware, getMonthlySpending);

export default router;