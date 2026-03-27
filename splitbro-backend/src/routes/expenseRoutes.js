const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');

// Not: OpenAPI sözleşmende "security: - bearerAuth: []" kuralı var.
// Yani bu rotalara sadece giriş yapmış (token'ı olan) kullanıcılar erişebilir.
// Furkan kendi auth kısmını bitirdiğinde, onun yazacağı middleware'i buraya ekleyeceğiz:
// const verifyToken = require('../middlewares/authMiddleware');
// router.use(verifyToken); // Bu satır, aşağıdaki tüm rotalara güvenlik duvarı çeker.

// 1. Gider Detayını Görüntüleme (GET /expenses/{expenseId})
router.get('/:expenseId', expenseController.getExpenseDetails);

// 2. Gider Silme (DELETE /expenses/{expenseId})
router.delete('/:expenseId', expenseController.deleteExpense);

// 3. Gidere Ürün Ekleme (POST /expenses/{expenseId}/items)
router.post('/:expenseId/items', expenseController.addItemToExpense);

// 4. Ürünü Kişilere Atama (POST /expenses/{expenseId}/items/{itemId}/split)
router.post('/:expenseId/items/:itemId/split', expenseController.splitExpenseItem);

// 5. Otomatik Borç Hesaplama (GET /expenses/{expenseId}/calculate)
router.get('/:expenseId/calculate', expenseController.calculateDebts);

module.exports = router;