'use client';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function AdminDashboard() {
  const links = [
    { label: 'Beranda', href: '/admin/dashboard' },
    { label: 'Pengguna', href: '/admin/users' },
    { label: 'Toko', href: '/admin/stores' },
    { label: 'Produk', href: '/admin/products' },
    { label: 'Pesanan', href: '/admin/orders' },
    { label: 'Diskon', href: '/admin/vouchers' },
    { label: 'Pengiriman', href: '/admin/delivery-jobs' },
    { label: 'Simulasi Waktu', href: '/admin/time-simulation' },
    { label: 'Pesanan Terlambat', href: '/admin/overdue' },
  ];

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <DashboardLayout title="Admin Panel" links={links}>
        <h1 className="text-3xl font-bold mb-4">Selamat Datang, Admin!</h1>
        <p className="text-gray-600">Pantau seluruh aktivitas SEAPEDIA.</p>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
