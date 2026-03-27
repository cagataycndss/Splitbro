import express from 'express';
import { verifyPrice } from '../controllers/aiController.js';
import validate from '../middlewares/validate.js';
import { verifyPriceSchema } from '../validations/aiValidation.js';

const router = express.Router();

router.post('/verify-price', validate(verifyPriceSchema), verifyPrice);

export default router;
