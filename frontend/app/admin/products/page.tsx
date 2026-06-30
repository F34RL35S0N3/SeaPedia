'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
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
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data.products);
    } catch (e) {
      toast.error('Gagal memuat produk');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <DashboardLayout title="Admin Panel" links={links}>
        <h1 className="text-3xl font-bold mb-6">Manajemen Produk</h1>
        
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 font-semibold">Nama Produk</th>
                  <th className="p-4 font-semibold">Toko</th>
                  <th className="p-4 font-semibold">Harga</th>
                  <th className="p-4 font-semibold">Stok</th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-4 font-medium">{p.name}</td>
                    <td className="p-4">{p.store.name}</td>
                    <td className="p-4">Rp {p.price.toLocaleString('id-ID')}</td>
                    <td className="p-4">{p.stock}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${p.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {p.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
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
