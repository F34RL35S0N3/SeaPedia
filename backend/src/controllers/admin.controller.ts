import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getUsers = async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: { id: true, username: true, email: true, createdAt: true, roles: { select: { role: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(users);
};

export const getStores = async (req: Request, res: Response) => {
  const stores = await prisma.store.findMany({
    include: { seller: { select: { username: true } }, _count: { select: { products: true, orders: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(stores);
};

export const getAllOrders = async (req: Request, res: Response) => {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { username: true } },
      store: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(orders);
};

export const getDeliveryJobs = async (req: Request, res: Response) => {
  const jobs = await prisma.deliveryJob.findMany({
    include: {
      driver: { select: { username: true } },
      order: { select: { id: true, status: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(jobs);
};
