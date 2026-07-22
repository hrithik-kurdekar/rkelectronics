// app/admin/layout.js
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { User, LogOut, LayoutDashboard, Box, Link2, Menu, X } from 'lucide-react';

export default function AdminLayoutWrapper({ children }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/404';
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Inventory', path: '/admin/inventory', icon: Box },
    { name: 'Platform Connections', path: '/admin/settings', icon: Link2 },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 relative">
      
      {/* --- Top Navigation Header Bar (Shared Admin Layout) --- */}
      <nav className="w-full bg-zinc-900 border-b border-zinc-800 px-4 md:px-6 py-3.5 flex items-center justify-between sticky top-0 z-40">
        
        {/* Left Column: Brand Logo */}
        <div className="flex items-center flex-1 md:flex-initial">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-sm tracking-wider text-white flex-shrink-0">
              RK
            </div>
            <span className="font-bold text-sm text-white tracking-tight whitespace-nowrap">RK Electronics</span>
          </div>
        </div>

        {/* Center Column: Centralized Global Nav Menu Items (Desktop Only) */}
        <div className="hidden md:flex items-center justify-center gap-1.5 text-xs font-medium flex-1 px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  isActive
                    ? 'bg-zinc-800 text-blue-400 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Right Column: User Account & Session Controls (Desktop Only) */}
        <div className="hidden md:flex items-center justify-end gap-2.5 flex-shrink-0">
          <div className="flex items-center gap-2 px-2.5 py-1.5 bg-zinc-950 border border-zinc-800/80 rounded-xl">
            <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400">
              <User className="w-3 h-3" />
            </div>
            <span className="text-xs font-semibold text-zinc-300">Account (Admin)</span>
          </div>

          <button
            onClick={handleLogout}
            title="Terminate Session"
            className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-950/20 rounded-xl transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Interface: Hamburger Action Button */}
        <div className="md:hidden flex items-center ml-auto">
          <button
            type="button"
            onClick={toggleMobileMenu}
            className="p-2 text-zinc-400 hover:text-zinc-100 bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition"
            aria-label="Toggle Navigation Tray"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* --- Mobile Dropdown Panel Drawer Overlay --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden w-full bg-zinc-900 border-b border-zinc-800 absolute top-[57px] left-0 z-30 flex flex-col p-4 space-y-4 animate-fade-in shadow-2xl">
          <div className="flex flex-col space-y-1">
            <span className="text-[9px] font-bold tracking-wider uppercase text-zinc-500 px-3 pb-1">Navigation Navigation Matrix</span>
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-zinc-950 border border-zinc-800 text-blue-400'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                >
                  <IconComponent className="w-4 h-4 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Account & Logout Block Context inside Mobile Tray */}
          <div className="border-t border-zinc-800/80 pt-3 flex flex-col space-y-2">
            <div className="flex items-center justify-between px-3 py-2 bg-zinc-950 border border-zinc-800/80 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400">
                  <User className="w-3 h-3" />
                </div>
                <span className="text-xs font-semibold text-zinc-300">Account (Admin)</span>
              </div>
            </div>
            
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-red-400 bg-red-950/10 hover:bg-red-950/20 border border-red-900/20 rounded-xl transition"
            >
              <LogOut className="w-3.5 h-3.5" /> Close Administrative Session
            </button>
          </div>
        </div>
      )}

      {/* --- Primary Workspace Panel (Takes remaining viewport space) --- */}
      <main className="flex-1 w-full flex flex-col min-h-0">
        {children}
      </main>

    </div>
  );
}