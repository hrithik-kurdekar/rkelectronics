'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { isDemoMode } from '@/lib/data';
import { ADMIN_CONTAINER } from '@/lib/storefront-layout';
import {
  User,
  LogOut,
  LayoutDashboard,
  Box,
  Link2,
  Menu,
  X,
  Cpu,
  ExternalLink,
} from 'lucide-react';

export default function AdminLayoutWrapper({ children }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const demoMode = isDemoMode();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/404';
  };

  const navItems = [
    { name: 'Dashboard', shortName: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Inventory', shortName: 'Inventory', path: '/admin/inventory', icon: Box },
    {
      name: 'Platform Connections',
      shortName: 'Connections',
      path: '/admin/settings',
      icon: Link2,
    },
  ];

  return (
    <div className="h-dvh max-h-dvh flex flex-col overflow-hidden bg-zinc-950 text-zinc-100">
      <header className="shrink-0 z-40 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
        <div className={`${ADMIN_CONTAINER} h-16 flex items-center gap-4`}>
          <Link href="/admin/dashboard" className="flex items-center gap-2.5 flex-shrink-0 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-blue-600/20">
              <Cpu className="w-[1.15rem] h-[1.15rem]" />
            </div>
            <div className="min-w-0 hidden sm:block">
              <span className="text-sm font-bold tracking-tight text-white uppercase block truncate">
                RK Electronics
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Admin
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  title={item.name}
                  className={`inline-flex items-center gap-2 h-9 px-3.5 rounded-lg text-xs font-semibold uppercase tracking-wide transition ${
                    isActive
                      ? 'bg-zinc-800/90 text-blue-400 ring-1 ring-zinc-700/80'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  {item.shortName}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
            {demoMode && (
              <span className="hidden md:inline-flex text-[10px] px-2 py-1 border rounded-md font-mono text-amber-400 bg-amber-500/5 border-amber-500/20">
                demo
              </span>
            )}

            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Store
            </Link>

            <div className="hidden md:flex items-center gap-2 pl-2 ml-1 border-l border-zinc-800">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500/30 to-violet-500/30 border border-zinc-700 flex items-center justify-center">
                  <User className="w-3 h-3 text-zinc-300" />
                </div>
                <span className="text-xs font-semibold text-zinc-300">Admin</span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                title="Sign out"
                className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/30 border border-transparent hover:border-red-900/30 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className="lg:hidden h-9 w-9 inline-flex items-center justify-center rounded-lg border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-900 transition"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className={`lg:hidden border-t border-zinc-800 bg-zinc-950 ${ADMIN_CONTAINER} py-4 space-y-4`}>
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                      isActive
                        ? 'bg-zinc-900 border border-zinc-800 text-blue-400'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-zinc-300 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View store
              </Link>
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="inline-flex items-center justify-center h-10 w-10 rounded-xl text-red-400 bg-red-950/20 border border-red-900/30 hover:bg-red-950/40 transition"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      {demoMode && (
        <div className="shrink-0 bg-amber-950/40 border-b border-amber-800/50">
          <div className={`${ADMIN_CONTAINER} py-2 text-center text-[11px] text-amber-200/90`}>
            Demo mode — catalog is local fixtures (read-only). Set{' '}
            <code className="font-mono text-amber-100">NEXT_PUBLIC_DEMO_MODE=false</code> to use
            Supabase.
          </div>
        </div>
      )}

      <main className="flex-1 w-full flex flex-col min-h-0 overflow-hidden">{children}</main>
    </div>
  );
}
