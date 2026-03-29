import express from 'express';
import * as expenseController from '../controllers/expenseController.js';
import * as authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware.protectUser);

router.get('/:expenseId', expenseController.getExpenseDetails);
router.delete('/:expenseId', expenseController.deleteExpense);

router.post('/:expenseId/items', expenseController.addItemToExpense);
router.delete('/:expenseId/items/:itemId', expenseController.deleteItemFromExpense);
router.post('/:expenseId/items/:itemId/split', expenseController.splitExpenseItem);

router.get('/:expenseId/calculate', expenseController.calculateDebts);

export default router;