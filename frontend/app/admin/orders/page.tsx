'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
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
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/admin/orders');
      setOrders(res.data);
    } catch (e) {
      toast.error('Gagal memuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-blue-500';
      case 'PROCESSED': return 'bg-orange-500';
      case 'SHIPPED': return 'bg-yellow-500';
      case 'DELIVERED': return 'bg-green-500';
      case 'CANCELLED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <DashboardLayout title="Admin Panel" links={links}>
        <h1 className="text-3xl font-bold mb-6">Manajemen Pesanan</h1>
        
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 font-semibold">ID Pesanan</th>
                  <th className="p-4 font-semibold">Pembeli</th>
                  <th className="p-4 font-semibold">Toko</th>
                  <th className="p-4 font-semibold">Total Harga</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-4 font-medium text-xs text-gray-500">{o.id}</td>
                    <td className="p-4">{o.user.username}</td>
                    <td className="p-4">{o.store.name}</td>
                    <td className="p-4">Rp {o.totalAmount.toLocaleString('id-ID')}</td>
                    <td className="p-4">
                      <Badge className={`${getStatusColor(o.status)} text-white`}>{o.status}</Badge>
                    </td>
                    <td className="p-4">{new Date(o.createdAt).toLocaleDateString()}</td>
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
