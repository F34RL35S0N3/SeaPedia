import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import sanitizeHtml from 'sanitize-html';

const productSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string(),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

const sanitize = (str: string) => sanitizeHtml(str, { allowedTags: [], allowedAttributes: {} });

export const createProduct = async (req: Request, res: Response) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { name, description, price, stock, imageUrl } = parsed.data;

  const store = await prisma.store.findUnique({ where: { sellerId: req.user!.userId } });
  if (!store) return res.status(400).json({ error: 'Buat toko terlebih dahulu' });

  const product = await prisma.product.create({
    data: {
      name: sanitize(name),
      description: sanitize(description),
      price,
      stock,
      imageUrl: imageUrl || null,
      storeId: store.id,
    },
  });
  res.status(201).json(product);
};

export const getMyProducts = async (req: Request, res: Response) => {
  const store = await prisma.store.findUnique({ where: { sellerId: req.user!.userId } });
  if (!store) return res.json([]);

  const products = await prisma.product.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json(products);
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { name, description, price, stock, imageUrl } = parsed.data;

  const product = await prisma.product.findUnique({ where: { id }, include: { store: true } });
  if (!product) return res.status(404).json({ error: 'Produk tidak ditemukan' });
  if (product.store.sellerId !== req.user!.userId) return res.status(403).json({ error: 'Unauthorized' });

  const updated = await prisma.product.update({
    where: { id },
    data: {
      name: sanitize(name),
      description: sanitize(description),
      price,
      stock,
      imageUrl: imageUrl || null,
    },
  });
  res.json(updated);
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const product = await prisma.product.findUnique({ where: { id }, include: { store: true } });
  if (!product) return res.status(404).json({ error: 'Produk tidak ditemukan' });
  if (product.store.sellerId !== req.user!.userId) return res.status(403).json({ error: 'Unauthorized' });

  await prisma.product.update({
    where: { id },
    data: { isActive: false },
  });
  res.json({ message: 'Produk dihapus' });
};

export const getProducts = async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(1, parseInt(req.query.limit as string) || 12);
  const search = (req.query.search as string) || '';

  const whereCondition = {
    isActive: true,
    ...(search ? { name: { contains: search } } : {}),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: whereCondition,
      include: { store: { select: { id: true, name: true } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where: whereCondition }),
  ]);

  res.json({ products, total, page, limit });
};

export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { store: { select: { id: true, name: true, description: true } } },
  });

  if (!product || !product.isActive) return res.status(404).json({ error: 'Produk tidak ditemukan' });
  res.json(product);
};
