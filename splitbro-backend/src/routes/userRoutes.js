import express from 'express';
import { 
  getProfile, 
  updateProfile,
  changePassword, 
  deleteAccount, 
  uploadUserAvatar, 
  deleteUserAvatar,
  getUserGroups 
} from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';
import validate from '../middlewares/validate.js';
import { changePasswordSchema, updateProfileSchema } from '../validations/userValidation.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.use(protect);


router.put('/:userId', validate(updateProfileSchema), updateProfile);


router.post('/:userId/avatar', upload.single('avatar'), uploadUserAvatar);
router.put('/:userId/avatar', upload.single('avatar'), uploadUserAvatar); 




export default router;
