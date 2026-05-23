'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bookmark, Heart, MessageSquare, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CONSERVATION_GRADES } from '@/lib/constants';

interface FavPiece {
  id: string;
  title: string;
  type: string;
  country: string | null;
  year: number | null;
  conservationGrade: string | null;
  estimatedValue: number | null;
  image: string | null;
  isPublic: boolean;
  user: { id: string; name: string | null; image: string | null };
  likes: number;
  comments: number;
}

interface FavItem {
  id: string;
  createdAt: string;
  piece: FavPiece;
}

export function FavoritesContent() {
  const [favorites, setFavorites] = useState<FavItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      const res = await fetch('/api/favorites');
      if (res.ok) {
        const data = await res.json();
        setFavorites(data.favorites || []);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchFavorites(); }, []);

  const removeFavorite = async (pieceId: string) => {
    try {
      const res = await fetch(`/api/favorites/${pieceId}`, { method: 'POST' });
      if (res.ok) {
        setFavorites(prev => prev.filter(f => f.piece.id !== pieceId));
        toast.success('Eliminado de favoritos');
      }
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const gradeLabel = (g: string | null) => CONSERVATION_GRADES.find(c => c.value === g)?.label || g || '';

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold tracking-tight flex items-center gap-2">
          <Bookmark className="h-6 w-6 text-gold" />
          Mis Favoritos
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Piezas guardadas de otros coleccionistas</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-muted rounded-xl animate-pulse" />)}
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-16">
          <Bookmark className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">No tienes piezas favoritas aún</p>
          <p className="text-muted-foreground/60 text-sm mt-1">Explora la comunidad y guarda las piezas que más te gusten</p>
          <Link href="/comunidad">
            <Button className="mt-4 bg-gold hover:bg-gold-dark text-graphite">Explorar comunidad</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((fav) => (
            <div key={fav.id} className="bg-card border rounded-xl overflow-hidden group hover:shadow-md transition-shadow">
              <Link href={`/coleccion/${fav.piece.id}`}>
                <div className="aspect-[4/3] relative bg-muted">
                  {fav.piece.image ? (
                    <Image
                      src={fav.piece.isPublic ? fav.piece.image : `/api/upload/image?key=${encodeURIComponent(fav.piece.image)}`}
                      alt={fav.piece.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Bookmark className="h-10 w-10 text-muted-foreground/20" />
                    </div>
                  )}
                </div>
              </Link>
              <div className="p-4">
                <Link href={`/coleccion/${fav.piece.id}`}>
                  <h3 className="font-semibold text-sm line-clamp-1 hover:text-gold transition-colors">{fav.piece.title}</h3>
                </Link>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  {fav.piece.country && <span>{fav.piece.country}</span>}
                  {fav.piece.year && <span>• {fav.piece.year}</span>}
                  {fav.piece.conservationGrade && <span>• {fav.piece.conservationGrade}</span>}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {fav.piece.likes}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> {fav.piece.comments}</span>
                  </div>
                  <button onClick={() => removeFavorite(fav.piece.id)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    title="Quitar de favoritos">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <Link href={`/usuario/${fav.piece.user.id}`} className="flex items-center gap-2 mt-3 pt-3 border-t">
                  {fav.piece.user.image ? (
                    <Image src={fav.piece.user.image} alt={fav.piece.user.name || ''} width={20} height={20} className="rounded-full" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-gold/10 flex items-center justify-center text-[10px] text-gold font-bold">
                      {(fav.piece.user.name || '?')[0]}
                    </div>
                  )}
                  <span className="text-xs text-muted-foreground">{fav.piece.user.name || 'Anónimo'}</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
