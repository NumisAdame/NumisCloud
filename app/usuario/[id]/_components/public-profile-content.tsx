'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FriendshipButton } from '@/components/social/friendship-button';
import { LikeButton } from '@/components/social/like-button';
import { Button } from '@/components/ui/button';
import {
  User, MapPin, Calendar, Coins, Shield, Eye, EyeOff, Lock,
  Users, BookOpen, Instagram, ExternalLink, Send
} from 'lucide-react';

interface PublicProfile {
  user: {
    id: string; name: string; image?: string; country?: string;
    bio?: string; specialty?: string; profileVisibility?: string;
    instagram?: string; twitter?: string; youtube?: string; website?: string;
    createdAt?: string;
    isPrivate?: boolean;
    isContactsOnly?: boolean;
    publicPiecesCount?: number;
    friendCount?: number;
  };
  friendshipStatus: string;
  friendshipId?: string;
  friendCount?: number;
  publicPiecesCount?: number;
  publicPieces?: any[];
}

export function PublicProfileContent({ userId }: { userId: string }) {
  const { data: session } = useSession() || {};
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/users/${userId}/public-profile`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        } else {
          const err = await res.json().catch(() => ({}));
          setError(err?.error ?? 'Perfil no disponible');
        }
      } catch {
        setError('Error al cargar perfil');
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full bg-ivory/10" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48 bg-ivory/10" />
            <Skeleton className="h-4 w-32 bg-ivory/10" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 bg-ivory/10" />)}
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center py-16">
        <Lock className="h-12 w-12 text-ivory/30 mx-auto mb-4" />
        <h2 className="font-display text-xl text-ivory font-bold">{error || 'Perfil no disponible'}</h2>
        <p className="text-ivory/50 mt-2">Este perfil es privado o no existe.</p>
      </div>
    );
  }

  const { user, friendshipStatus, friendshipId, publicPieces: rawPieces } = profile;
  const publicPieces = rawPieces ?? [];
  const friendCount = (profile as any).friendCount ?? user?.friendCount ?? 0;
  const publicPiecesCount = (profile as any).publicPiecesCount ?? user?.publicPiecesCount ?? publicPieces.length;
  const isOwnProfile = session?.user?.id === user.id;
  const initials = (user.name || '?').split(' ').filter(Boolean).map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  // Handle private or contacts-only profiles
  if ((user as any).isPrivate) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="flex flex-col items-center py-16">
          <div className="h-20 w-20 rounded-full bg-gold/20 border-2 border-gold/40 flex items-center justify-center text-2xl font-bold text-gold mb-4">
            {user.image ? (
              <div className="relative h-20 w-20 rounded-full overflow-hidden">
                <Image src={user.image} alt={user.name || ''} fill className="object-cover" />
              </div>
            ) : initials}
          </div>
          <h1 className="font-display text-xl font-bold text-ivory">{user.name || 'Numismático'}</h1>
          <Lock className="h-8 w-8 text-ivory/30 mt-4" />
          <p className="text-ivory/50 mt-2 text-sm">Este perfil es privado.</p>
          {!isOwnProfile && session?.user && (
            <div className="mt-4"><FriendshipButton userId={user.id} initialStatus={friendshipStatus as any} friendshipId={friendshipId} /></div>
          )}
        </div>
      </div>
    );
  }

  if ((user as any).isContactsOnly && !isOwnProfile) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="flex flex-col items-center py-16">
          <div className="h-20 w-20 rounded-full bg-gold/20 border-2 border-gold/40 flex items-center justify-center text-2xl font-bold text-gold mb-4">
            {user.image ? (
              <div className="relative h-20 w-20 rounded-full overflow-hidden">
                <Image src={user.image} alt={user.name || ''} fill className="object-cover" />
              </div>
            ) : initials}
          </div>
          <h1 className="font-display text-xl font-bold text-ivory">{user.name || 'Numismático'}</h1>
          {user.specialty && <p className="text-gold text-sm mt-1">{user.specialty}</p>}
          {user.country && <span className="text-ivory/50 text-sm flex items-center gap-1 mt-2"><MapPin className="h-3.5 w-3.5" /> {user.country}</span>}
          <Users className="h-8 w-8 text-ivory/30 mt-4" />
          <p className="text-ivory/50 mt-2 text-sm">Solo visible para contactos.</p>
          {session?.user && (
            <div className="mt-4"><FriendshipButton userId={user.id} initialStatus={friendshipStatus as any} friendshipId={friendshipId} /></div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-start gap-6">
        <div className="h-20 w-20 rounded-full bg-gold/20 border-2 border-gold/40 flex items-center justify-center text-2xl font-bold text-gold shrink-0">
          {user.image ? (
            <div className="relative h-20 w-20 rounded-full overflow-hidden">
              <Image src={user.image} alt={user.name || ''} fill className="object-cover" />
            </div>
          ) : initials}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-ivory tracking-tight">{user.name || 'Numismático'}</h1>
              {user.specialty && (
                <p className="text-gold text-sm font-medium mt-1">{user.specialty}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-ivory/50 text-sm flex-wrap">
                {user.country && (
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {user.country}</span>
                )}
                {user.createdAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Miembro desde {new Date(user.createdAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
            {!isOwnProfile && session?.user && (
              <div className="flex items-center gap-2">
                <FriendshipButton
                  userId={user.id}
                  initialStatus={friendshipStatus as any}
                  friendshipId={friendshipId}
                />
                <Link href={`/mensajes?newTo=${user.id}`}>
                  <Button variant="outline" size="sm" className="border-gold/30 text-gold hover:bg-gold/10">
                    <Send className="h-4 w-4 mr-1" /> Mensaje
                  </Button>
                </Link>
              </div>
            )}
            {isOwnProfile && (
              <Link href="/perfil">
                <Badge variant="outline" className="border-gold/30 text-gold cursor-pointer hover:bg-gold/10">
                  Editar perfil
                </Badge>
              </Link>
            )}
          </div>
          {user.bio && (
            <p className="text-ivory/70 mt-3 text-sm leading-relaxed">{user.bio}</p>
          )}
          <div className="flex items-center gap-6 mt-4">
            <div className="text-center">
              <p className="text-lg font-bold text-gold">{publicPiecesCount}</p>
              <p className="text-[10px] text-ivory/40 uppercase tracking-wider">Piezas</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gold">{friendCount}</p>
              <p className="text-[10px] text-ivory/40 uppercase tracking-wider">Contactos</p>
            </div>
          </div>
          {/* Social media links */}
          {(user.instagram || user.twitter || user.youtube || user.website) && (
            <div className="flex items-center gap-3 mt-4 flex-wrap">
              {user.instagram && (
                <a
                  href={user.instagram.startsWith('http') ? user.instagram : `https://instagram.com/${user.instagram.replace(/^@/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-ivory/50 hover:text-gold transition-colors bg-white/5 rounded-full px-3 py-1.5"
                >
                  <Instagram className="h-3.5 w-3.5" />
                  {user.instagram.startsWith('http') ? 'Instagram' : user.instagram}
                </a>
              )}
              {user.twitter && (
                <a
                  href={user.twitter.startsWith('http') ? user.twitter : `https://x.com/${user.twitter.replace(/^@/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-ivory/50 hover:text-gold transition-colors bg-white/5 rounded-full px-3 py-1.5"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  {user.twitter.startsWith('http') ? 'X' : user.twitter}
                </a>
              )}
              {user.youtube && (
                <a
                  href={user.youtube.startsWith('http') ? user.youtube : `https://youtube.com/${user.youtube.replace(/^@/, '@')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-ivory/50 hover:text-gold transition-colors bg-white/5 rounded-full px-3 py-1.5"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  YouTube
                </a>
              )}
              {user.website && (
                <a
                  href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-ivory/50 hover:text-gold transition-colors bg-white/5 rounded-full px-3 py-1.5"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Web
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Public Pieces */}
      <div>
        <h2 className="font-display text-lg font-bold text-ivory mb-4 flex items-center gap-2">
          <Coins className="h-5 w-5 text-gold" /> Colección pública
        </h2>
        {publicPieces.length === 0 ? (
          <Card className="bg-white/5 border-gold/10">
            <CardContent className="py-8 text-center">
              <EyeOff className="h-8 w-8 text-ivory/20 mx-auto mb-2" />
              <p className="text-ivory/40 text-sm">No hay piezas públicas aún.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {publicPieces.map((piece: any) => (
              <Link key={piece.id} href={`/coleccion/${piece.id}`}>
                <Card className="bg-white/5 border-gold/10 hover:border-gold/30 transition-all group overflow-hidden">
                  {piece.imageUrl ? (
                    <div className="relative aspect-[4/3] bg-graphite">
                      <Image src={piece.imageUrl} alt={piece.title || piece.name || ''} fill className="object-cover group-hover:scale-105 transition-transform" />
                    </div>
                  ) : (
                    <div className="aspect-[4/3] bg-gold/5 flex items-center justify-center">
                      <Coins className="h-10 w-10 text-gold/20" />
                    </div>
                  )}
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-sm text-ivory truncate">{piece.title || piece.name}</h3>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[11px] text-ivory/40">
                        {[piece.year, piece.country].filter(Boolean).join(' · ')}
                      </span>
                      <div className="flex items-center gap-2">
                        <LikeButton pieceId={piece.id} size="sm" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
