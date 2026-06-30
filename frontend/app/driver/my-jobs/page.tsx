'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function MyJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const links = [
    { label: 'Beranda', href: '/driver/dashboard' },
    { label: 'Pekerjaan Tersedia', href: '/driver/jobs' },
    { label: 'Pekerjaan Saya', href: '/driver/my-jobs' },
  ];

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/delivery/my');
      setJobs(res.data);
    } catch (e: any) {
      toast.error('Gagal memuat pekerjaan');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/delivery/${id}/status`, { status });
      toast.success('Status diperbarui');
      fetchJobs();
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Gagal memperbarui status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-gray-500';
      case 'ACCEPTED': return 'bg-blue-500';
      case 'IN_TRANSIT': return 'bg-orange-500';
      case 'DELIVERED': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <ProtectedRoute allowedRoles={['DRIVER']}>
      <DashboardLayout title="Dashboard Pengemudi" links={links}>
        <h1 className="text-3xl font-bold mb-6">Pekerjaan Saya</h1>
        
        {loading ? (
          <div>Loading...</div>
        ) : jobs.length === 0 ? (
          <div className="bg-white p-8 rounded-lg border text-center text-gray-500">
            Anda belum mengambil pekerjaan.
          </div>
        ) : (
          <div className="space-y-6">
            {jobs.map(job => (
              <div key={job.id} className="bg-white p-6 rounded-lg border flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <h3 className="font-semibold text-lg">{job.order.store.name}</h3>
                  <p className="text-sm text-gray-600">Alamat Tujuan: {job.order.deliveryAddress}</p>
                  <p className="text-sm text-gray-600">Pembeli: {job.order.user.username}</p>
                  <div className="mt-2">
                    <Badge className={`${getStatusColor(job.status)} text-white`}>{job.status}</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  {job.status === 'ACCEPTED' && (
                    <Button onClick={() => handleUpdateStatus(job.id, 'IN_TRANSIT')}>Mulai Pengiriman</Button>
                  )}
                  {job.status === 'IN_TRANSIT' && (
                    <Button onClick={() => handleUpdateStatus(job.id, 'DELIVERED')} className="bg-green-600 hover:bg-green-700">Selesai Dikirim</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
