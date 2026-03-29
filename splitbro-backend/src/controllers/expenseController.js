import catchAsync from '../utils/catchAsync.js';
import Expense from '../models/Expense.js';
import * as expenseService from '../services/expenseService.js';

export const createManualExpense = catchAsync(async (req, res) => {
    const { groupId } = req.params;
    const paidById = req.body.paidById || req.user._id;

    const newExpense = await expenseService.createManualExpenseService(groupId, paidById, req.body);

    res.status(201).json({
        status: 'success',
        message: 'Gider başarıyla eklendi',
        data: newExpense
    });
});

export const getExpenseDetails = catchAsync(async (req, res) => {
    const expense = await Expense.findById(req.params.expenseId)
        .populate('items.assignedUserIds', 'firstName lastName avatar')
        .populate('paidById', 'firstName lastName avatar');

    if (!expense) {
        return res.status(404).json({ message: "Gider bulunamadı" });
    }

    res.status(200).json({ status: 'success', data: expense });
});

export const deleteExpense = catchAsync(async (req, res) => {
    await expenseService.deleteExpenseService(req.params.expenseId, req.user._id);
    res.status(204).json({ status: 'success', data: null });
});

export const addItemToExpense = catchAsync(async (req, res) => {
    const updatedExpense = await expenseService.addItemToExpenseService(req.params.expenseId, req.body);
    res.status(201).json({ status: 'success', message: 'Ürün eklendi', data: updatedExpense });
});

export const deleteItemFromExpense = catchAsync(async (req, res) => {
    await expenseService.deleteItemFromExpenseService(req.params.expenseId, req.params.itemId);
    res.status(204).json({ status: 'success', data: null });
});

export const splitExpenseItem = catchAsync(async (req, res) => {
    const { assignedUserIds } = req.body;
    const updatedExpense = await expenseService.splitExpenseItemService(req.params.expenseId, req.params.itemId, assignedUserIds);
    res.status(200).json({ status: 'success', message: "Ürün başarıyla paylaştırıldı", data: updatedExpense });
});

export const calculateDebts = catchAsync(async (req, res) => {
    const expense = await Expense.findById(req.params.expenseId);
    if (!expense) {
        return res.status(404).json({ message: "Gider bulunamadı" });
    }

    const calculatedDebts = expenseService.calculateDebtsForExpense(expense);
    res.status(200).json({ status: 'success', data: calculatedDebts });
});