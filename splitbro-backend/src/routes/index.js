import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import aiRoutes from './aiRoutes.js';
import groupRoutes from './groupRoutes.js';
import expenseRoutes from './expenseRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/ai', aiRoutes);
router.use('/groups', groupRoutes);
router.use('/expenses', expenseRoutes);

export default router;
