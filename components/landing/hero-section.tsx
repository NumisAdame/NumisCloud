'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Coins, ArrowRight, Shield, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export function HeroSection() {
  return (
    <section className="relative pt-24 pb-20 sm:pt-32 sm:pb-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-graphite via-graphite-light to-graphite" />
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, #C5A55A 1px, transparent 0)',
        backgroundSize: '40px 40px',
      }} />

      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="h-4 w-4 text-gold" />
            <span className="text-sm text-gold font-medium">Plataforma profesional de numismática</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-ivory tracking-tight leading-[1.1] mb-6">
            Tu colección numismática,{' '}
            <span className="gold-shimmer">en la nube</span>
          </h1>

          <p className="text-lg sm:text-xl text-ivory/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Cataloga, gestiona y valora tu colección de monedas, billetes y medallas
            con herramientas profesionales e inteligencia artificial.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/registro">
              <Button size="lg" className="bg-gold hover:bg-gold-dark text-graphite font-bold text-base px-8 py-6 shadow-lg shadow-gold/20">
                Comenzar gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="/#funciones">
              <Button variant="outline" size="lg" className="border-gold/40 text-gold hover:bg-gold/10 px-8 py-6 text-base">
                Ver funciones
              </Button>
            </a>
          </div>

          <div className="flex items-center justify-center gap-8 mt-12 text-ivory/40 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-gold/60" />
              <span>Datos seguros y privados</span>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-gold/60" />
              <span>Hasta 20 piezas gratis</span>
            </div>
          </div>
        </motion.div>

        {/* Decorative coins */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.15, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="absolute -top-10 -left-20 w-72 h-72 rounded-full border-2 border-gold/30 hidden lg:block"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.5 }}
          className="absolute -bottom-16 -right-16 w-96 h-96 rounded-full border-2 border-copper/20 hidden lg:block"
        />
      </div>
    </section>
  );
}
