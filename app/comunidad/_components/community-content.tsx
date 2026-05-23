'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { LikeButton } from '@/components/social/like-button';
import { FavoriteButton } from '@/components/social/favorite-button';
import {
  Globe, Search, Coins, Heart, MessageCircle, TrendingUp,
  Users, BookOpen, ArrowRight, Loader2, Bookmark
} from 'lucide-react';

export function CommunityContent() {
  const [pieces, setPieces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'recent' | 'popular'>('recent');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchPieces = async (pageNum = 1, sortBy = sort, q = search) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '12',
        sort: sortBy,
      });
      if (q.trim()) params.set('search', q.trim());
      const res = await fetch(`/api/pieces/public?${params}`);
      if (res.ok) {
        const data = await res.json();
        setPieces(data?.pieces ?? []);
        setTotalPages(data?.totalPages ?? 1);
        setTotal(data?.total ?? 0);
      }
    } catch (err) {
      console.error('Community fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPieces(1); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPieces(1, sort, search);
  };

  const changeSort = (s: 'recent' | 'popular') => {
    setSort(s);
    setPage(1);
    fetchPieces(1, s, search);
  };

  const changePage = (p: number) => {
    setPage(p);
    fetchPieces(p, sort, search);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Globe className="h-7 w-7 text-gold" /> Comunidad
          </h1>
          <p className="text-muted-foreground mt-1">Explora piezas compartidas por la comunidad numismática</p>
        </div>
        <div className="flex gap-2">
          <Link href="/comunidad/amigos">
            <Button variant="outline" size="sm" className="border-gold/30 text-gold hover:bg-gold/10">
              <Users className="h-4 w-4 mr-1" /> Amigos
            </Button>
          </Link>
          <Link href="/foro">
            <Button variant="outline" size="sm" className="border-gold/30 text-gold hover:bg-gold/10">
              <BookOpen className="h-4 w-4 mr-1" /> Foro
            </Button>
          </Link>
          <Link href="/comunidad/favoritos">
            <Button variant="outline" size="sm" className="border-gold/30 text-gold hover:bg-gold/10">
              <Bookmark className="h-4 w-4 mr-1" /> Favoritos
            </Button>
          </Link>
        </div>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e: any) => setSearch(e.target?.value ?? '')}
              placeholder="Buscar piezas..."
              className="pl-9"
            />
          </div>
          <Button type="submit" size="sm" className="bg-gold hover:bg-gold-dark text-graphite">
            Buscar
          </Button>
        </form>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          <button
            onClick={() => changeSort('recent')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              sort === 'recent' ? 'bg-gold text-graphite' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Recientes
          </button>
          <button
            onClick={() => changeSort('popular')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              sort === 'popular' ? 'bg-gold text-graphite' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <TrendingUp className="h-3 w-3 inline mr-1" /> Populares
          </button>
        </div>
      </div>

      {/* Pieces Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-64" />)}
        </div>
      ) : pieces.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Coins className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No se encontraron piezas públicas.</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Comparte tus piezas cambiando su visibilidad a "Pública".</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{total} {total === 1 ? 'pieza' : 'piezas'} públicas</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pieces.map((piece) => (
              <Card key={piece.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <Link href={`/coleccion/${piece.id}`}>
                  {piece.imageUrl ? (
                    <div className="relative aspect-[4/3] bg-muted">
                      <Image src={piece.imageUrl} alt={piece.title ?? 'Pieza'} fill className="object-cover group-hover:scale-105 transition-transform" />
                    </div>
                  ) : (
                    <div className="aspect-[4/3] bg-muted flex items-center justify-center">
                      <Coins className="h-10 w-10 text-muted-foreground/20" />
                    </div>
                  )}
                </Link>
                <CardContent className="p-3">
                  <Link href={`/coleccion/${piece.id}`}>
                    <h3 className="font-semibold text-sm truncate hover:text-gold transition-colors">{piece.title}</h3>
                  </Link>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {[piece.year, piece.country, piece.historicalPeriod].filter(Boolean).join(' · ')}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                    <Link href={`/usuario/${piece.user?.id}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold transition-colors">
                      {piece.user?.image ? (
                        <div className="h-5 w-5 rounded-full overflow-hidden shrink-0 relative">
                          <Image src={piece.user.image} alt={piece.user.name || 'Avatar'} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-gold/20 flex items-center justify-center text-[9px] font-bold text-gold">
                          {(piece.user?.name || '?')[0].toUpperCase()}
                        </div>
                      )}
                      <span className="truncate max-w-[100px]">{piece.user?.name || 'Anónimo'}</span>
                    </Link>
                    <div className="flex items-center gap-2">
                      <LikeButton pieceId={piece.id} initialLiked={piece.liked} initialCount={piece.likeCount} size="sm" />
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageCircle className="h-3.5 w-3.5" /> {piece.commentCount ?? 0}
                      </span>
                      <FavoriteButton pieceId={piece.id} compact />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
                Math.max(0, page - 3), Math.min(totalPages, page + 2)
              ).map((p) => (
                <button
                  key={p}
                  onClick={() => changePage(p)}
                  className={`h-8 w-8 rounded text-sm font-medium transition-colors ${
                    p === page ? 'bg-gold text-graphite' : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
