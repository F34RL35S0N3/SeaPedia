import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import sanitizeHtml from 'sanitize-html';

const checkoutSchema = z.object({
  deliveryAddress: z.string().min(5),
});

const sanitize = (str: string) => sanitizeHtml(str, { allowedTags: [], allowedAttributes: {} });

export const checkout = async (req: Request, res: Response) => {
  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  
  const userId = req.user!.userId;
  const { deliveryAddress } = parsed.data;

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
      let totalCost = 0;
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
        totalCost += itemTotal;
      }

      // 3. Check wallet balance
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet || wallet.balance < totalCost) {
        throw new Error('Saldo tidak cukup');
      }

      // 4. Deduct wallet
      await tx.wallet.update({
        where: { userId },
        data: { balance: { decrement: totalCost } },
      });

      // 5. Create orders and deduct stock
      const createdOrders = [];
      for (const storeId of Object.keys(storeGroups)) {
        const group = storeGroups[storeId];
        
        const order = await tx.order.create({
          data: {
            userId,
            storeId,
            totalAmount: group.storeTotal,
            deliveryAddress: sanitize(deliveryAddress),
            status: 'PAID', // Direct to paid since we deduct wallet
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

      // 6. Clear cart
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
