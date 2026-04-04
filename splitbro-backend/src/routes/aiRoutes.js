import express from 'express';
import { verifyPrice, categorizeItems } from '../controllers/aiController.js';
import validate from '../middlewares/validate.js';
import { verifyPriceSchema } from '../validations/aiValidation.js';

const router = express.Router();

router.post('/verify-price', validate(verifyPriceSchema), verifyPrice);
router.post('/item-categorization', categorizeItems);

export default router;
