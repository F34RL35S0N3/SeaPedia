'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function AdminDeliveryJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const links = [
    { label: 'Beranda', href: '/admin/dashboard' },
    { label: 'Pengguna', href: '/admin/users' },
    { label: 'Toko', href: '/admin/stores' },
    { label: 'Produk', href: '/admin/products' },
    { label: 'Pesanan', href: '/admin/orders' },
    { label: 'Diskon & Voucher', href: '/admin/vouchers' },
    { label: 'Pengiriman', href: '/admin/delivery-jobs' },
  ];

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/admin/delivery-jobs');
      setJobs(res.data);
    } catch (e) {
      toast.error('Gagal memuat pekerjaan pengiriman');
    } finally {
      setLoading(false);
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
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <DashboardLayout title="Admin Panel" links={links}>
        <h1 className="text-3xl font-bold mb-6">Manajemen Pengiriman</h1>
        
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 font-semibold">ID Pekerjaan</th>
                  <th className="p-4 font-semibold">ID Pesanan</th>
                  <th className="p-4 font-semibold">Pengemudi</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Dibuat Pada</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(j => (
                  <tr key={j.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-4 font-medium text-xs text-gray-500">{j.id}</td>
                    <td className="p-4 text-xs text-gray-500">{j.orderId}</td>
                    <td className="p-4">{j.driver?.username || <span className="text-gray-400 italic">Belum diambil</span>}</td>
                    <td className="p-4">
                      <Badge className={`${getStatusColor(j.status)} text-white`}>{j.status}</Badge>
                    </td>
                    <td className="p-4">{new Date(j.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
