import Link from 'next/link';

interface DashboardLayoutProps {
  children: React.ReactNode;
  links: { label: string; href: string }[];
  title: string;
}

export default function DashboardLayout({ children, links, title }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-[calc(100vh-130px)]">
      <aside className="w-64 bg-gray-50 border-r p-6 hidden md:block">
        <h2 className="text-xl font-semibold mb-6">{title}</h2>
        <nav className="space-y-2">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="block px-4 py-2 rounded-md hover:bg-gray-200 text-gray-700">
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
