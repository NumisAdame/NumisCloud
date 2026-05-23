'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users, UserPlus, Search, UserCheck, Clock, UserX,
  MapPin, Loader2, X, Check
} from 'lucide-react';
import { toast } from 'sonner';

interface Friend {
  friendshipId: string;
  id: string;
  name: string;
  image?: string;
  country?: string;
  specialty?: string;
}

interface PendingRequest {
  friendshipId: string;
  user: { id: string; name: string; image?: string; country?: string };
  direction: 'sent' | 'received';
}

export function FriendsContent() {
  const [tab, setTab] = useState<'friends' | 'pending' | 'search'>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const [friendsRes, pendingRes] = await Promise.all([
        fetch('/api/friends?tab=friends'),
        fetch('/api/friends?tab=pending'),
      ]);
      if (friendsRes.ok) {
        const data = await friendsRes.json();
        setFriends(data?.friends ?? []);
      }
      if (pendingRes.ok) {
        const data = await pendingRes.json();
        const received: PendingRequest[] = (data?.received ?? []).map((r: any) => ({
          friendshipId: r.id,
          user: r.sender,
          direction: 'received' as const,
        }));
        const sent: PendingRequest[] = (data?.sent ?? []).map((s: any) => ({
          friendshipId: s.id,
          user: s.receiver,
          direction: 'sent' as const,
        }));
        setPending([...received, ...sent]);
      }
    } catch (err) {
      console.error('Friends fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFriends(); }, []);

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data?.users ?? []);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const sendRequest = async (receiverId: string) => {
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId }),
      });
      if (res.ok) {
        toast.success('Solicitud enviada');
        fetchFriends();
        searchUsers(); // refresh search results
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err?.error ?? 'Error al enviar solicitud');
      }
    } catch { toast.error('Error'); }
  };

  const respondRequest = async (friendshipId: string, action: 'accept' | 'reject') => {
    try {
      const res = await fetch(`/api/friends/${friendshipId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        toast.success(action === 'accept' ? 'Solicitud aceptada' : 'Solicitud rechazada');
        fetchFriends();
      }
    } catch { toast.error('Error'); }
  };

  const removeFriend = async (friendshipId: string) => {
    try {
      const res = await fetch(`/api/friends/${friendshipId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Contacto eliminado');
        fetchFriends();
      }
    } catch { toast.error('Error'); }
  };

  const receivedPending = pending.filter((p) => p.direction === 'received');
  const sentPending = pending.filter((p) => p.direction === 'sent');

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Users className="h-7 w-7 text-gold" /> Contactos
        </h1>
        <p className="text-muted-foreground mt-1">Gestiona tus contactos numismáticos</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-lg p-1">
        {[
          { key: 'friends', label: 'Mis contactos', icon: UserCheck, count: friends.length },
          { key: 'pending', label: 'Pendientes', icon: Clock, count: receivedPending.length },
          { key: 'search', label: 'Buscar', icon: Search },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-gold text-graphite' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <t.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{t.label}</span>
            {(t as any).count > 0 && (
              <Badge variant="secondary" className="h-5 min-w-5 text-[10px] px-1">
                {(t as any).count}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}
        </div>
      ) : (
        <>
          {/* Friends Tab */}
          {tab === 'friends' && (
            <div className="space-y-2">
              {friends.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Users className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-muted-foreground">Aún no tienes contactos.</p>
                    <Button variant="outline" size="sm" className="mt-3 border-gold/30 text-gold" onClick={() => setTab('search')}>
                      <UserPlus className="h-4 w-4 mr-1" /> Buscar numismáticos
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                friends.map((f) => (
                  <Card key={f.friendshipId} className="hover:shadow-md transition-shadow">
                    <CardContent className="py-3 px-4 flex items-center gap-3">
                      <Link href={`/usuario/${f.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                        {f.image ? (
                          <div className="h-10 w-10 rounded-full overflow-hidden shrink-0 relative">
                            <Image src={f.image} alt={f.name || 'Avatar'} fill className="object-cover" />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gold/20 flex items-center justify-center text-sm font-bold text-gold shrink-0">
                            {(f.name || '?')[0].toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate hover:text-gold transition-colors">{f.name || 'Anónimo'}</p>
                          {f.country && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {f.country}
                            </p>
                          )}
                        </div>
                      </Link>
                      <Button variant="ghost" size="sm" onClick={() => removeFriend(f.friendshipId)}
                        className="text-muted-foreground hover:text-red-400 shrink-0">
                        <UserX className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Pending Tab */}
          {tab === 'pending' && (
            <div className="space-y-4">
              {receivedPending.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Solicitudes recibidas</h3>
                  <div className="space-y-2">
                    {receivedPending.map((p) => (
                      <Card key={p.friendshipId}>
                        <CardContent className="py-3 px-4 flex items-center gap-3">
                          <Link href={`/usuario/${p.user.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                            {p.user.image ? (
                              <div className="h-10 w-10 rounded-full overflow-hidden shrink-0 relative">
                                <Image src={p.user.image} alt={p.user.name || 'Avatar'} fill className="object-cover" />
                              </div>
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gold/20 flex items-center justify-center text-sm font-bold text-gold shrink-0">
                                {(p.user.name || '?')[0].toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold text-sm truncate">{p.user.name || 'Anónimo'}</p>
                              {p.user.country && <p className="text-xs text-muted-foreground">{p.user.country}</p>}
                            </div>
                          </Link>
                          <div className="flex gap-2 shrink-0">
                            <Button size="sm" onClick={() => respondRequest(p.friendshipId, 'accept')}
                              className="bg-green-600 hover:bg-green-700 text-white h-8">
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => respondRequest(p.friendshipId, 'reject')}
                              className="text-red-400 h-8">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              {sentPending.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Solicitudes enviadas</h3>
                  <div className="space-y-2">
                    {sentPending.map((p) => (
                      <Card key={p.friendshipId}>
                        <CardContent className="py-3 px-4 flex items-center gap-3">
                          <Link href={`/usuario/${p.user.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                            {p.user.image ? (
                              <div className="h-10 w-10 rounded-full overflow-hidden shrink-0 relative">
                                <Image src={p.user.image} alt={p.user.name || 'Avatar'} fill className="object-cover" />
                              </div>
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gold/20 flex items-center justify-center text-sm font-bold text-gold shrink-0">
                                {(p.user.name || '?')[0].toUpperCase()}
                              </div>
                            )}
                            <p className="font-semibold text-sm truncate">{p.user.name || 'Anónimo'}</p>
                          </Link>
                          <Badge variant="outline" className="border-yellow-500/30 text-yellow-500 shrink-0">
                            <Clock className="h-3 w-3 mr-1" /> Pendiente
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              {receivedPending.length === 0 && sentPending.length === 0 && (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Clock className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-muted-foreground">No hay solicitudes pendientes.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Search Tab */}
          {tab === 'search' && (
            <div className="space-y-4">
              <form onSubmit={(e) => { e.preventDefault(); searchUsers(); }} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e: any) => setSearchQuery(e.target?.value ?? '')}
                    placeholder="Buscar por nombre o email..."
                    className="pl-9"
                  />
                </div>
                <Button type="submit" disabled={searching} className="bg-gold hover:bg-gold-dark text-graphite">
                  {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buscar'}
                </Button>
              </form>
              <div className="space-y-2">
                {searchResults.map((u) => (
                  <Card key={u.id}>
                    <CardContent className="py-3 px-4 flex items-center gap-3">
                      <Link href={`/usuario/${u.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="h-10 w-10 rounded-full bg-gold/20 flex items-center justify-center text-sm font-bold text-gold shrink-0">
                          {(u.name || '?')[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">{u.name || 'Numismático'}</p>
                          {u.country && <p className="text-xs text-muted-foreground">{u.country}</p>}
                        </div>
                      </Link>
                      <Button variant="outline" size="sm" onClick={() => sendRequest(u.id)}
                        className="border-gold/30 text-gold hover:bg-gold/10 shrink-0">
                        <UserPlus className="h-4 w-4 mr-1" /> Añadir
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {searchResults.length === 0 && searchQuery && !searching && (
                  <p className="text-center text-muted-foreground text-sm py-4">No se encontraron resultados.</p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
