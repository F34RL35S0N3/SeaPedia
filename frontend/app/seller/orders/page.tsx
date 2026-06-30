'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function SellerOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const links = [
    { label: 'Beranda', href: '/seller/dashboard' },
    { label: 'Toko Saya', href: '/seller/store' },
    { label: 'Produk', href: '/seller/products' },
    { label: 'Pesanan', href: '/seller/orders' },
    { label: 'Laporan', href: '/seller/reports' },
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/seller');
      setOrders(res.data);
    } catch (e: any) {
      toast.error('Gagal memuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await api.put(`/orders/seller/${id}/status`, { status: newStatus });
      toast.success('Status pesanan diperbarui');
      fetchOrders();
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Gagal memperbarui status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-blue-500';
      case 'PROCESSED': return 'bg-orange-500';
      case 'SHIPPED': return 'bg-yellow-500';
      case 'DELIVERED': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <ProtectedRoute allowedRoles={['SELLER']}>
      <DashboardLayout title="Dashboard Penjual" links={links}>
        <h1 className="text-3xl font-bold mb-6">Kelola Pesanan</h1>
        
        {loading ? (
          <div>Loading...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-8 rounded-lg border text-center text-gray-500">
            Belum ada pesanan yang masuk.
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="bg-white p-6 rounded-lg border">
                <div className="flex flex-col md:flex-row justify-between md:items-center border-b pb-4 mb-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Tanggal: {new Date(order.createdAt).toLocaleDateString()}</p>
                    <p className="font-semibold text-lg">Pembeli: {order.user.username}</p>
                    <p className="text-sm">Alamat: {order.deliveryAddress}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <Badge className={`${getStatusColor(order.status)} text-white mb-2`}>{order.status}</Badge>
                    <p className="font-bold text-blue-600">Rp {order.totalAmount.toLocaleString('id-ID')}</p>
                    
                    <div className="mt-2 space-x-2">
                      {order.status === 'PAID' && (
                        <Button size="sm" onClick={() => handleUpdateStatus(order.id, 'PROCESSED')}>Proses Pesanan</Button>
                      )}
                      {order.status === 'PROCESSED' && (
                        <Button size="sm" onClick={() => handleUpdateStatus(order.id, 'SHIPPED')}>Kirim Pesanan</Button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-gray-700">Item Pesanan:</h4>
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.product.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
