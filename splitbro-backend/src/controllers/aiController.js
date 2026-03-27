import * as aiService from '../services/aiService.js';
import catchAsync from '../utils/catchAsync.js';

export const verifyPrice = catchAsync(async (req, res) => {
  const { itemName, price } = req.body;
  const result = await aiService.verifyPriceWithAI(itemName, price);
  res.status(200).json({ data: result });
});
