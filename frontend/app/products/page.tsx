'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const DUMMY_PRODUCTS = [
  { id: '1', name: 'Laptop Gaming', price: 15000000, store: 'Toko Elektronik Jaya' },
  { id: '2', name: 'Smartphone Pro', price: 8000000, store: 'Toko Elektronik Jaya' },
  { id: '3', name: 'Headphone Wireless', price: 1500000, store: 'Audio Shop' },
  { id: '4', name: 'Keyboard Mekanikal', price: 1200000, store: 'Toko Komputer' },
  { id: '5', name: 'Mouse Gaming', price: 800000, store: 'Toko Komputer' },
  { id: '6', name: 'Monitor 4K', price: 5000000, store: 'Toko Elektronik Jaya' },
];

export default function ProductsPage() {
  const [search, setSearch] = useState('');

  const filtered = DUMMY_PRODUCTS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Katalog Produk</h1>
      <Input 
        placeholder="Cari produk..." 
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-8 max-w-md"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map(p => (
          <Card key={p.id} className="overflow-hidden">
            <div className="h-48 bg-gray-200 flex items-center justify-center text-4xl font-bold text-gray-400">
              {p.name.substring(0, 2).toUpperCase()}
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg truncate">{p.name}</h3>
              <p className="text-blue-600 font-bold mb-2">Rp {p.price.toLocaleString('id-ID')}</p>
              <p className="text-sm text-gray-500 mb-4">{p.store}</p>
              <Button asChild className="w-full">
                <Link href={`/products/${p.id}`}>Lihat Detail</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
