'use client';

import { useState, useEffect } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface LikeButtonProps {
  pieceId: string;
  initialLiked?: boolean;
  initialCount?: number;
  size?: 'sm' | 'md';
}

export function LikeButton({ pieceId, initialLiked = false, initialCount = 0, size = 'md' }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Fetch current like status
    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/pieces/${pieceId}/likes`);
        if (res.ok) {
          const data = await res.json();
          setLiked(data?.liked ?? false);
          setCount(data?.likeCount ?? 0);
        }
      } catch (err) {
        console.error('Like status error:', err);
      } finally {
        setInitialized(true);
      }
    };
    fetchStatus();
  }, [pieceId]);

  const toggleLike = async () => {
    if (loading) return;
    setLoading(true);
    // Optimistic update
    setLiked(!liked);
    setCount((c) => (liked ? c - 1 : c + 1));
    try {
      const res = await fetch(`/api/pieces/${pieceId}/likes`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setLiked(data?.liked ?? false);
        setCount(data?.likeCount ?? 0);
      } else {
        // Revert optimistic
        setLiked(liked);
        setCount(count);
        const err = await res.json().catch(() => ({}));
        if (res.status === 401) {
          toast.error('Inicia sesión para dar me gusta');
        } else {
          toast.error(err?.error ?? 'Error');
        }
      }
    } catch {
      setLiked(liked);
      setCount(count);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <button
      onClick={toggleLike}
      disabled={loading}
      className={cn(
        'flex items-center gap-1.5 transition-all group',
        liked ? 'text-red-500' : 'text-muted-foreground hover:text-red-400'
      )}
      title={liked ? 'Quitar me gusta' : 'Me gusta'}
    >
      <Heart
        className={cn(
          iconSize,
          'transition-transform group-hover:scale-110',
          liked && 'fill-current'
        )}
      />
      <span className={cn(textSize, 'font-medium tabular-nums')}>
        {initialized ? count : initialCount}
      </span>
    </button>
  );
}
