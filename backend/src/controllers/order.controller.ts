import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import sanitizeHtml from 'sanitize-html';

const checkoutSchema = z.object({
  deliveryAddress: z.string().min(5),
  voucherCode: z.string().optional(),
});

const sanitize = (str: string) => sanitizeHtml(str, { allowedTags: [], allowedAttributes: {} });

export const checkout = async (req: Request, res: Response) => {
  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  
  const userId = req.user!.userId;
  const { deliveryAddress, voucherCode } = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get cart items
      const cartItems = await tx.cartItem.findMany({
        where: { userId },
        include: { product: true },
      });

      if (cartItems.length === 0) {
        throw new Error('Keranjang kosong');
      }

      // 2. Validate stock and group by store
      let rawTotal = 0;
      const storeGroups: Record<string, { items: any[]; storeTotal: number }> = {};

      for (const item of cartItems) {
        if (!item.product.isActive || item.product.stock < item.quantity) {
          throw new Error(`Produk ${item.product.name} tidak tersedia atau stok kurang`);
        }
        
        const storeId = item.product.storeId;
        if (!storeGroups[storeId]) storeGroups[storeId] = { items: [], storeTotal: 0 };
        
        const itemTotal = item.quantity * item.product.price;
        storeGroups[storeId].items.push(item);
        storeGroups[storeId].storeTotal += itemTotal;
        rawTotal += itemTotal;
      }

      // 3. Process voucher
      let discountAmount = 0;
      let appliedVoucherId: string | null = null;

      if (voucherCode) {
        const voucher = await tx.voucher.findUnique({ where: { code: voucherCode } });
        if (!voucher || !voucher.isActive || voucher.quota <= 0) {
          throw new Error('Voucher tidak valid atau kuota habis');
        }
        if (rawTotal < voucher.minPurchase) {
          throw new Error(`Minimal pembelian untuk voucher ini adalah Rp ${voucher.minPurchase}`);
        }

        discountAmount = rawTotal * (voucher.discountPercent / 100);
        if (voucher.maxDiscount && discountAmount > voucher.maxDiscount) {
          discountAmount = voucher.maxDiscount;
        }

        appliedVoucherId = voucher.id;

        await tx.voucher.update({
          where: { id: voucher.id },
          data: { quota: { decrement: 1 } },
        });
      }

      const finalTotal = Math.max(0, rawTotal - discountAmount);

      // 4. Check wallet balance
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet || wallet.balance < finalTotal) {
        throw new Error('Saldo tidak cukup');
      }

      // 5. Deduct wallet
      if (finalTotal > 0) {
        await tx.wallet.update({
          where: { userId },
          data: { balance: { decrement: finalTotal } },
        });
      }

      // 6. Create orders and deduct stock
      const createdOrders = [];
      const discountPerStoreRatio = rawTotal > 0 ? discountAmount / rawTotal : 0;

      for (const storeId of Object.keys(storeGroups)) {
        const group = storeGroups[storeId];
        const storeDiscount = group.storeTotal * discountPerStoreRatio;
        const storeFinalTotal = Math.max(0, group.storeTotal - storeDiscount);

        const order = await tx.order.create({
          data: {
            userId,
            storeId,
            totalAmount: storeFinalTotal,
            deliveryAddress: sanitize(deliveryAddress),
            status: 'PAID',
            voucherId: appliedVoucherId,
            items: {
              create: group.items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.product.price,
              })),
            },
          },
        });
        createdOrders.push(order);

        // Deduct stock
        for (const item of group.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      // 7. Clear cart
      await tx.cartItem.deleteMany({ where: { userId } });

      return createdOrders;
    });

    res.status(201).json({ message: 'Checkout berhasil', orders: result });
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Checkout gagal' });
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      store: { select: { name: true } },
      items: { include: { product: { select: { name: true, imageUrl: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(orders);
};

export const getSellerOrders = async (req: Request, res: Response) => {
  const store = await prisma.store.findUnique({ where: { sellerId: req.user!.userId } });
  if (!store) return res.json([]);

  const orders = await prisma.order.findMany({
    where: { storeId: store.id },
    include: {
      user: { select: { username: true } },
      items: { include: { product: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(orders);
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const store = await prisma.store.findUnique({ where: { sellerId: req.user!.userId } });
  if (!store) return res.status(403).json({ error: 'Unauthorized' });

  const order = await prisma.order.findFirst({ where: { id, storeId: store.id } });
  if (!order) return res.status(404).json({ error: 'Pesanan tidak ditemukan' });

  // Validate status transition
  const validTransitions: Record<string, string[]> = {
    'PAID': ['PROCESSED'],
    'PROCESSED': ['SHIPPED'],
  };

  if (!validTransitions[order.status]?.includes(status)) {
    return res.status(400).json({ error: `Transisi status dari ${order.status} ke ${status} tidak valid` });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedOrder = await tx.order.update({
      where: { id },
      data: { status },
    });

    if (status === 'SHIPPED') {
      await tx.deliveryJob.create({
        data: { orderId: order.id },
      });
    }

    return updatedOrder;
  });

  res.json(updated);
};
