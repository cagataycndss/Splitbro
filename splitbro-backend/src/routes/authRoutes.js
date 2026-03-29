import express from 'express';
import { register, login } from '../controllers/authController.js';
import validate from '../middlewares/validate.js';
import { registerSchema, loginSchema } from '../validations/authValidation.js';

const router = express.Router();

// Geliştiren: Furkan Kasalak (Kullanıcı Kaydı)
router.post('/register', validate(registerSchema), register);
// Geliştiren: Furkan Kasalak (Kullanıcı Girişi)
router.post('/login', validate(loginSchema), login);

export default router;
