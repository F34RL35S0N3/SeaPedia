'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function AvailableJobs() {
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
      const res = await api.get('/delivery/available');
      setJobs(res.data);
    } catch (e: any) {
      toast.error('Gagal memuat pekerjaan');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await api.post(`/delivery/${id}/accept`);
      toast.success('Pekerjaan diambil!');
      fetchJobs();
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Gagal mengambil pekerjaan');
    }
  };

  return (
    <ProtectedRoute allowedRoles={['DRIVER']}>
      <DashboardLayout title="Dashboard Pengemudi" links={links}>
        <h1 className="text-3xl font-bold mb-6">Pekerjaan Tersedia</h1>
        
        {loading ? (
          <div>Loading...</div>
        ) : jobs.length === 0 ? (
          <div className="bg-white p-8 rounded-lg border text-center text-gray-500">
            Belum ada pekerjaan pengiriman baru.
          </div>
        ) : (
          <div className="space-y-6">
            {jobs.map(job => (
              <div key={job.id} className="bg-white p-6 rounded-lg border flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <h3 className="font-semibold text-lg">{job.order.store.name}</h3>
                  <p className="text-sm text-gray-600">Alamat Tujuan: {job.order.deliveryAddress}</p>
                  <p className="text-sm text-gray-500 mt-2">Dibuat: {new Date(job.createdAt).toLocaleString('id-ID')}</p>
                </div>
                <Button onClick={() => handleAccept(job.id)}>Ambil Pekerjaan</Button>
              </div>
            ))}
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
