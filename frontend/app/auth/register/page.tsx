'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';
import { setAuth } from '@/lib/auth';

const schema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string(),
  roles: z.array(z.string()).min(1, 'Pilih setidaknya 1 peran'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { roles: [] as string[] }
  });

  const roles = watch('roles');

  const toggleRole = (role: string) => {
    if (roles.includes(role)) {
      setValue('roles', roles.filter(r => r !== role));
    } else {
      setValue('roles', [...roles, role]);
    }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await api.post('/auth/register', {
        username: data.username,
        email: data.email,
        password: data.password,
        roles: data.roles
      });
      toast.success('Registrasi berhasil, sedang login...');
      const loginRes = await api.post('/auth/login', { email: data.email, password: data.password });
      setAuth(loginRes.data.token, loginRes.data.user);
      if (loginRes.data.requiresRoleSelection) {
        router.push('/auth/select-role');
      } else {
        router.push(`/${loginRes.data.user.roles[0].toLowerCase()}/dashboard`);
      }
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-130px)] bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Daftar Akun Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input placeholder="Username" {...register('username')} />
              {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message as string}</p>}
            </div>
            <div>
              <Input placeholder="Email" {...register('email')} />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message as string}</p>}
            </div>
            <div>
              <Input type="password" placeholder="Password" {...register('password')} />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message as string}</p>}
            </div>
            <div>
              <Input type="password" placeholder="Konfirmasi Password" {...register('confirmPassword')} />
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message as string}</p>}
            </div>
            
            <div className="space-y-2">
              <p className="font-semibold text-sm">Pilih Peran Anda:</p>
              <div className="flex gap-4">
                {['BUYER', 'SELLER', 'DRIVER'].map(r => (
                  <label key={r} className="flex items-center gap-2">
                    <input type="checkbox" checked={roles.includes(r)} onChange={() => toggleRole(r)} />
                    {r}
                  </label>
                ))}
              </div>
              {errors.roles && <p className="text-red-500 text-sm">{errors.roles.message as string}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Memproses...' : 'Daftar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
