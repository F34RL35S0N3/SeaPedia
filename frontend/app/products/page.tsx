'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const fetchProducts = async () => {
    try {
      const res = await api.get(`/products?search=${search}`);
      setProducts(res.data.products);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Katalog Produk</h1>
      <Input 
        placeholder="Cari produk..." 
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-8 max-w-md"
      />
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(p => (
            <Card key={p.id} className="overflow-hidden">
              <div className="h-48 bg-gray-200 flex items-center justify-center text-4xl font-bold text-gray-400">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  p.name.substring(0, 2).toUpperCase()
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg truncate">{p.name}</h3>
                <p className="text-blue-600 font-bold mb-2">Rp {p.price.toLocaleString('id-ID')}</p>
                <p className="text-sm text-gray-500 mb-4">{p.store.name}</p>
                <Button asChild className="w-full">
                  <Link href={`/products/${p.id}`}>Lihat Detail</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
          {products.length === 0 && <div className="col-span-full text-center py-8 text-gray-500">Tidak ada produk ditemukan.</div>}
        </div>
      )}
    </div>
  );
}
