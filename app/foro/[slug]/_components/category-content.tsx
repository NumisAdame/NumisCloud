'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft, Plus, MessageSquare, Eye, Pin, Lock, ShieldCheck,
  Search, TrendingUp, Clock, ChevronRight
} from 'lucide-react';

interface Topic {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  closed: boolean;
  isOfficial: boolean;
  views: number;
  createdAt: string;
  author: { id: string; name: string; image?: string; role?: string };
  category: { id: string; name: string; slug: string };
  replyCount: number;
}

export function CategoryContent({ slug }: { slug: string }) {
  const { data: session } = useSession() || {};
  const userRole = (session?.user as any)?.role;
  const canCreateTopic = userRole === 'ADMIN' || userRole === 'MODERATOR';
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'recent' | 'popular'>('recent');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchTopics = async (pageNum = 1, sortBy = sort, q = search) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        slug,
        page: pageNum.toString(),
        limit: '20',
        sort: sortBy,
      });
      if (q.trim()) params.set('search', q.trim());
      const res = await fetch(`/api/forum/topics?${params}`);
      if (res.ok) {
        const data = await res.json();
        setTopics(data?.topics ?? []);
        setTotalPages(data?.totalPages ?? 1);
        setTotal(data?.total ?? 0);
        if (data?.topics?.[0]?.category?.name) setCategoryName(data.topics[0].category.name);
      }
    } catch (err) {
      console.error('Topics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Also get category name from categories endpoint
    fetch('/api/forum/categories').then(r => r.json()).then(data => {
      const cat = (data?.categories ?? []).find((c: any) => c.slug === slug);
      if (cat) setCategoryName(cat.name);
    }).catch(() => {});
    fetchTopics(1);
  }, [slug]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTopics(1, sort, search);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link href="/foro" className="text-sm text-muted-foreground hover:text-gold flex items-center gap-1 mb-2">
            <ArrowLeft className="h-3.5 w-3.5" /> Volver al foro
          </Link>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {categoryName || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{total} {total === 1 ? 'tema' : 'temas'}</p>
        </div>
        {canCreateTopic && (
          <Link href={`/foro/nuevo?category=${slug}`}>
            <Button className="bg-gold hover:bg-gold-dark text-graphite font-semibold">
              <Plus className="h-4 w-4 mr-1" /> Nuevo tema
            </Button>
          </Link>
        )}
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e: any) => setSearch(e.target?.value ?? '')}
              placeholder="Buscar en esta categoría..."
              className="pl-9"
            />
          </div>
          <Button type="submit" size="sm" className="bg-gold hover:bg-gold-dark text-graphite">Buscar</Button>
        </form>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          <button
            onClick={() => { setSort('recent'); setPage(1); fetchTopics(1, 'recent', search); }}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              sort === 'recent' ? 'bg-gold text-graphite' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Clock className="h-3 w-3 inline mr-1" /> Recientes
          </button>
          <button
            onClick={() => { setSort('popular'); setPage(1); fetchTopics(1, 'popular', search); }}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              sort === 'popular' ? 'bg-gold text-graphite' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <TrendingUp className="h-3 w-3 inline mr-1" /> Populares
          </button>
        </div>
      </div>

      {/* Topics List */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16" />)}
        </div>
      ) : topics.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-muted-foreground">No hay temas en esta categoría aún.</p>
            <Link href={`/foro/nuevo?category=${slug}`}>
              <Button variant="outline" size="sm" className="mt-3 border-gold/30 text-gold">
                <Plus className="h-4 w-4 mr-1" /> Crear el primer tema
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {topics.map((topic) => (
            <Link key={topic.id} href={`/foro/tema/${topic.id}`}>
              <Card className={`hover:shadow-md transition-all group cursor-pointer ${topic.isOfficial ? 'border-gold/40 bg-gold/[0.03]' : 'border-border/50 hover:border-gold/20'}`}>
                <CardContent className="py-3 px-4 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {topic.isOfficial && <Badge className="bg-gold/20 text-gold border-gold/40 text-[10px] h-5"><ShieldCheck className="h-3 w-3 mr-0.5" /> Oficial</Badge>}
                      {topic.pinned && !topic.isOfficial && <Badge variant="outline" className="border-gold/30 text-gold text-[10px] h-5"><Pin className="h-3 w-3 mr-0.5" /> Fijado</Badge>}
                      {topic.closed && <Badge variant="outline" className="border-red-500/30 text-red-400 text-[10px] h-5"><Lock className="h-3 w-3 mr-0.5" /> Cerrado</Badge>}
                      <h3 className="font-semibold text-sm group-hover:text-gold transition-colors truncate">{topic.title}</h3>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        {topic.author?.image ? (
                          <div className="h-4 w-4 rounded-full overflow-hidden shrink-0 relative">
                            <Image src={topic.author.image} alt={topic.author.name || 'Avatar'} fill className="object-cover" />
                          </div>
                        ) : (
                          <div className="h-4 w-4 rounded-full bg-gold/20 flex items-center justify-center text-[8px] font-bold text-gold">
                            {(topic.author?.name || '?')[0].toUpperCase()}
                          </div>
                        )}
                        {topic.author?.name || 'Anónimo'}
                        {topic.author?.role === 'ADMIN' && (
                          <span className="inline-flex items-center text-[9px] font-semibold text-gold bg-gold/10 px-1 py-0.5 rounded">👑</span>
                        )}
                        {topic.author?.role === 'MODERATOR' && (
                          <span className="inline-flex items-center text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded">🛡️</span>
                        )}
                      </span>
                      <span>{(() => { try { return new Date(topic.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return ''; } })()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                    <span className="flex items-center gap-1" title="Respuestas">
                      <MessageSquare className="h-3.5 w-3.5" /> {topic.replyCount}
                    </span>
                    <span className="flex items-center gap-1" title="Visitas">
                      <Eye className="h-3.5 w-3.5" /> {topic.views}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-gold" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
            Math.max(0, page - 3), Math.min(totalPages, page + 2)
          ).map((p) => (
            <button
              key={p}
              onClick={() => { setPage(p); fetchTopics(p, sort, search); }}
              className={`h-8 w-8 rounded text-sm font-medium transition-colors ${
                p === page ? 'bg-gold text-graphite' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
