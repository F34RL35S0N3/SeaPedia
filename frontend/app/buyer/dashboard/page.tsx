'use client';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function BuyerDashboard() {
  const links = [
    { label: 'Beranda', href: '/buyer/dashboard' },
    { label: 'Dompet', href: '/buyer/wallet' },
    { label: 'Alamat', href: '/buyer/addresses' },
    { label: 'Keranjang', href: '/buyer/cart' },
    { label: 'Pesanan', href: '/buyer/orders' },
    { label: 'Laporan', href: '/buyer/reports' },
  ];

  return (
    <ProtectedRoute allowedRoles={['BUYER']}>
      <DashboardLayout title="Dashboard Pembeli" links={links}>
        <h1 className="text-3xl font-bold mb-4">Selamat Datang, Pembeli!</h1>
        <p className="text-gray-600">Gunakan menu di samping untuk mengelola akun Anda.</p>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
