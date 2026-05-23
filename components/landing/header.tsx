'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Menu, X, Coins, LogOut, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LandingHeader() {
  const { data: session } = useSession() || {};
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-graphite/95 backdrop-blur-md border-b border-gold/20">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 group">
          <Coins className="h-7 w-7 text-gold" />
          <span className="font-display text-xl font-bold text-ivory tracking-tight">NumisCloud</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/#funciones" className="text-sm text-ivory/70 hover:text-gold transition-colors">Funciones</Link>
          <Link href="/#precios" className="text-sm text-ivory/70 hover:text-gold transition-colors">Precios</Link>
          <Link href="/noticias" className="text-sm text-ivory/70 hover:text-gold transition-colors">Noticias</Link>
          <Link href="/eventos" className="text-sm text-ivory/70 hover:text-gold transition-colors">Eventos</Link>
          <Link href="/piezas-robadas" className="text-sm text-ivory/70 hover:text-gold transition-colors">Piezas Robadas</Link>
          <Link href="/foro" className="text-sm text-ivory/70 hover:text-gold transition-colors">Foro</Link>
          {session?.user ? (
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="border-gold/40 text-gold hover:bg-gold/10">
                  <LayoutDashboard className="h-4 w-4 mr-1" />
                  Panel
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut?.({ callbackUrl: '/' })}
                className="text-ivory/60 hover:text-ivory hover:bg-white/5"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Salir
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-ivory/80 hover:text-gold hover:bg-white/5">
                  Iniciar sesión
                </Button>
              </Link>
              <Link href="/registro">
                <Button size="sm" className="bg-gold hover:bg-gold-dark text-graphite font-semibold">
                  Registrarse
                </Button>
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-ivory p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menú"
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div className={cn(
        'md:hidden overflow-hidden transition-all duration-300 bg-graphite/98 border-t border-gold/10',
        menuOpen ? 'max-h-96' : 'max-h-0'
      )}>
        <div className="px-4 py-4 flex flex-col gap-3">
          <Link href="/#funciones" className="text-sm text-ivory/70 hover:text-gold py-2" onClick={() => setMenuOpen(false)}>Funciones</Link>
          <Link href="/#precios" className="text-sm text-ivory/70 hover:text-gold py-2" onClick={() => setMenuOpen(false)}>Precios</Link>
          <Link href="/noticias" className="text-sm text-ivory/70 hover:text-gold py-2" onClick={() => setMenuOpen(false)}>Noticias</Link>
          <Link href="/eventos" className="text-sm text-ivory/70 hover:text-gold py-2" onClick={() => setMenuOpen(false)}>Eventos</Link>
          <Link href="/piezas-robadas" className="text-sm text-ivory/70 hover:text-gold py-2" onClick={() => setMenuOpen(false)}>Piezas Robadas</Link>
          <Link href="/foro" className="text-sm text-ivory/70 hover:text-gold py-2" onClick={() => setMenuOpen(false)}>Foro</Link>
          {session?.user ? (
            <>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full border-gold/40 text-gold">Panel</Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => signOut?.({ callbackUrl: '/' })} className="text-ivory/60 w-full">Salir</Button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full text-ivory/80">Iniciar sesión</Button>
              </Link>
              <Link href="/registro" onClick={() => setMenuOpen(false)}>
                <Button size="sm" className="w-full bg-gold hover:bg-gold-dark text-graphite font-semibold">Registrarse</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
