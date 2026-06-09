import express from 'express';
import { verifyPrice, categorizeItems, getCategorizationStatus, getVerificationStatus } from '../controllers/aiController.js';
import validate from '../middlewares/validate.js';
import { verifyPriceSchema } from '../validations/aiValidation.js';

const router = express.Router();

router.post('/verify-price', validate(verifyPriceSchema), verifyPrice);
// Furkan Kasalak – Fiyat doğrulama durumu sorgulama
router.get('/verify-price/:jobId', getVerificationStatus);
router.post('/item-categorization', categorizeItems);
router.get('/item-categorization/:jobId', getCategorizationStatus);

export default router;
