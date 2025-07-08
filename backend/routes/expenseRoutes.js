import express from 'express';
import { addExpense, getExpenseById, getPersonalExpenses } from '../controllers/expensesController.js';
import authMiddleware from '../middleware/auth.js';
const router = express.Router();

router.post('/add-expense',authMiddleware,addExpense);
router.get("/get-personal",authMiddleware,getPersonalExpenses);
router.get("/get-expense-id/:expenseId",authMiddleware,getExpenseById);

export default router;