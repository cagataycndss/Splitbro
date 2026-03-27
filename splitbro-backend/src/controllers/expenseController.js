const Expense = require('../models/Expense');
const Expense = require('../models/Expense');
const expenseService = require('../services/expenseService');

exports.getExpenseDetails = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.expenseId);
        
        if (!expense) {
            return res.status(404).json({ message: "Gider bulunamadı" });
        }
        
        res.status(200).json(expense);
    } catch (error) {
        res.status(500).json({ message: "Sunucu hatası", error: error.message });
    }
};

exports.deleteExpense = async (req, res) => {
    try {
        const deletedExpense = await Expense.findByIdAndDelete(req.params.expenseId);
        
        if (!deletedExpense) {
            return res.status(404).json({ message: "Silinecek gider bulunamadı" });
        }
        
        res.status(204).send(); 
        } catch (error) {
        res.status(500).json({ message: "Sunucu hatası", error: error.message });
    }
};


exports.addItemToExpense = async (req, res) => {
    try {
        const { name, price } = req.body;
        

        const updatedExpense = await Expense.findByIdAndUpdate(
            req.params.expenseId,
            { 
                $push: { 
                    items: { name, price, assignedUserIds: [] }
                } 
            },
            { new: true, runValidators: true } 
        );

        if (!updatedExpense) {
            return res.status(404).json({ message: "Gider bulunamadı" });
        }

        res.status(201).json(updatedExpense);
    } catch (error) {
        res.status(500).json({ code: "SERVER_ERROR", message: "Sunucu hatası" });
    }
};

exports.splitExpenseItem = async (req, res) => {
    try {
        const { assignedUserIds } = req.body;

        const updatedExpense = await Expense.findOneAndUpdate(
            { 
                _id: req.params.expenseId, 
                "items._id": req.params.itemId 
            },
            { 
                $set: { "items.$.assignedUserIds": assignedUserIds } 
            },
            { new: true }
        );

        if (!updatedExpense) {
            return res.status(404).json({ message: "Gider veya ürün bulunamadı" });
        }

        res.status(200).json({ message: "Ürün başarıyla paylaştırıldı" });
    } catch (error) {
        res.status(500).json({ code: "SERVER_ERROR", message: "Sunucu hatası" });
    }
};

exports.calculateDebts = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.expenseId);

        if (!expense) {
            return res.status(404).json({ message: "Gider bulunamadı" });
        }

        const calculatedDebts = expenseService.calculateDebtsForExpense(expense);

        res.status(200).json(calculatedDebts);
        
    } catch (error) {
        res.status(500).json({ code: "SERVER_ERROR", message: "Sunucu hatası" });
    }
};