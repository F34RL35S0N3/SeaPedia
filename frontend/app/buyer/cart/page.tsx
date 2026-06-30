'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const links = [
    { label: 'Beranda', href: '/buyer/dashboard' },
    { label: 'Dompet', href: '/buyer/wallet' },
    { label: 'Keranjang', href: '/buyer/cart' },
    { label: 'Pesanan', href: '/buyer/orders' },
  ];

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart');
      setCartItems(res.data);
    } catch (e: any) {
      toast.error('Gagal memuat keranjang');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await api.delete(`/cart/${id}`);
      fetchCart();
    } catch (e: any) {
      toast.error('Gagal menghapus item');
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return toast.error('Alamat pengiriman wajib diisi');
    
    setCheckoutLoading(true);
    try {
      await api.post('/checkout', { deliveryAddress: address });
      toast.success('Checkout berhasil!');
      router.push('/buyer/orders');
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Checkout gagal');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const total = cartItems.reduce((acc, item) => acc + (item.quantity * item.product.price), 0);

  return (
    <ProtectedRoute allowedRoles={['BUYER']}>
      <DashboardLayout title="Dashboard Pembeli" links={links}>
        <h1 className="text-3xl font-bold mb-6">Keranjang Belanja</h1>
        
        {loading ? (
          <div>Loading...</div>
        ) : cartItems.length === 0 ? (
          <div className="bg-white p-8 rounded-lg border text-center text-gray-500">
            Keranjang Anda kosong. Mulai berbelanja!
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex gap-4 p-4 bg-white rounded-lg border">
                  <div className="w-24 h-24 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                    {item.product.imageUrl ? (
                      <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{item.product.name}</h3>
                      <p className="text-gray-500 text-sm">{item.product.store.name}</p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-blue-600 font-bold">
                        Rp {item.product.price.toLocaleString('id-ID')} x {item.quantity}
                      </p>
                      <Button variant="destructive" size="sm" onClick={() => handleRemove(item.id)}>Hapus</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-white p-6 rounded-lg border h-fit">
              <h3 className="text-xl font-bold mb-4">Ringkasan Belanja</h3>
              <div className="flex justify-between mb-4 text-lg">
                <span>Total:</span>
                <span className="font-bold text-blue-600">Rp {total.toLocaleString('id-ID')}</span>
              </div>
              <form onSubmit={handleCheckout} className="space-y-4 mt-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Alamat Pengiriman</label>
                  <textarea 
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={address} 
                    onChange={e => setAddress(e.target.value)}
                    required 
                  />
                </div>
                <Button type="submit" className="w-full" disabled={checkoutLoading}>
                  {checkoutLoading ? 'Memproses...' : 'Bayar Sekarang'}
                </Button>
              </form>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
