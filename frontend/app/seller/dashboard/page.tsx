'use client';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function SellerDashboard() {
  const links = [
    { label: 'Beranda', href: '/seller/dashboard' },
    { label: 'Toko Saya', href: '/seller/store' },
    { label: 'Produk', href: '/seller/products' },
    { label: 'Pesanan', href: '/seller/orders' },
    { label: 'Laporan', href: '/seller/reports' },
  ];

  return (
    <ProtectedRoute allowedRoles={['SELLER']}>
      <DashboardLayout title="Dashboard Penjual" links={links}>
        <h1 className="text-3xl font-bold mb-4">Selamat Datang, Penjual!</h1>
        <p className="text-gray-600">Kelola toko, produk, dan pesanan Anda di sini.</p>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
