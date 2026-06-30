'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const links = [
    { label: 'Beranda', href: '/buyer/dashboard' },
    { label: 'Dompet', href: '/buyer/wallet' },
    { label: 'Keranjang', href: '/buyer/cart' },
    { label: 'Pesanan', href: '/buyer/orders' },
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/my');
      setOrders(res.data);
    } catch (e: any) {
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
      default: return 'bg-gray-500';
    }
  };

  return (
    <ProtectedRoute allowedRoles={['BUYER']}>
      <DashboardLayout title="Dashboard Pembeli" links={links}>
        <h1 className="text-3xl font-bold mb-6">Daftar Pesanan</h1>
        
        {loading ? (
          <div>Loading...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-8 rounded-lg border text-center text-gray-500">
            Anda belum memiliki pesanan.
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="bg-white p-6 rounded-lg border">
                <div className="flex justify-between items-center border-b pb-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                    <p className="font-semibold text-lg">{order.store.name}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={`${getStatusColor(order.status)} text-white mb-1`}>{order.status}</Badge>
                    <p className="font-bold text-blue-600">Rp {order.totalAmount.toLocaleString('id-ID')}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.product.name}</span>
                      <span>Rp {(item.quantity * item.price).toLocaleString('id-ID')}</span>
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
