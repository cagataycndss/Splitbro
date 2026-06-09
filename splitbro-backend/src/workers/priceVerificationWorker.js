import { getChannel } from '../config/rabbitmq.js';
import AiJob from '../models/AiJob.js';
import { verifyPriceWithAI } from '../services/aiService.js';

export const startPriceVerificationWorker = async () => {
  try {
    const channel = getChannel();
    const queue = 'ai_price_verification_queue';

    console.log(`Price Verification Worker listening to queue: ${queue}`);

    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const payload = JSON.parse(msg.content.toString());
        const { jobId, itemName, price } = payload;

        try {
          await AiJob.findByIdAndUpdate(jobId, { status: 'processing' });

          const result = await verifyPriceWithAI(itemName, price);

          await AiJob.findByIdAndUpdate(jobId, {
            status: 'completed',
            result: result
          });

          channel.ack(msg);
        } catch (error) {
          console.error(`Price Verification Worker Error for Job ${jobId}:`, error);
          await AiJob.findByIdAndUpdate(jobId, {
            status: 'failed',
            error: error.message || 'Fiyat doğrulama sırasında bilinmeyen bir hata oluştu'
          });
          channel.reject(msg, false);
        }
      }
    });
  } catch (err) {
    console.error('Failed to start Price Verification Worker:', err);
  }
};
