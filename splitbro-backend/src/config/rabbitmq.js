import amqp from 'amqplib';

let channel = null;
let connection = null;

export const connectRabbitMQ = async () => {
  try {
    const url = process.env.RABBITMQ_URL;
    connection = await amqp.connect(url);
    channel = await connection.createChannel();
    console.log('RabbitMQ Connected');

    await channel.assertQueue('ai_categorization_queue', { durable: true });

    await channel.assertQueue('ai_price_verification_queue', { durable: true });

    await channel.assertQueue('ai_receipt_scan_queue', { durable: true });
  } catch (error) {
    console.error('RabbitMQ Connection Error:', error);
  }
};

export const getChannel = () => {
  if (!channel) {
    throw new Error('RabbitMQ channel is not initialized');
  }
  return channel;
};

export const publishMessage = async (queue, message) => {
  if (!channel) {
    await connectRabbitMQ();
  }
  if (!channel) {
    throw new Error('RabbitMQ channel is not initialized');
  }
  return channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
};

