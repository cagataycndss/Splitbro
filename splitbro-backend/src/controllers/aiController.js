import * as aiService from '../services/aiService.js';
import catchAsync from '../utils/catchAsync.js';


export const categorizeItems = catchAsync(async (req, res) => {
  const { itemsList } = req.body;
  const result = await aiService.categorizeItemsWithAI(itemsList);
  res.status(200).json({ data: result });
});
