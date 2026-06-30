'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [topupAmount, setTopupAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const links = [
    { label: 'Beranda', href: '/buyer/dashboard' },
    { label: 'Dompet', href: '/buyer/wallet' },
    { label: 'Keranjang', href: '/buyer/cart' },
    { label: 'Pesanan', href: '/buyer/orders' },
  ];

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const res = await api.get('/wallet');
      setBalance(res.data.balance);
    } catch (e: any) {
      toast.error('Gagal memuat saldo dompet');
    } finally {
      setLoading(false);
    }
  };

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(topupAmount);
    if (!amount || amount <= 0) return toast.error('Jumlah tidak valid');

    setProcessing(true);
    try {
      const res = await api.post('/wallet/topup', { amount });
      setBalance(res.data.balance);
      setTopupAmount('');
      toast.success('Top up berhasil!');
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Top up gagal');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['BUYER']}>
      <DashboardLayout title="Dashboard Pembeli" links={links}>
        <h1 className="text-3xl font-bold mb-6">Dompet SeaPay</h1>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Saldo Saat Ini</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-2xl text-gray-400">Loading...</div>
              ) : (
                <div className="text-4xl font-bold text-blue-600">
                  Rp {balance.toLocaleString('id-ID')}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Top Up Saldo</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleTopup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Jumlah (Rp)</label>
                  <Input type="number" min="1000" step="1000" value={topupAmount} onChange={e => setTopupAmount(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={processing}>
                  {processing ? 'Memproses...' : 'Isi Saldo'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
