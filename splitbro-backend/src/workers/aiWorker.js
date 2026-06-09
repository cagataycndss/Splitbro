import { getChannel } from '../config/rabbitmq.js';
import AiJob from '../models/AiJob.js';
import { categorizeItemsWithAI } from '../services/aiService.js';

export const startAiWorker = async () => {
  try {
    const channel = getChannel();
    const queue = 'ai_categorization_queue';

    console.log(`Worker listening to queue: ${queue}`);

    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const payload = JSON.parse(msg.content.toString());
        const { jobId, itemsList } = payload;

        try {
          await AiJob.findByIdAndUpdate(jobId, { status: 'processing' });

          const result = await categorizeItemsWithAI(itemsList);

          await AiJob.findByIdAndUpdate(jobId, {
            status: 'completed',
            result: result
          });
          channel.ack(msg);
        } catch (error) {
          console.error(`AI Worker Error for Job ${jobId}:`, error);
          await AiJob.findByIdAndUpdate(jobId, {
            status: 'failed',
            error: error.message || 'Bilinmeyen bir hata oluştu'
          });
          channel.reject(msg, false);
        }
      }
    });
  } catch (err) {
    console.error('Failed to start AI Worker:', err);
  }
};
