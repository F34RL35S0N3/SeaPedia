'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function AdminStores() {
  const [stores, setStores] = useState<any[]>([]);
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
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const res = await api.get('/admin/stores');
      setStores(res.data);
    } catch (e) {
      toast.error('Gagal memuat toko');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <DashboardLayout title="Admin Panel" links={links}>
        <h1 className="text-3xl font-bold mb-6">Manajemen Toko</h1>
        
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 font-semibold">Nama Toko</th>
                  <th className="p-4 font-semibold">Pemilik</th>
                  <th className="p-4 font-semibold text-center">Jumlah Produk</th>
                  <th className="p-4 font-semibold text-center">Total Pesanan</th>
                  <th className="p-4 font-semibold">Dibuat Pada</th>
                </tr>
              </thead>
              <tbody>
                {stores.map(s => (
                  <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-4 font-medium">{s.name}</td>
                    <td className="p-4">{s.seller.username}</td>
                    <td className="p-4 text-center">{s._count.products}</td>
                    <td className="p-4 text-center">{s._count.orders}</td>
                    <td className="p-4">{new Date(s.createdAt).toLocaleDateString()}</td>
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
