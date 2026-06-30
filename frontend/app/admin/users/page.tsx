'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (e) {
      toast.error('Gagal memuat pengguna');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <DashboardLayout title="Admin Panel" links={links}>
        <h1 className="text-3xl font-bold mb-6">Manajemen Pengguna</h1>
        
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 font-semibold">Username</th>
                  <th className="p-4 font-semibold">Email</th>
                  <th className="p-4 font-semibold">Peran</th>
                  <th className="p-4 font-semibold">Tanggal Daftar</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-4 font-medium">{u.username}</td>
                    <td className="p-4">{u.email}</td>
                    <td className="p-4">
                      <div className="flex gap-1 flex-wrap">
                        {u.roles.map((r: any) => (
                          <span key={r.role} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                            {r.role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
