'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Coins } from 'lucide-react';

export function FooterSection() {
  const [year, setYear] = useState(2026);
  useEffect(() => { setYear(new Date().getFullYear()); }, []);

  return (
    <footer className="py-10 bg-graphite border-t border-gold/10">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-gold" />
              <span className="font-display text-sm font-bold text-ivory">NumisCloud</span>
            </Link>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-ivory/40">
              <Link href="/noticias" className="hover:text-gold transition-colors">Noticias</Link>
              <Link href="/eventos" className="hover:text-gold transition-colors">Eventos</Link>
              <Link href="/contacto" className="hover:text-gold transition-colors">Contacto</Link>
              <Link href="/privacidad" className="hover:text-gold transition-colors">Privacidad</Link>
              <Link href="/terminos" className="hover:text-gold transition-colors">Términos</Link>
              <Link href="/aviso-legal" className="hover:text-gold transition-colors">Aviso legal</Link>
            </div>
          </div>
          <p className="text-xs text-ivory/30 text-center">
            © {year} NumisCloud. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
