import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';

const addCartSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive().default(1),
});

export const addToCart = async (req: Request, res: Response) => {
  const parsed = addCartSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  
  const userId = req.user!.userId;
  const { productId, quantity } = parsed.data;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) return res.status(404).json({ error: 'Produk tidak ditemukan' });
  if (product.stock < quantity) return res.status(400).json({ error: 'Stok tidak cukup' });

  const existingCart = await prisma.cartItem.findFirst({
    where: { userId, productId },
  });

  let cartItem;
  if (existingCart) {
    if (product.stock < existingCart.quantity + quantity) {
      return res.status(400).json({ error: 'Stok tidak cukup untuk jumlah total' });
    }
    cartItem = await prisma.cartItem.update({
      where: { id: existingCart.id },
      data: { quantity: { increment: quantity } },
    });
  } else {
    cartItem = await prisma.cartItem.create({
      data: { userId, productId, quantity },
    });
  }

  res.json(cartItem);
};

export const getCart = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: { include: { store: true } } },
  });
  res.json(cartItems);
};

export const removeFromCart = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;

  const cartItem = await prisma.cartItem.findUnique({ where: { id } });
  if (!cartItem || cartItem.userId !== userId) return res.status(404).json({ error: 'Item tidak ditemukan' });

  await prisma.cartItem.delete({ where: { id } });
  res.json({ message: 'Item dihapus dari keranjang' });
};
