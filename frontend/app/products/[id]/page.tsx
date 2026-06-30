'use client';
import { useParams } from 'next/navigation';
import { getActiveRole } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

const DUMMY_PRODUCTS = [
  { id: '1', name: 'Laptop Gaming', description: 'Laptop gaming berperforma tinggi dengan RTX 4070.', price: 15000000, stock: 10, store: 'Toko Elektronik Jaya' },
  { id: '2', name: 'Smartphone Pro', description: 'Smartphone canggih dengan kamera terbaik.', price: 8000000, stock: 25, store: 'Toko Elektronik Jaya' },
  { id: '3', name: 'Headphone Wireless', description: 'Suara jernih dan bass mendalam.', price: 1500000, stock: 50, store: 'Audio Shop' },
  { id: '4', name: 'Keyboard Mekanikal', description: 'Keyboard dengan switch cherry MX red.', price: 1200000, stock: 15, store: 'Toko Komputer' },
  { id: '5', name: 'Mouse Gaming', description: 'Mouse ringan untuk e-sports.', price: 800000, stock: 30, store: 'Toko Komputer' },
  { id: '6', name: 'Monitor 4K', description: 'Monitor resolusi 4K untuk desain grafis.', price: 5000000, stock: 5, store: 'Toko Elektronik Jaya' },
];

export default function ProductDetail() {
  const { id } = useParams();
  const product = DUMMY_PRODUCTS.find(p => p.id === id);
  const role = getActiveRole();

  if (!product) return <div className="p-8 text-center">Produk tidak ditemukan</div>;

  const handleAddToCart = () => {
    toast.success('Ditambahkan ke keranjang!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center text-6xl font-bold text-gray-400">
          {product.name.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-2xl text-blue-600 font-bold mb-4">Rp {product.price.toLocaleString('id-ID')}</p>
          <Card className="mb-6">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Toko</p>
                <p className="font-semibold">{product.store}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Stok</p>
                <p className="font-semibold">{product.stock}</p>
              </div>
            </CardContent>
          </Card>
          <div className="mb-8">
            <h3 className="font-semibold mb-2">Deskripsi Produk</h3>
            <p className="text-gray-700">{product.description}</p>
          </div>
          {role === 'BUYER' ? (
            <Button size="lg" className="w-full" onClick={handleAddToCart}>Tambah ke Keranjang</Button>
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
