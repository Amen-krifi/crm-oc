'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  BookOpen,
  Building2,
  Settings,
  LogOut,
  Package,
  TrendingUp,
  Megaphone,
  HeartHandshake,
  ShieldCheck,
  Database,
  Menu,
  X
} from 'lucide-react';
import { navForRole, friendlyRoleName, isAdmin, isDIM, isOCVP } from '@/lib/auth';
import { useProfile } from '@/lib/profile-context';
import { createClient } from '@/lib/supabase/client';
import ThemeToggle from './ThemeToggle';

const ICONS: Record<string, React.ElementType> = {
  '/dashboard': LayoutDashboard,
  '/tasks': CheckSquare,
  '/contacts': Users,
  '/toolkit': BookOpen,
  '/directory': Building2,
  '/settings': Settings
};

export default function Sidebar() {
  const profile = useProfile();
  const pathname = usePathname();
  const supabase = createClient();
  const items = navForRole(profile.department);
  const userIsAdmin = isAdmin(profile.department);
  const userIsDIM = isDIM(profile);
  const userIsOCVP = isOCVP(profile);
  const [mobileOpen, setMobileOpen] = useState(false);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.assign('/login');
  }

  const ocvpPages = [
    { href: '/ocvp/logistics', label: 'OCVP Logistics', icon: Package, badge: 'Ops' },
    { href: '/ocvp/sales', label: 'OCVP Sales', icon: TrendingUp, badge: 'Rev' },
    { href: '/ocvp/marketing', label: 'OCVP Marketing', icon: Megaphone, badge: 'Media' },
    { href: '/ocvp/participant-xp', label: 'OCVP Participant XP & PR', icon: HeartHandshake, badge: 'VIP' }
  ];

  const content = (
    <div className="flex h-full flex-col justify-between">
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-cobalt-500 font-mono text-xs font-bold text-white shadow-sm">
              OC
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight leading-tight">Organizing Committee</span>
              <span className="text-[11px] text-white/50">Operations &amp; CRM</span>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-white/70 hover:text-white p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* OCVP DIM Banner if user is DIM */}
        {userIsDIM && (
          <div className="mx-3 mt-3">
            <Link
              href="/dim"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-xs font-medium transition-all ${
                pathname.startsWith('/dim')
                  ? 'border-amber-400/50 bg-amber-500/20 text-amber-200 shadow-sm'
                  : 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
              }`}
            >
              <Database size={16} className="text-amber-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[11px] uppercase tracking-wider text-amber-400">Head of DIM</span>
                  <span className="rounded bg-amber-400/20 px-1 py-0.2 text-[9px] text-amber-300 font-mono">SUPREME</span>
                </div>
                <p className="truncate text-white/90 text-xs mt-0.5">DIM Command Center</p>
              </div>
            </Link>
          </div>
        )}

        {/* Main Navigation */}
        <div className="px-3 pt-3">
          <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-white/40">
            Workspace
          </div>
          <nav className="flex flex-col gap-0.5">
            {items.map((item) => {
              const Icon = ICONS[item.href] ?? LayoutDashboard;
              const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                    active ? 'bg-white/15 font-medium text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* OCVP Management Hubs (Visible to OCVPs, Admins, and DIM) */}
        {(userIsAdmin || userIsOCVP) && (
          <div className="px-3 pt-4">
            <div className="flex items-center justify-between px-2 pb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                OCVP Management
              </span>
              <span className="text-[9px] rounded bg-cobalt-500/20 px-1 text-cobalt-300">VP Desk</span>
            </div>
            <nav className="flex flex-col gap-0.5">
              {ocvpPages.map((page) => {
                const Icon = page.icon;
                const active = pathname.startsWith(page.href);
                return (
                  <Link
                    key={page.href}
                    href={page.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between rounded-md px-3 py-1.5 text-xs transition-colors ${
                      active ? 'bg-white/15 font-medium text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon size={15} />
                      <span className="truncate">{page.label}</span>
                    </div>
                    <span className="text-[9px] opacity-60 font-mono">{page.badge}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* User profile footer */}
      <div className="border-t border-white/10 px-4 py-3 bg-midnight/80">
        <div className="mb-2.5 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="truncate text-sm font-medium text-white">{profile.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {userIsDIM ? (
                <span className="inline-flex items-center gap-1 rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-medium text-amber-300">
                  <ShieldCheck size={11} /> OCVP DIM
                </span>
              ) : (
                <span className="truncate text-xs text-white/50">{friendlyRoleName(profile.department)}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between pt-1">
          <ThemeToggle variant="sidebar" />
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-white/70 hover:bg-white/5 hover:text-white transition-colors"
          >
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top trigger */}
      <div className="md:hidden fixed top-3 left-3 z-40">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-semibold text-ink shadow-sm"
        >
          <Menu size={16} />
          <span>Menu</span>
        </button>
      </div>

      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-midnight text-white transition-transform duration-200 md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {content}
      </aside>

      {/* Desktop static sidebar */}
      <aside className="hidden md:flex h-screen w-64 shrink-0 flex-col justify-between border-r border-cobalt-900/40 bg-midnight text-white">
        {content}
      </aside>
    </>
  );
}

