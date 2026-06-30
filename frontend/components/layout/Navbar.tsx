import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUser, isLoggedIn, clearAuth, AuthUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import api from '@/lib/api';

export default function Navbar() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    setUser(getUser());
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {}
    clearAuth();
    setUser(null);
    router.push('/');
  };

  const roleColors: Record<string, string> = {
    BUYER: 'bg-blue-500',
    SELLER: 'bg-green-500',
    DRIVER: 'bg-orange-500',
    ADMIN: 'bg-red-500',
  };

  return (
    <nav className="border-b bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-8">
            <Link href="/" className="font-bold text-2xl text-blue-600">SEAPEDIA</Link>
            <div className="hidden md:flex space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link>
              <Link href="/products" className="text-gray-600 hover:text-gray-900">Products</Link>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <span className="font-medium">{user.username}</span>
                {user.activeRole && (
                  <Badge className={`${roleColors[user.activeRole] || 'bg-gray-500'} text-white`}>
                    {user.activeRole}
                  </Badge>
                )}
                <Button variant="outline" onClick={() => router.push(`/${user.activeRole?.toLowerCase()}/dashboard`)}>
                  Dashboard
                </Button>
                <Button variant="destructive" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => router.push('/auth/login')}>Login</Button>
                <Button onClick={() => router.push('/auth/register')}>Register</Button>
              </>
            )}
          </div>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost">☰</Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col space-y-4 mt-8">
                  <Link href="/" className="text-lg">Home</Link>
                  <Link href="/products" className="text-lg">Products</Link>
                  {user ? (
                    <>
                      <div className="flex items-center space-x-2">
                        <span>{user.username}</span>
                        {user.activeRole && (
                          <Badge className={`${roleColors[user.activeRole] || 'bg-gray-500'} text-white`}>
                            {user.activeRole}
                          </Badge>
                        )}
                      </div>
                      <Button variant="outline" onClick={() => router.push(`/${user.activeRole?.toLowerCase()}/dashboard`)}>
                        Dashboard
                      </Button>
                      <Button variant="destructive" onClick={handleLogout}>Logout</Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" onClick={() => router.push('/auth/login')}>Login</Button>
                      <Button onClick={() => router.push('/auth/register')}>Register</Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
