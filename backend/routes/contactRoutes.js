import express from 'express';
import { addContact, deleteContact, getContacts } from '../controllers/contactController.js';
import authMiddleware from '../middleware/auth.js';
import { getExpensesBetweenUsers } from '../controllers/expensesController.js';
const router = express.Router();

router.post('/add-contact',authMiddleware, addContact);
router.get("/get-contacts",authMiddleware, getContacts);
router.post('/delete-contact',authMiddleware, deleteContact);
router.get("/contact/:userId",authMiddleware,getExpensesBetweenUsers);

export default router;