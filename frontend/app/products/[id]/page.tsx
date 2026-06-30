'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getActiveRole } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const role = getActiveRole();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${id}`);
      setProduct(res.data);
    } catch (e) {
      toast.error('Produk tidak ditemukan');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!product) return <div className="p-8 text-center">Produk tidak ditemukan</div>;

  const handleAddToCart = async () => {
    try {
      await api.post('/cart', { productId: product.id, quantity: 1 });
      toast.success('Ditambahkan ke keranjang!');
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Gagal menambahkan ke keranjang');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center text-6xl font-bold text-gray-400 overflow-hidden">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            product.name.substring(0, 2).toUpperCase()
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-2xl text-blue-600 font-bold mb-4">Rp {product.price.toLocaleString('id-ID')}</p>
          <Card className="mb-6">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Toko</p>
                <p className="font-semibold">{product.store.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Stok</p>
                <p className="font-semibold">{product.stock}</p>
              </div>
            </CardContent>
          </Card>
          <div className="mb-8">
            <h3 className="font-semibold mb-2">Deskripsi Produk</h3>
            <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
          </div>
          {role === 'BUYER' ? (
            <Button size="lg" className="w-full" onClick={handleAddToCart} disabled={product.stock === 0}>
              {product.stock === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
            </Button>
          ) : (
            <Button size="lg" variant="secondary" className="w-full" disabled>
              Login sebagai Pembeli untuk membeli
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
