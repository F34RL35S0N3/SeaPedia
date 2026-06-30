import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import sanitizeHtml from 'sanitize-html';

const voucherSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  discountPercent: z.number().min(0).max(100),
  minPurchase: z.number().min(0).default(0),
  maxDiscount: z.number().optional().nullable(),
  quota: z.number().int().min(1),
});

export const createVoucher = async (req: Request, res: Response) => {
  const parsed = voucherSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  
  const data = parsed.data;
  const sanitizeCode = sanitizeHtml(data.code, { allowedTags: [], allowedAttributes: {} });

  const existing = await prisma.voucher.findUnique({ where: { code: sanitizeCode } });
  if (existing) return res.status(409).json({ error: 'Kode voucher sudah ada' });

  const voucher = await prisma.voucher.create({
    data: {
      code: sanitizeCode,
      discountPercent: data.discountPercent,
      minPurchase: data.minPurchase,
      maxDiscount: data.maxDiscount || null,
      quota: data.quota,
    },
  });
  res.status(201).json(voucher);
};

export const getVouchers = async (req: Request, res: Response) => {
  const vouchers = await prisma.voucher.findMany({
    orderBy: { createdAt: 'desc' },
  });
  res.json(vouchers);
};

export const deleteVoucher = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.voucher.update({
    where: { id },
    data: { isActive: false },
  });
  res.json({ message: 'Voucher dinonaktifkan' });
};
