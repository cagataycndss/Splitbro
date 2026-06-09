import { getChannel } from '../config/rabbitmq.js';
import AiJob from '../models/AiJob.js';
import Expense from '../models/Expense.js';
import Group from '../models/Group.js';
import { scanReceiptWithAI } from '../services/aiScannerService.js';
import { invalidateGroupDebtsCache } from '../services/groupService.js';

export const startReceiptScanWorker = async () => {
  try {
    const channel = getChannel();
    const queue = 'ai_receipt_scan_queue';

    console.log(`[Gökdeniz] Receipt Scan Worker listening to queue: ${queue}`);

    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const payload = JSON.parse(msg.content.toString());
        const { jobId, groupId, paidById, imageData } = payload;

        try {
          await AiJob.findByIdAndUpdate(jobId, { status: 'processing' });

          const group = await Group.findById(groupId);
          if (!group) {
            throw new Error('Grup bulunamadı! İşlem iptal edildi.');
          }
          
          const aiResult = await scanReceiptWithAI(imageData);

          if (!aiResult.success) {
            throw new Error('Fiş/Fatura okunurken bir hata oluştu.');
          }

          const { title, amount, confidenceScore, ocrText } = aiResult.extractedData;

          const newExpense = await Expense.create({
            title,
            totalAmount: amount,
            paidById: paidById,
            groupId: groupId,
            receiptData: {
              imageUrl: imageData.startsWith('data:') ? '[base64-image]' : imageData,
              confidenceScore,
              ocrText
            }
          });

          await invalidateGroupDebtsCache(groupId);

          await AiJob.findByIdAndUpdate(jobId, {
            status: 'completed',
            result: {
              expenseId: newExpense._id,
              title: newExpense.title,
              totalAmount: newExpense.totalAmount,
              confidenceScore,
              ocrText
            }
          });

          channel.ack(msg);
        } catch (error) {
          console.error(`Receipt Scan Worker Error for Job ${jobId}:`, error);
          await AiJob.findByIdAndUpdate(jobId, {
            status: 'failed',
            error: error.message || 'Fiş okuma sırasında bilinmeyen bir hata oluştu'
          });
          channel.reject(msg, false);
        }
      }
    });
  } catch (err) {
    console.error('Failed to start Receipt Scan Worker:', err);
  }
};