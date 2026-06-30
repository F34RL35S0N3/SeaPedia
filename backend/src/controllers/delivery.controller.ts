import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getAvailableJobs = async (req: Request, res: Response) => {
  const jobs = await prisma.deliveryJob.findMany({
    where: { status: 'PENDING' },
    include: {
      order: {
        include: { store: true, user: { select: { username: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(jobs);
};

export const getMyJobs = async (req: Request, res: Response) => {
  const driverId = req.user!.userId;
  const jobs = await prisma.deliveryJob.findMany({
    where: { driverId },
    include: {
      order: {
        include: { store: true, user: { select: { username: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(jobs);
};

export const acceptJob = async (req: Request, res: Response) => {
  const { id } = req.params;
  const driverId = req.user!.userId;

  const job = await prisma.deliveryJob.findUnique({ where: { id } });
  if (!job) return res.status(404).json({ error: 'Job tidak ditemukan' });
  if (job.status !== 'PENDING') return res.status(400).json({ error: 'Job sudah diambil orang lain' });

  const updatedJob = await prisma.deliveryJob.update({
    where: { id },
    data: { driverId, status: 'ACCEPTED' },
  });
  res.json(updatedJob);
};

export const updateJobStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const driverId = req.user!.userId;

  const job = await prisma.deliveryJob.findUnique({ where: { id } });
  if (!job) return res.status(404).json({ error: 'Job tidak ditemukan' });
  if (job.driverId !== driverId) return res.status(403).json({ error: 'Bukan job Anda' });

  const validTransitions: Record<string, string[]> = {
    'ACCEPTED': ['IN_TRANSIT'],
    'IN_TRANSIT': ['DELIVERED'],
  };

  if (!validTransitions[job.status]?.includes(status)) {
    return res.status(400).json({ error: `Transisi status tidak valid` });
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedJob = await tx.deliveryJob.update({
      where: { id },
      data: { status },
    });

    if (status === 'DELIVERED') {
      await tx.order.update({
        where: { id: job.orderId },
        data: { status: 'DELIVERED' },
      });
    }

    return updatedJob;
  });

  res.json(result);
};
