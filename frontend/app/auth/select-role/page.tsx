'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';
import { getUser, setAuth, AuthUser } from '@/lib/auth';

export default function SelectRole() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const handleSelect = async (role: string) => {
    try {
      const res = await api.post('/auth/select-role', { role });
      if (user) {
        setAuth(res.data.token, { ...user, activeRole: role });
        router.push(`/${role.toLowerCase()}/dashboard`);
      }
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Gagal memilih peran');
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-130px)] bg-gray-50 p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Halo, {user.username}!</h1>
      <h2 className="text-xl mb-6">Pilih peran yang ingin Anda gunakan saat ini:</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {user.roles.map(role => (
          <Card key={role} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleSelect(role)}>
            <CardHeader>
              <CardTitle className="text-center">{role}</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-gray-600">
              {role === 'BUYER' && 'Mulai berbelanja dan temukan barang impian Anda.'}
              {role === 'SELLER' && 'Kelola toko Anda dan pantau penjualan.'}
              {role === 'DRIVER' && 'Ambil pekerjaan pengiriman dan mulai hasilkan uang.'}
              {role === 'ADMIN' && 'Akses panel administrator.'}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
