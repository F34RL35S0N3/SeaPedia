'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function AdminVouchers() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    code: '',
    discountPercent: 10,
    minPurchase: 0,
    maxDiscount: '',
    quota: 100,
  });

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
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const res = await api.get('/vouchers');
      setVouchers(res.data);
    } catch (e: any) {
      toast.error('Gagal memuat voucher');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload: any = { ...form };
      if (payload.maxDiscount === '') delete payload.maxDiscount;
      else payload.maxDiscount = Number(payload.maxDiscount);

      await api.post('/vouchers', payload);
      toast.success('Voucher berhasil dibuat');
      setForm({ code: '', discountPercent: 10, minPurchase: 0, maxDiscount: '', quota: 100 });
      fetchVouchers();
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Gagal membuat voucher');
    } finally {
      setCreating(false);
    }
  };

  const handleDisable = async (id: string) => {
    if (!confirm('Nonaktifkan voucher ini?')) return;
    try {
      await api.delete(`/vouchers/${id}`);
      toast.success('Voucher dinonaktifkan');
      fetchVouchers();
    } catch (e: any) {
      toast.error('Gagal menonaktifkan');
    }
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <DashboardLayout title="Admin Panel" links={links}>
        <h1 className="text-3xl font-bold mb-6">Manajemen Voucher</h1>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="md:col-span-1 h-fit">
            <CardHeader><CardTitle>Buat Voucher Baru</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Kode Voucher</label>
                  <Input value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Diskon (%)</label>
                  <Input type="number" min="1" max="100" value={form.discountPercent} onChange={e => setForm({...form, discountPercent: Number(e.target.value)})} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Min. Pembelian (Rp)</label>
                  <Input type="number" min="0" value={form.minPurchase} onChange={e => setForm({...form, minPurchase: Number(e.target.value)})} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Maks. Diskon (Rp) (Opsional)</label>
                  <Input type="number" min="0" value={form.maxDiscount} onChange={e => setForm({...form, maxDiscount: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Kuota</label>
                  <Input type="number" min="1" value={form.quota} onChange={e => setForm({...form, quota: Number(e.target.value)})} required />
                </div>
                <Button type="submit" className="w-full" disabled={creating}>
                  {creating ? 'Membuat...' : 'Buat Voucher'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="md:col-span-2 space-y-4">
            <h3 className="text-xl font-bold mb-4">Daftar Voucher</h3>
            {loading ? <div>Loading...</div> : vouchers.map(v => (
              <Card key={v.id} className={!v.isActive ? 'opacity-60' : ''}>
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-lg bg-gray-100 px-2 py-1 rounded">{v.code}</span>
                      {!v.isActive && <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Nonaktif</span>}
                    </div>
                    <p className="text-sm text-gray-600">Diskon: {v.discountPercent}% | Min: Rp {v.minPurchase.toLocaleString('id-ID')} {v.maxDiscount ? `| Maks: Rp ${v.maxDiscount.toLocaleString('id-ID')}` : ''}</p>
                    <p className="text-sm text-gray-600">Sisa Kuota: {v.quota}</p>
                  </div>
                  {v.isActive && (
                    <Button variant="destructive" size="sm" onClick={() => handleDisable(v.id)}>Nonaktifkan</Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
