'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck, Clock, UserX, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface FriendshipButtonProps {
  userId: string;
  initialStatus: 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'ACCEPTED' | 'BLOCKED';
  friendshipId?: string;
  onStatusChange?: (newStatus: string) => void;
}

export function FriendshipButton({ userId, initialStatus, friendshipId, onStatusChange }: FriendshipButtonProps) {
  const [status, setStatus] = useState(initialStatus);
  const [fId, setFId] = useState(friendshipId || '');
  const [loading, setLoading] = useState(false);

  const sendRequest = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: userId }),
      });
      if (res.ok) {
        const data = await res.json();
        setStatus('PENDING_SENT');
        setFId(data?.friendship?.id ?? '');
        toast.success('Solicitud enviada');
        onStatusChange?.('PENDING_SENT');
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err?.error ?? 'Error al enviar solicitud');
      }
    } catch { toast.error('Error de conexión'); }
    finally { setLoading(false); }
  };

  const acceptRequest = async () => {
    if (!fId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/friends/${fId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' }),
      });
      if (res.ok) {
        setStatus('ACCEPTED');
        toast.success('Solicitud aceptada');
        onStatusChange?.('ACCEPTED');
      }
    } catch { toast.error('Error'); }
    finally { setLoading(false); }
  };

  const removeFriend = async () => {
    if (!fId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/friends/${fId}`, { method: 'DELETE' });
      if (res.ok) {
        setStatus('NONE');
        setFId('');
        toast.success('Contacto eliminado');
        onStatusChange?.('NONE');
      }
    } catch { toast.error('Error'); }
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <Button variant="outline" size="sm" disabled className="border-gold/30 text-gold">
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  switch (status) {
    case 'NONE':
      return (
        <Button variant="outline" size="sm" onClick={sendRequest}
          className="border-gold/40 text-gold hover:bg-gold/10">
          <UserPlus className="h-4 w-4 mr-1" /> Añadir contacto
        </Button>
      );
    case 'PENDING_SENT':
      return (
        <Button variant="outline" size="sm" disabled
          className="border-yellow-500/40 text-yellow-500">
          <Clock className="h-4 w-4 mr-1" /> Solicitud enviada
        </Button>
      );
    case 'PENDING_RECEIVED':
      return (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={acceptRequest}
            className="border-green-500/40 text-green-500 hover:bg-green-500/10">
            <UserCheck className="h-4 w-4 mr-1" /> Aceptar
          </Button>
          <Button variant="ghost" size="sm" onClick={removeFriend}
            className="text-red-400 hover:text-red-300">
            <UserX className="h-4 w-4" />
          </Button>
        </div>
      );
    case 'ACCEPTED':
      return (
        <Button variant="outline" size="sm" onClick={removeFriend}
          className="border-green-500/30 text-green-500 hover:border-red-500/40 hover:text-red-400 group">
          <UserCheck className="h-4 w-4 mr-1 group-hover:hidden" />
          <UserX className="h-4 w-4 mr-1 hidden group-hover:block" />
          <span className="group-hover:hidden">Contacto</span>
          <span className="hidden group-hover:inline">Eliminar</span>
        </Button>
      );
    default:
      return null;
  }
}
