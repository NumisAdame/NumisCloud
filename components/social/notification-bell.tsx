'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
  relatedUser?: { id: string; name: string; image?: string };
}

export function NotificationBell({ collapsed = false }: { collapsed?: boolean }) {
  const { data: session } = useSession() || {};
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!session?.user) return;
    try {
      const res = await fetch('/api/notifications?limit=10');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data?.notifications ?? []);
        setUnreadCount(data?.unreadCount ?? 0);
      }
    } catch (err) {
      console.error('Notification fetch error:', err);
    }
  };

  useEffect(() => {
    if (!session?.user) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [session?.user]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'FRIEND_REQUEST': return '🤝';
      case 'FRIEND_ACCEPTED': return '✅';
      case 'PIECE_LIKE': return '❤️';
      case 'PIECE_COMMENT': return '💬';
      case 'FORUM_REPLY': return '📩';
      default: return '🔔';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => { setOpen(!open); if (!open) fetchNotifications(); }}
        className={cn(
          'relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
          'text-ivory/60 hover:text-ivory hover:bg-white/5'
        )}
      >
        <Bell className="h-4.5 w-4.5 flex-shrink-0" />
        {!collapsed && <span>Notificaciones</span>}
        {unreadCount > 0 && (
          <span className="absolute top-1 left-5 h-4 min-w-4 px-1 flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-full ml-2 top-0 lg:left-auto lg:right-0 lg:top-full lg:mt-2 w-80 max-h-[420px] bg-graphite border border-gold/20 rounded-xl shadow-2xl z-[100] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gold/10">
            <span className="font-display font-semibold text-sm text-ivory">Notificaciones</span>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-gold hover:text-gold-dark flex items-center gap-1">
                  <CheckCheck className="h-3.5 w-3.5" /> Leer todo
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-ivory/40 hover:text-ivory ml-2">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="overflow-y-auto max-h-[340px]">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-ivory/40 text-sm">Sin notificaciones</div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={cn(
                  'block px-4 py-3 border-b border-gold/5 transition-colors',
                  !n.read ? 'bg-gold/5' : 'hover:bg-white/3'
                )}>
                  <div className="flex items-start gap-3">
                    <span className="text-base mt-0.5">{getIcon(n.type)}</span>
                    <div className="flex-1 min-w-0">
                      {n.link ? (
                        <Link href={n.link} onClick={() => { markAsRead(n.id); setOpen(false); }}
                          className="block">
                          <p className="text-sm text-ivory font-medium leading-snug">{n.title}</p>
                          <p className="text-xs text-ivory/50 mt-0.5 line-clamp-2">{n.message}</p>
                        </Link>
                      ) : (
                        <div>
                          <p className="text-sm text-ivory font-medium leading-snug">{n.title}</p>
                          <p className="text-xs text-ivory/50 mt-0.5 line-clamp-2">{n.message}</p>
                        </div>
                      )}
                      <p className="text-[10px] text-ivory/30 mt-1">
                        {(() => { try { return formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: es }); } catch { return ''; } })()}
                      </p>
                    </div>
                    {!n.read && (
                      <button onClick={() => markAsRead(n.id)} className="text-gold/40 hover:text-gold mt-1" title="Marcar como leída">
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
