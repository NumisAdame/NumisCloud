'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BookOpen, MessageSquare, Plus, ChevronRight, Users, Clock,
  Coins, Scale, ShieldAlert, CalendarDays, Newspaper, ShoppingBag,
  HelpCircle, Eye, Award, Map, AlertTriangle, Star, Hash
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, any> = {
  'monedas-antiguas': Coins,
  'monedas-romanas': Award,
  'monedas-medievales': Scale,
  'moneda-espanola': Star,
  'euros': Hash,
  'billetes': Coins,
  'medallas-y-condecoraciones': Award,
  'identificacion-de-piezas': Eye,
  'valoraciones-orientativas': Scale,
  'dudas-de-conservacion': HelpCircle,
  'ferias-y-eventos': CalendarDays,
  'piezas-robadas-o-sospechosas': ShieldAlert,
  'noticias-numismaticas': Newspaper,
  'compra-venta-segura': ShoppingBag,
};

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  topicCount: number;
  latestTopic?: {
    id: string;
    title: string;
    createdAt: string;
    author: { id: string; name: string };
  };
}

export function ForumContent() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession() || {};
  const userRole = (session?.user as any)?.role;
  const canCreateTopic = userRole === 'ADMIN' || userRole === 'MODERATOR';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/forum/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data?.categories ?? []);
        }
      } catch (err) {
        console.error('Forum categories error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-gold" /> Foro Numismático
          </h1>
          <p className="text-muted-foreground mt-1">Debate, pregunta y comparte con la comunidad</p>
        </div>
        {canCreateTopic && (
          <Link href="/foro/nuevo">
            <Button className="bg-gold hover:bg-gold-dark text-graphite font-semibold">
              <Plus className="h-4 w-4 mr-1" /> Nuevo tema
            </Button>
          </Link>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <BookOpen className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-muted-foreground">No hay categorías todavía. Pronto se añadirán.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.slug] || MessageSquare;
            return (
              <Link key={cat.id} href={`/foro/${cat.slug}`}>
                <Card className="hover:shadow-md transition-all group cursor-pointer border-border/50 hover:border-gold/20">
                  <CardContent className="py-4 px-4 sm:px-6 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-gold/10 flex items-center justify-center shrink-0 group-hover:bg-gold/20 transition-colors">
                      <Icon className="h-5 w-5 text-gold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm group-hover:text-gold transition-colors">{cat.name}</h3>
                        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">                          {cat.topicCount} {cat.topicCount === 1 ? 'tema' : 'temas'}
                        </span>
                      </div>
                      {cat.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{cat.description}</p>
                      )}
                      {cat.latestTopic && (
                        <p className="text-[11px] text-muted-foreground/60 mt-1 truncate">
                          <Clock className="h-3 w-3 inline mr-1" />
                          Último: <span className="text-muted-foreground">{cat.latestTopic.title}</span>
                          {' por '}
                          <span className="text-gold/60">{cat.latestTopic.author.name || 'Anónimo'}</span>
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-gold shrink-0 transition-colors" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
