import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import aiRoutes from './aiRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/ai', aiRoutes);

export default router;
