'use client';

import { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface FavoriteButtonProps {
  pieceId: string;
  compact?: boolean;
}

export function FavoriteButton({ pieceId, compact = false }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/favorites/${pieceId}`)
      .then(r => r.json())
      .then(d => setIsFavorited(d.isFavorited || false))
      .catch(() => {});
  }, [pieceId]);

  const toggle = async () => {
    setLoading(true);
    setIsFavorited(prev => !prev); // Optimistic
    try {
      const res = await fetch(`/api/favorites/${pieceId}`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setIsFavorited(data.isFavorited);
        toast.success(data.isFavorited ? 'Añadido a favoritos' : 'Eliminado de favoritos');
      } else {
        setIsFavorited(prev => !prev); // Revert
      }
    } catch {
      setIsFavorited(prev => !prev); // Revert
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <button onClick={toggle} disabled={loading}
        className={`p-2 rounded-lg transition-colors ${isFavorited ? 'text-gold bg-gold/10' : 'text-muted-foreground hover:text-gold hover:bg-gold/5'}`}
        title={isFavorited ? 'Quitar de favoritos' : 'Añadir a favoritos'}>
        <Bookmark className={`h-5 w-5 ${isFavorited ? 'fill-gold' : ''}`} />
      </button>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={toggle} disabled={loading}
      className={`${isFavorited ? 'border-gold/40 text-gold bg-gold/5' : 'border-border text-muted-foreground'}`}>
      <Bookmark className={`h-4 w-4 mr-1.5 ${isFavorited ? 'fill-gold' : ''}`} />
      {isFavorited ? 'Guardado' : 'Guardar'}
    </Button>
  );
}
