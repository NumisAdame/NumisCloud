'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import {
  Coins, LayoutDashboard, FolderOpen, MessageCircle,
  CreditCard, Settings, Shield, LogOut, Menu, X, ChevronDown,
  BookOpen, Newspaper, ShieldAlert, CalendarDays, Mail,
  Globe, Users, Send, Bookmark
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/social/notification-bell';

const mainNav = [
  { href: '/dashboard', label: 'Panel', icon: LayoutDashboard },
  { href: '/coleccion', label: 'Colección', icon: FolderOpen },
  { href: '/coleccion/albumes', label: 'Álbumes', icon: BookOpen },
  { href: '/chat', label: 'Chat IA', icon: MessageCircle },
  { href: '/suscripcion', label: 'Suscripción', icon: CreditCard },
  { href: '/perfil', label: 'Perfil', icon: Settings },
];

const socialNav = [
  { href: '/comunidad', label: 'Comunidad', icon: Globe },
  { href: '/foro', label: 'Foro', icon: BookOpen },
  { href: '/comunidad/amigos', label: 'Contactos', icon: Users },
  { href: '/mensajes', label: 'Mensajes', icon: Send },
  { href: '/comunidad/favoritos', label: 'Favoritos', icon: Bookmark },
];

const communityNav = [
  { href: '/noticias', label: 'Noticias', icon: Newspaper },
  { href: '/piezas-robadas', label: 'Piezas Robadas', icon: ShieldAlert },
  { href: '/eventos', label: 'Eventos', icon: CalendarDays },
  { href: '/contacto', label: 'Contacto', icon: Mail },
];

export function AppSidebar() {
  const pathname = usePathname() ?? '';
  const { data: session } = useSession() || {};
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = session?.user?.role === 'ADMIN';

  const adminNav = isAdmin ? [
    { href: '/admin', label: 'Admin', icon: Shield },
    { href: '/admin/noticias', label: 'Gestionar Noticias', icon: Newspaper },
    { href: '/admin/eventos', label: 'Gestionar Eventos', icon: CalendarDays },
    { href: '/admin/robadas', label: 'Denuncias', icon: ShieldAlert },
    { href: '/admin/mensajes', label: 'Mensajes', icon: Mail },
  ] : [];

  const checkActive = (href: string) => {
    if (href === '/coleccion') return pathname === '/coleccion' || (pathname?.startsWith('/coleccion/') && !pathname?.startsWith('/coleccion/albumes'));
    if (href === '/admin') return pathname === '/admin';
    return pathname === href || pathname?.startsWith(href + '/');
  };

  const renderNavItem = (item: any) => {
    const Icon = item.icon;
    const isActive = checkActive(item.href);
    return (
      <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
        className={cn('flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
          isActive ? 'bg-gold/15 text-gold' : 'text-ivory/60 hover:text-ivory hover:bg-white/5'
        )}>
        <Icon className="h-4.5 w-4.5 flex-shrink-0" />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile header bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-graphite border-b border-gold/20 h-14 flex items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Coins className="h-6 w-6 text-gold" />
          <span className="font-display text-lg font-bold text-ivory">NumisCloud</span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-ivory p-2" aria-label="Menú">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed top-0 left-0 h-full z-50 bg-graphite border-r border-gold/10 flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-60',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      )}>
        {/* Logo area */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-gold/10">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <Coins className="h-6 w-6 text-gold" />
              <span className="font-display text-lg font-bold text-ivory">NumisCloud</span>
            </Link>
          )}
          {collapsed && (
            <Link href="/dashboard" className="mx-auto">
              <Coins className="h-6 w-6 text-gold" />
            </Link>
          )}
          <button onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:block text-ivory/50 hover:text-gold p-1" aria-label="Colapsar">
            <ChevronDown className={cn('h-4 w-4 transition-transform', collapsed ? 'rotate-[-90deg]' : 'rotate-90')} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto space-y-1">
          {mainNav.map(renderNavItem)}

          {/* Social section */}
          {!collapsed && <p className="text-[10px] font-bold text-ivory/25 uppercase tracking-wider px-3 pt-4 pb-1">Red Social</p>}
          {collapsed && <hr className="border-gold/10 my-2" />}
          {socialNav.map(renderNavItem)}
          <NotificationBell collapsed={collapsed} />

          {/* Community section */}
          {!collapsed && <p className="text-[10px] font-bold text-ivory/25 uppercase tracking-wider px-3 pt-4 pb-1">Información</p>}
          {collapsed && <hr className="border-gold/10 my-2" />}
          {communityNav.map(renderNavItem)}

          {/* Admin section */}
          {isAdmin && (
            <>
              {!collapsed && <p className="text-[10px] font-bold text-ivory/25 uppercase tracking-wider px-3 pt-4 pb-1">Administración</p>}
              {collapsed && <hr className="border-gold/10 my-2" />}
              {adminNav.map(renderNavItem)}
            </>
          )}
        </nav>

        {/* User / Logout */}
        <div className="border-t border-gold/10 p-3">
          {session?.user && (
            <Link href="/perfil" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 px-2 mb-2 group">
              {session.user.image ? (
                <div className="h-8 w-8 rounded-full overflow-hidden shrink-0 relative border border-gold/20">
                  <Image src={session.user.image as string} alt="Avatar" fill className="object-cover" />
                </div>
              ) : (
                <div className="h-8 w-8 rounded-full bg-gold/20 flex items-center justify-center shrink-0 border border-gold/20">
                  <span className="text-xs font-bold text-gold">
                    {(session.user.name || session.user.email || '?')[0]?.toUpperCase()}
                  </span>
                </div>
              )}
              {!collapsed && (
                <div className="min-w-0">
                  <p className="text-xs text-ivory/70 truncate group-hover:text-gold transition-colors">{session.user.name || 'Usuario'}</p>
                  <p className="text-[10px] text-ivory/30 truncate">{session.user.email ?? ''}</p>
                </div>
              )}
            </Link>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut?.({ callbackUrl: '/' })}
            className={cn(
              'w-full text-ivory/50 hover:text-ivory hover:bg-white/5',
              collapsed ? 'justify-center px-0' : 'justify-start'
            )}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Cerrar sesión</span>}
          </Button>
        </div>
      </aside>
    </>
  );
}
