import express from 'express';
import { 
  getProfile, 
  changePassword, 
  deleteAccount, 
  uploadUserAvatar, 
  getUserGroups 
} from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';
import validate from '../middlewares/validate.js';
import { changePasswordSchema } from '../validations/userValidation.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Apply protect middleware to all routes inside users
router.use(protect);

router.get('/:userId/profile', getProfile);
router.put('/:userId/change-password', validate(changePasswordSchema), changePassword);
router.delete('/:userId/account', deleteAccount);
router.post('/:userId/avatar', upload.single('avatar'), uploadUserAvatar);
router.get('/:userId/groups', getUserGroups);

export default router;
