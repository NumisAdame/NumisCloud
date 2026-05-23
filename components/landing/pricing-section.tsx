'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import { Check, X, Crown, Sparkles } from 'lucide-react';

const plans = [
  {
    name: 'Gratuito',
    price: '0',
    period: '',
    description: 'Perfecto para empezar',
    features: [
      { text: 'Hasta 20 piezas', included: true },
      { text: 'Campos completos de catalogación', included: true },
      { text: 'Imágenes (anverso/reverso)', included: true },
      { text: 'Búsqueda y filtros', included: true },
      { text: 'Etiquetas y álbumes', included: true },
      { text: '7 días de Chat IA gratis', included: true },
      { text: 'Piezas ilimitadas', included: false },
    ],
    cta: 'Comenzar gratis',
    href: '/registro',
    highlight: false,
  },
  {
    name: 'Mensual',
    price: '1,99',
    period: '/mes',
    description: 'Para coleccionistas activos',
    features: [
      { text: 'Piezas ilimitadas', included: true },
      { text: 'Todos los campos de catalogación', included: true },
      { text: 'Imágenes ilimitadas', included: true },
      { text: 'Búsqueda y filtros avanzados', included: true },
      { text: 'Etiquetas y álbumes ilimitados', included: true },
      { text: 'Chat IA numismático completo', included: true },
      { text: 'Soporte prioritario', included: true },
    ],
    cta: 'Suscribirse',
    href: '/registro',
    highlight: false,
  },
  {
    name: 'Anual',
    price: '14,99',
    period: '/año',
    description: 'Ahorra ~37% — la mejor opción',
    badge: 'Más popular',
    features: [
      { text: 'Todo lo del plan mensual', included: true },
      { text: 'Piezas ilimitadas', included: true },
      { text: 'Imágenes ilimitadas', included: true },
      { text: 'Búsqueda y filtros avanzados', included: true },
      { text: 'Etiquetas y álbumes ilimitados', included: true },
      { text: 'Chat IA numismático completo', included: true },
      { text: 'Equivale a €1,25/mes', included: true },
    ],
    cta: 'Suscribirse anual',
    href: '/registro',
    highlight: true,
  },
];

export function PricingSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="precios" className="py-20 sm:py-28 bg-graphite" ref={ref}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-ivory tracking-tight mb-4">
            Planes y precios
          </h2>
          <p className="text-lg text-ivory/60 max-w-2xl mx-auto">
            Empieza gratis y mejora cuando lo necesites. Sin compromisos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map((plan: any, i: number) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className={`relative rounded-2xl p-6 flex flex-col ${
                plan.highlight
                  ? 'bg-gradient-to-b from-gold/20 to-gold/5 border-2 border-gold/40 shadow-lg shadow-gold/10'
                  : 'bg-graphite-light border border-ivory/10'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-graphite text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-display text-xl font-bold text-ivory mb-1">{plan.name}</h3>
                <p className="text-sm text-ivory/50">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-gold">€{plan.price}</span>
                {plan.period && <span className="text-ivory/50 text-sm">{plan.period}</span>}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {(plan.features ?? []).map((f: any) => (
                  <li key={f.text} className="flex items-start gap-2 text-sm">
                    {f.included ? (
                      <Check className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                    ) : (
                      <X className="h-4 w-4 text-ivory/20 mt-0.5 flex-shrink-0" />
                    )}
                    <span className={f.included ? 'text-ivory/80' : 'text-ivory/30'}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Link href={plan.href}>
                <Button
                  className={`w-full font-semibold ${
                    plan.highlight
                      ? 'bg-gold hover:bg-gold-dark text-graphite'
                      : 'bg-ivory/10 hover:bg-ivory/15 text-ivory border border-ivory/20'
                  }`}
                >
                  {plan.highlight && <Sparkles className="h-4 w-4 mr-1" />}
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
