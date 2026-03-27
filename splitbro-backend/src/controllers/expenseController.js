const Expense = require('../models/Expense');
const Expense = require('../models/Expense');
const expenseService = require('../services/expenseService');

// 1. Gider Detayını Görüntüleme (GET /expenses/:expenseId)
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

// 2. Gider Silme (DELETE /expenses/:expenseId)
exports.deleteExpense = async (req, res) => {
    try {
        const deletedExpense = await Expense.findByIdAndDelete(req.params.expenseId);
        
        if (!deletedExpense) {
            return res.status(404).json({ message: "Silinecek gider bulunamadı" });
        }
        
        res.status(204).send(); // 204: Başarıyla silindi, içerik yok
    } catch (error) {
        res.status(500).json({ message: "Sunucu hatası", error: error.message });
    }
};

// 3. Gidere Ürün Ekleme (POST /expenses/:expenseId/items)
exports.addItemToExpense = async (req, res) => {
    try {
        const { name, price } = req.body;
        
        // $push operatörü ile doğrudan ana dökümanın içindeki items dizisine ekliyoruz
        const updatedExpense = await Expense.findByIdAndUpdate(
            req.params.expenseId,
            { 
                $push: { 
                    items: { name, price, assignedUserIds: [] } // Başlangıçta kimseye atanmamış
                } 
            },
            { new: true, runValidators: true } // new: true, bize verinin güncellenmiş halini döndürür
        );

        if (!updatedExpense) {
            return res.status(404).json({ message: "Gider bulunamadı" });
        }

        res.status(201).json(updatedExpense);
    } catch (error) {
        res.status(500).json({ code: "SERVER_ERROR", message: "Sunucu hatası" });
    }
};

// 4. Ürünü Kişilere Atama (POST /expenses/:expenseId/items/:itemId/split)
exports.splitExpenseItem = async (req, res) => {
    try {
        const { assignedUserIds } = req.body;

        // Önce doğru gideri (_id) ve içindeki doğru ürünü ("items._id") buluyoruz
        const updatedExpense = await Expense.findOneAndUpdate(
            { 
                _id: req.params.expenseId, 
                "items._id": req.params.itemId 
            },
            // items.$ kısmı, eşleşen o spesifik ürünün içine gir demek
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

// Otomatik Borç Hesaplama (GET /expenses/:expenseId/calculate)
exports.calculateDebts = async (req, res) => {
    try {
        // 1. Veritabanından ilgili gideri bul
        const expense = await Expense.findById(req.params.expenseId);

        if (!expense) {
            return res.status(404).json({ message: "Gider bulunamadı" });
        }

        // 2. Saf hesaplama işlemini Servis katmanına yaptır
        const calculatedDebts = expenseService.calculateDebtsForExpense(expense);

        // 3. Sonucu kullanıcıya (veya frontend'e) gönder
        res.status(200).json(calculatedDebts);
        
    } catch (error) {
        res.status(500).json({ code: "SERVER_ERROR", message: "Sunucu hatası" });
    }
};