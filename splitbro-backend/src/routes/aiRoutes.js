import express from 'express';
import { verifyPrice, categorizeItems } from '../controllers/aiController.js';
import validate from '../middlewares/validate.js';
import { verifyPriceSchema } from '../validations/aiValidation.js';

const router = express.Router();

// Geliştiren: Furkan Kasalak
router.post('/verify-price', validate(verifyPriceSchema), verifyPrice);
// Geliştiren: Çağatay Candaş
router.post('/item-categorization', categorizeItems);

export default router;
