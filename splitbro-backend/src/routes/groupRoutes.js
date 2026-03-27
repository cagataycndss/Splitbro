import express from 'express';
import * as groupController from '../controllers/groupController.js';
import * as authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

/** 
 * ---- GÜVENLİK (MİDDLEWARE) ----- 
 * Aşağıdaki bütüm route'lar sadece giris yapmıs bir "User" (protectUser) tarafindan ulasilabilir.
 */
router.use(authMiddleware.protectUser);

// [3. Grup Oluşturma]
router.post('/', groupController.createGroup);

// Grup ID Parametresi Gerektiren Endpointler
router
  .route('/:groupId')
  .put(authMiddleware.restrictToGroupOwner, groupController.updateGroup)   // [1. Güncelleme] - (SADECE OWNER)
  .delete(authMiddleware.restrictToGroupOwner, groupController.deleteGroup); // [2. Silme] - (SADECE OWNER)


// Grup Üyeleri Yönetimi Endpoints
router
  .route('/:groupId/members')
  .post(groupController.addMember) // [4. Üye Ekleme]
  .get(groupController.getMembers); // [5. Listeleme]

router
  .route('/:groupId/members/:userId')
  .delete(groupController.removeMember); // [6. Çıkarma] - (OWNER VEYA KENDİ İSTEĞİYLE AYRILMA)


// AI - Fiş Okuma
router.post('/:groupId/expenses/scan', groupController.scanAndAddExpense); // [7. Fiş Tarama]

export default router;
