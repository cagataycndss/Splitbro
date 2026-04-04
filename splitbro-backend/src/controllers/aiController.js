import * as aiService from '../services/aiService.js';
import catchAsync from '../utils/catchAsync.js';

export const verifyPrice = catchAsync(async (req, res) => {
  const { items } = req.body;
  if (!items || items.length === 0) {
    return res.status(400).json({ status: 'fail', message: 'Doğrulanacak ürün bulunamadı' });
  }
  // Simplified since aiService assumes a single item verify, but keeping it flexible
  const result = await aiService.verifyPriceWithAI(items[0].name, items[0].price);
  res.status(200).json({ data: result });
});

export const categorizeItems = catchAsync(async (req, res) => {
  const { itemsList } = req.body;
  const result = await aiService.categorizeItemsWithAI(itemsList);
  res.status(200).json({ data: result });
});
