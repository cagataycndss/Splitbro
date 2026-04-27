import express from 'express';
import * as groupController from '../controllers/groupController.js';
import * as expenseController from '../controllers/expenseController.js';
import * as authMiddleware from '../middlewares/authMiddleware.js';
import validate from '../middlewares/validate.js';
import { createGroupSchema, updateGroupSchema, addMemberSchema } from '../validations/groupValidation.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();


router.use(authMiddleware.protectUser);

router.post('/', validate(createGroupSchema), groupController.createGroup);

router
  .route('/:groupId')
  .get(groupController.getGroupDetails)
  .put(authMiddleware.restrictToGroupOwner, validate(updateGroupSchema), groupController.updateGroup)  
  .delete(authMiddleware.restrictToGroupOwner, groupController.deleteGroup); 

router
  .route('/:groupId/members')
  .post(validate(addMemberSchema), groupController.addMember)
  .get(groupController.getMembers);

router.post('/:groupId/members/guest', groupController.addGuest);

router
  .route('/:groupId/members/:userId')
  .delete(groupController.removeMember);


router.post('/:groupId/expenses', expenseController.createManualExpense);
router.post('/:groupId/expenses/scan', upload.single('receipt'), groupController.scanAndAddExpense);
router.get('/:groupId/calculate', groupController.calculateGroupDebts);
router.post('/:groupId/settle', groupController.settleDebt);

export default router;
