'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Building2, Settings, LogOut } from 'lucide-react';
import { navForRole, friendlyRoleName } from '@/lib/auth';
import { useProfile } from '@/lib/profile-context';
import { createClient } from '@/lib/supabase/client';
import ThemeToggle from './ThemeToggle';

const ICONS: Record<string, React.ElementType> = {
  '/dashboard': LayoutDashboard,
  '/contacts': Users,
  '/directory': Building2,
  '/settings': Settings
};

export default function Sidebar() {
  const profile = useProfile();
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const items = navForRole(profile.department);

    async function signOut() {
    await supabase.auth.signOut();
    window.location.assign('/login');
  }

  return (
    <aside className="flex h-screen w-60 flex-col justify-between border-r border-cobalt-900/40 bg-midnight text-white">
      <div>
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-cobalt-500 font-mono text-xs font-semibold">
            OC
          </div>
          <span className="text-sm font-semibold tracking-tight">Committee CRM</span>
        </div>

        <nav className="mt-2 flex flex-col gap-0.5 px-3">
          {items.map((item) => {
            const Icon = ICONS[item.href] ?? LayoutDashboard;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  active ? 'bg-white/10 font-medium text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-white/10 px-4 py-4">
        <div className="mb-3">
          <p className="text-sm font-medium">{profile.name}</p>
          <p className="text-xs text-white/50">{friendlyRoleName(profile.department)}</p>
        </div>
        <div className="flex flex-col gap-0.5">
          <ThemeToggle variant="sidebar" />
          <button
            onClick={signOut}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-white/70 hover:bg-white/5 hover:text-white"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
