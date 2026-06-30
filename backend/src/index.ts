import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';
import router from './routes';
import cron from 'node-cron';
import { prisma } from './utils/prisma';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: ['http://localhost:3000', process.env.FRONTEND_URL || ''], credentials: true }));
app.use(express.json());

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: { error: 'Too many requests' } });
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

import { errorHandler } from './middlewares/errorHandler';

app.use('/api', router);

// Error handling middleware should be the last middleware
app.use(errorHandler);

// Cron Job: Check overdue orders every hour
cron.schedule('0 * * * *', async () => {
  console.log('[Cron] Checking overdue orders...');
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  try {
    const overdueOrders = await prisma.order.findMany({
      where: {
        status: 'PAID',
        updatedAt: { lt: twoDaysAgo },
      },
    });

    for (const order of overdueOrders) {
      await prisma.$transaction(async (tx) => {
        // Cancel order
        await tx.order.update({
          where: { id: order.id },
          data: { status: 'CANCELLED' },
        });

        // Refund wallet
        await tx.wallet.update({
          where: { userId: order.userId },
          data: { balance: { increment: order.totalAmount } },
        });
      });
      console.log(`[Cron] Cancelled and refunded order ${order.id}`);
    }
  } catch (error) {
    console.error('[Cron] Error processing overdue orders', error);
  }
});

app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));
