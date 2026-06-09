import * as aiService from '../services/aiService.js';
import catchAsync from '../utils/catchAsync.js';

// Furkan Kasalak – AI Fiyat Doğrulama (RabbitMQ Asenkron)
export const verifyPrice = catchAsync(async (req, res) => {
  const { items } = req.body;
  if (!items || items.length === 0) {
    return res.status(400).json({ status: 'fail', message: 'Doğrulanacak ürün bulunamadı' });
  }

  const itemName = items[0].name;
  const price = items[0].price;

  // 1. Job oluştur
  const job = await AiJob.create({
    type: 'price_verification',
    itemName: itemName,
    itemPrice: price
  });

  // 2. RabbitMQ'ya mesaj gönder veya Direct Fallback uygula
  try {
    await publishMessage('ai_price_verification_queue', {
      jobId: job._id,
      itemName: itemName,
      price: price
    });
  } catch (error) {
    console.warn('[Furkan] RabbitMQ is not available for price verification, falling back to direct processing...', error.message);

    // Direct background processing fallback (non-blocking)
    (async () => {
      try {
        await AiJob.findByIdAndUpdate(job._id, { status: 'processing' });
        const result = await aiService.verifyPriceWithAI(itemName, price);
        await AiJob.findByIdAndUpdate(job._id, {
          status: 'completed',
          result: result
        });
        console.log(`[Furkan] Direct Price Verification Job ${job._id} completed successfully.`);
      } catch (err) {
        console.error('[Furkan] Direct Price Verification Fallback Error:', err);
        await AiJob.findByIdAndUpdate(job._id, {
          status: 'failed',
          error: err.message || 'Bilinmeyen bir hata oluştu'
        });
      }
    })();
  }

  // 3. İstemciye Job ID dön
  res.status(202).json({
    status: 'success',
    message: 'AI fiyat doğrulama işlemi sıraya alındı.',
    jobId: job._id
  });
});

// Furkan Kasalak – Fiyat Doğrulama Durumu Sorgulama
export const getVerificationStatus = catchAsync(async (req, res) => {
  const { jobId } = req.params;
  const job = await AiJob.findById(jobId);

  if (!job) {
    return res.status(404).json({ status: 'fail', message: 'İşlem bulunamadı' });
  }

  res.status(200).json({ status: 'success', data: job });
});

import AiJob from '../models/AiJob.js';
import { publishMessage } from '../config/rabbitmq.js';

export const categorizeItems = catchAsync(async (req, res) => {
  const { itemsList } = req.body;
  if (!itemsList || itemsList.length === 0) {
    return res.status(400).json({ status: 'fail', message: 'Kategorize edilecek ürün listesi boş olamaz.' });
  }

  // 1. Job oluştur
  const job = await AiJob.create({ type: 'categorization' });

  // 2. RabbitMQ'ya mesaj gönder veya Direct Fallback uygula
  try {
    await publishMessage('ai_categorization_queue', {
      jobId: job._id,
      itemsList: itemsList
    });
  } catch (error) {
    console.warn('RabbitMQ or AI Worker is not available, falling back to direct background processing...', error.message);
    
    // Direct background processing fallback (non-blocking)
    (async () => {
      try {
        await AiJob.findByIdAndUpdate(job._id, { status: 'processing' });
        
        const { categorizeItemsWithAI } = await import('../services/aiService.js');
        const result = await categorizeItemsWithAI(itemsList);
        
        await AiJob.findByIdAndUpdate(job._id, {
          status: 'completed',
          result: result
        });
        console.log(`Direct AI Categorization Job ${job._id} completed successfully.`);
      } catch (err) {
        console.error('AI Direct Fallback Processing Error:', err);
        await AiJob.findByIdAndUpdate(job._id, {
          status: 'failed',
          error: err.message || 'Bilinmeyen bir hata oluştu'
        });
      }
    })();
  }

  // 3. İstemciye Job ID dön
  res.status(202).json({
    status: 'success',
    message: 'AI kategorizasyon işlemi sıraya alındı.',
    jobId: job._id
  });
});


export const getCategorizationStatus = catchAsync(async (req, res) => {
  const { jobId } = req.params;
  const job = await AiJob.findById(jobId);

  if (!job) {
    return res.status(404).json({ status: 'fail', message: 'İşlem bulunamadı' });
  }

  res.status(200).json({ status: 'success', data: job });
});

