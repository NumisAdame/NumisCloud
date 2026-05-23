'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  FolderOpen, Camera, MessageCircle, Search,
  Tags, BarChart3, Shield, Globe
} from 'lucide-react';

const features = [
  {
    icon: FolderOpen,
    title: 'Catalogación completa',
    description: 'Más de 25 campos por pieza: tipo, país, año, ceca, metal, peso, conservación, rareza, valor y mucho más.',
  },
  {
    icon: Camera,
    title: 'Imágenes de alta calidad',
    description: 'Sube fotos del anverso, reverso y detalles adicionales. Almacenamiento seguro en la nube.',
  },
  {
    icon: MessageCircle,
    title: 'Chat IA numismático',
    description: 'Identifica monedas, consulta historia, obtiene valoraciones aproximadas y descripciones profesionales.',
  },
  {
    icon: Search,
    title: 'Búsqueda avanzada',
    description: 'Filtra por país, año, metal, tipo, conservación, valor y más. Encuentra cualquier pieza al instante.',
  },
  {
    icon: Tags,
    title: 'Etiquetas y álbumes',
    description: 'Organiza tu colección con etiquetas personalizadas y agrupa piezas en álbumes temáticos.',
  },
  {
    icon: BarChart3,
    title: 'Estadísticas detalladas',
    description: 'Visualiza el valor total, distribución por tipo, país y material. Controla tu colección.',
  },
  {
    icon: Shield,
    title: 'Privacidad y seguridad',
    description: 'Tus datos son privados por defecto. Comparte solo lo que desees, con quien desees.',
  },
  {
    icon: Globe,
    title: 'Acceso desde cualquier lugar',
    description: 'Diseñado para móvil, tablet y escritorio. Tu colección siempre contigo, donde estés.',
  },
];

export function FeaturesSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="funciones" className="py-20 sm:py-28 bg-ivory" ref={ref}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-graphite tracking-tight mb-4">
            Todo lo que necesitas para tu colección
          </h2>
          <p className="text-lg text-graphite/60 max-w-2xl mx-auto">
            Herramientas profesionales diseñadas por y para coleccionistas numismáticos
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature: any, i: number) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors">
                  <Icon className="h-6 w-6 text-gold" />
                </div>
                <h3 className="font-display text-lg font-semibold text-graphite mb-2">{feature.title}</h3>
                <p className="text-sm text-graphite/60 leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
