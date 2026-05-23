'use client';

import { useState, useEffect } from 'react';
import { formatYear } from '@/lib/utils';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Coins, Plus, FolderOpen, MessageCircle, BarChart3,
  TrendingUp, Archive, Tag
} from 'lucide-react';
import { PIECE_TYPES } from '@/lib/constants';
import { motion } from 'framer-motion';

interface Stats {
  total: number;
  byType: { type: string; _count: { id: number } }[];
  byStatus: { status: string; _count: { id: number } }[];
  totalValue: number;
  recentPieces: any[];
}

export function DashboardContent() {
  const { data: session } = useSession() || {};
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/pieces/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err: any) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const userName = session?.user?.name ?? session?.user?.email?.split('@')?.[0] ?? 'Coleccionista';

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
          Hola, <span className="text-gold">{userName}</span>
        </h1>
        <p className="text-muted-foreground mt-1">Panel de control de tu colección numismática</p>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/coleccion/nueva">
          <Button className="bg-gold hover:bg-gold-dark text-graphite font-semibold">
            <Plus className="h-4 w-4 mr-1" /> Añadir pieza
          </Button>
        </Link>
        <Link href="/coleccion">
          <Button variant="outline">
            <FolderOpen className="h-4 w-4 mr-1" /> Ver colección
          </Button>
        </Link>
        <Link href="/chat">
          <Button variant="outline">
            <MessageCircle className="h-4 w-4 mr-1" /> Chat IA
          </Button>
        </Link>
      </div>

      {/* Stats cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i: number) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                    <Coins className="h-5 w-5 text-gold" />
                  </div>
                  <span className="text-sm text-muted-foreground">Total piezas</span>
                </div>
                <p className="text-3xl font-bold font-mono">{stats?.total ?? 0}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-forest/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-forest" />
                  </div>
                  <span className="text-sm text-muted-foreground">Valor estimado</span>
                </div>
                <p className="text-3xl font-bold font-mono">
                  €{(stats?.totalValue ?? 0)?.toLocaleString?.('es-ES', { minimumFractionDigits: 2 }) ?? '0,00'}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-copper/10 flex items-center justify-center">
                    <Archive className="h-5 w-5 text-copper" />
                  </div>
                  <span className="text-sm text-muted-foreground">En colección</span>
                </div>
                <p className="text-3xl font-bold font-mono">
                  {stats?.byStatus?.find((s: any) => s?.status === 'EN_COLECCION')?._count?.id ?? 0}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Tag className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">Tipos</span>
                </div>
                <p className="text-3xl font-bold font-mono">{stats?.byType?.length ?? 0}</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Distribution by type */}
      {!loading && (stats?.byType?.length ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-gold" />
              Distribución por tipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(stats?.byType ?? []).map((item: any) => {
                const label = PIECE_TYPES?.find((t: any) => t.value === item?.type)?.label ?? item?.type ?? '';
                const count = item?._count?.id ?? 0;
                const pct = stats?.total ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={item?.type ?? ''} className="flex items-center gap-3">
                    <span className="text-sm w-32 text-muted-foreground truncate">{label}</span>
                    <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gold transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm font-mono w-12 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent pieces */}
      {!loading && (stats?.recentPieces?.length ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Coins className="h-5 w-5 text-gold" />
              Piezas recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(stats?.recentPieces ?? []).map((piece: any) => (
                <Link
                  key={piece?.id}
                  href={`/coleccion/${piece?.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <Coins className="h-5 w-5 text-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{piece?.title ?? 'Sin título'}</p>
                    <p className="text-xs text-muted-foreground">
                      {piece?.country ?? ''} {piece?.year ? `• ${formatYear(piece.year)}` : ''}
                    </p>
                  </div>
                  {piece?.estimatedValue != null && (
                    <span className="text-sm font-mono text-gold">
                      €{Number(piece.estimatedValue)?.toLocaleString?.('es-ES', { minimumFractionDigits: 2 }) ?? '0,00'}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!loading && (stats?.total ?? 0) === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Coins className="h-16 w-16 text-gold/30 mx-auto mb-4" />
            <h3 className="text-xl font-display font-semibold mb-2">Tu colección está vacía</h3>
            <p className="text-muted-foreground mb-6">Añade tu primera pieza para empezar a gestionar tu colección.</p>
            <Link href="/coleccion/nueva">
              <Button className="bg-gold hover:bg-gold-dark text-graphite font-semibold">
                <Plus className="h-4 w-4 mr-1" /> Añadir primera pieza
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
