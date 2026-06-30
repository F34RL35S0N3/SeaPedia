import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import sanitizeHtml from 'sanitize-html';

const storeSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

const sanitize = (str: string) => sanitizeHtml(str, { allowedTags: [], allowedAttributes: {} });

export const createStore = async (req: Request, res: Response) => {
  const parsed = storeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { name, description } = parsed.data;
  const sellerId = req.user!.userId;

  const existingName = await prisma.store.findUnique({ where: { name } });
  if (existingName) return res.status(409).json({ error: 'Nama toko sudah digunakan' });

  const existingStore = await prisma.store.findUnique({ where: { sellerId } });
  if (existingStore) return res.status(400).json({ error: 'Anda sudah memiliki toko' });

  const store = await prisma.store.create({
    data: {
      name: sanitize(name),
      description: description ? sanitize(description) : null,
      sellerId,
    },
  });
  res.status(201).json(store);
};

export const getMyStore = async (req: Request, res: Response) => {
  const store = await prisma.store.findUnique({
    where: { sellerId: req.user!.userId },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });
  if (!store) return res.status(404).json({ error: 'Toko tidak ditemukan' });
  res.json(store);
};

export const updateStore = async (req: Request, res: Response) => {
  const parsed = storeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { name, description } = parsed.data;
  const sellerId = req.user!.userId;

  const existingName = await prisma.store.findFirst({
    where: { name, sellerId: { not: sellerId } },
  });
  if (existingName) return res.status(409).json({ error: 'Nama toko sudah digunakan' });

  const store = await prisma.store.update({
    where: { sellerId },
    data: {
      name: sanitize(name),
      description: description ? sanitize(description) : null,
    },
  });
  res.json(store);
};

export const getStoreById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(1, parseInt(req.query.limit as string) || 12);

  const store = await prisma.store.findUnique({
    where: { id },
    include: {
      seller: { select: { username: true } },
    }
  });

  if (!store) return res.status(404).json({ error: 'Toko tidak ditemukan' });

  const products = await prisma.product.findMany({
    where: { storeId: id, isActive: true },
    skip: (page - 1) * limit,
    take: limit,
  });

  res.json({ store, products });
};
