'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';
import ProductForm from '@/components/seller/ProductForm';

export default function SellerProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const links = [
    { label: 'Beranda', href: '/seller/dashboard' },
    { label: 'Toko Saya', href: '/seller/store' },
    { label: 'Produk', href: '/seller/products' },
    { label: 'Pesanan', href: '/seller/orders' },
    { label: 'Laporan', href: '/seller/reports' },
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products/my');
      setProducts(res.data);
    } catch (e: any) {
      toast.error('Gagal memuat produk');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async (data: any) => {
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, data);
        toast.success('Produk diperbarui');
      } else {
        await api.post('/products', data);
        toast.success('Produk ditambahkan');
      }
      setShowForm(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Gagal menyimpan produk');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Produk dihapus');
      fetchProducts();
    } catch (e: any) {
      toast.error('Gagal menghapus produk');
    }
  };

  return (
    <ProtectedRoute allowedRoles={['SELLER']}>
      <DashboardLayout title="Dashboard Penjual" links={links}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manajemen Produk</h1>
          <Button onClick={() => setShowForm(true)}>+ Tambah Produk</Button>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 font-semibold">Nama Produk</th>
                  <th className="p-4 font-semibold">Harga</th>
                  <th className="p-4 font-semibold">Stok</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan={5} className="p-4 text-center text-gray-500">Belum ada produk</td></tr>
                ) : (
                  products.map(p => (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="p-4 font-medium">{p.name}</td>
                      <td className="p-4">Rp {p.price.toLocaleString('id-ID')}</td>
                      <td className="p-4">{p.stock}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${p.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {p.isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => { setEditingProduct(p); setShowForm(true); }}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(p.id)}>Hapus</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {showForm && (
          <ProductForm 
            initialData={editingProduct} 
            onSubmit={handleSaveProduct} 
            onCancel={() => { setShowForm(false); setEditingProduct(null); }} 
          />
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
