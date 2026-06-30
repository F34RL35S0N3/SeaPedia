import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isLoggedIn, getActiveRole } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/auth/login');
      return;
    }
    const role = getActiveRole();
    if (allowedRoles && role && !allowedRoles.includes(role)) {
      router.push('/');
      return;
    }
    setAuthorized(true);
  }, [router, allowedRoles]);

  if (!authorized) return null;

  return <>{children}</>;
}
