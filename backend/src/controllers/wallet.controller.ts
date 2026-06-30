import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';

export const getWallet = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  let wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) {
    wallet = await prisma.wallet.create({ data: { userId, balance: 0 } });
  }
  res.json(wallet);
};

const topupSchema = z.object({ amount: z.number().positive() });

export const topUpWallet = async (req: Request, res: Response) => {
  const parsed = topupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  
  const userId = req.user!.userId;
  const { amount } = parsed.data;

  const wallet = await prisma.wallet.upsert({
    where: { userId },
    update: { balance: { increment: amount } },
    create: { userId, balance: amount },
  });

  res.json(wallet);
};
