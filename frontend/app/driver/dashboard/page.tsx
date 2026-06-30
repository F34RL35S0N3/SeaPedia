'use client';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function DriverDashboard() {
  const links = [
    { label: 'Beranda', href: '/driver/dashboard' },
    { label: 'Cari Pekerjaan', href: '/driver/jobs' },
    { label: 'Pekerjaan Saya', href: '/driver/history' },
    { label: 'Penghasilan', href: '/driver/earnings' },
  ];

  return (
    <ProtectedRoute allowedRoles={['DRIVER']}>
      <DashboardLayout title="Dashboard Pengemudi" links={links}>
        <h1 className="text-3xl font-bold mb-4">Selamat Datang, Pengemudi!</h1>
        <p className="text-gray-600">Temukan pekerjaan pengiriman dan pantau penghasilan Anda.</p>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
