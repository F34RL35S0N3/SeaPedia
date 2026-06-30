'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function StoreManagement() {
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  const links = [
    { label: 'Beranda', href: '/seller/dashboard' },
    { label: 'Toko Saya', href: '/seller/store' },
    { label: 'Produk', href: '/seller/products' },
    { label: 'Pesanan', href: '/seller/orders' },
    { label: 'Laporan', href: '/seller/reports' },
  ];

  useEffect(() => {
    fetchStore();
  }, []);

  const fetchStore = async () => {
    try {
      const res = await api.get('/stores/my');
      setStore(res.data);
      setForm({ name: res.data.name, description: res.data.description || '' });
    } catch (e: any) {
      if (e.response?.status !== 404) {
        toast.error('Gagal memuat data toko');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (store) {
        const res = await api.put('/stores/my', form);
        setStore(res.data);
        toast.success('Profil toko diperbarui');
      } else {
        const res = await api.post('/stores', form);
        setStore(res.data);
        toast.success('Toko berhasil dibuat');
      }
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Gagal menyimpan data toko');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <ProtectedRoute allowedRoles={['SELLER']}>
      <DashboardLayout title="Dashboard Penjual" links={links}>
        <h1 className="text-3xl font-bold mb-6">Manajemen Toko</h1>
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>{store ? 'Profil Toko' : 'Buat Toko Baru'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Toko</label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Deskripsi</label>
                <textarea 
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.description} 
                  onChange={e => setForm({ ...form, description: e.target.value })} 
                />
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? 'Menyimpan...' : (store ? 'Simpan Perubahan' : 'Buat Toko')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
