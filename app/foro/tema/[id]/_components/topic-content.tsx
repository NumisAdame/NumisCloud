'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft, MessageSquare, Eye, Pin, Lock, Send, Loader2,
  Trash2, Edit2, X, MoreVertical, Check, ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { ForumMarkdown } from '@/components/ui/forum-markdown';
import { RichTextToolbar } from '@/components/ui/rich-text-toolbar';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Reply {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: { id: string; name: string; image?: string };
}

interface Topic {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  closed: boolean;
  isOfficial: boolean;
  views: number;
  createdAt: string;
  author: { id: string; name: string; image?: string };
  category: { id: string; name: string; slug: string };
  replies: Reply[];
}

export function TopicContent({ topicId }: { topicId: string }) {
  const { data: session } = useSession() || {};
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  const fetchTopic = async () => {
    try {
      const res = await fetch(`/api/forum/topics/${topicId}`);
      if (res.ok) {
        const data = await res.json();
        setTopic(data?.topic ?? null);
      }
    } catch (err) {
      console.error('Topic fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (topicId) fetchTopic(); }, [topicId]);

  const postReply = async () => {
    if (!replyContent.trim()) return;
    setPosting(true);
    try {
      const res = await fetch(`/api/forum/topics/${topicId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent.trim() }),
      });
      if (res.ok) {
        setReplyContent('');
        fetchTopic();
        toast.success('Respuesta publicada');
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err?.error ?? 'Error');
      }
    } catch { toast.error('Error de conexión'); }
    finally { setPosting(false); }
  };

  const deleteTopic = async () => {
    if (!confirm('¿Seguro que quieres eliminar este tema?')) return;
    try {
      const res = await fetch(`/api/forum/topics/${topicId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Tema eliminado');
        window.location.href = '/foro';
      }
    } catch { toast.error('Error'); }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-40" />
        <Skeleton className="h-20" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="text-center py-16">
        <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="font-display text-xl font-bold">Tema no encontrado</h2>
      </div>
    );
  }

  const isAuthor = session?.user?.id === topic.author.id;
  const isAdmin = (session?.user as any)?.role === 'ADMIN';
  const canManage = isAuthor || isAdmin;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back link */}
      <Link href={`/foro/${topic.category.slug}`} className="text-sm text-muted-foreground hover:text-gold flex items-center gap-1">
        <ArrowLeft className="h-3.5 w-3.5" /> {topic.category.name}
      </Link>

      {/* Topic */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {topic.isOfficial && <Badge className="bg-gold/20 text-gold border-gold/40 text-[10px]"><ShieldCheck className="h-3 w-3 mr-0.5" /> Tema Oficial</Badge>}
                {topic.pinned && !topic.isOfficial && <Badge variant="outline" className="border-gold/30 text-gold text-[10px]"><Pin className="h-3 w-3 mr-0.5" /> Fijado</Badge>}
                {topic.closed && <Badge variant="outline" className="border-red-500/30 text-red-400 text-[10px]"><Lock className="h-3 w-3 mr-0.5" /> Cerrado</Badge>}
              </div>
              <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight">{topic.title}</h1>
            </div>
            {canManage && (
              <div className="flex items-center gap-1 shrink-0">
                {isAdmin && (
                  <>
                    <Button variant="ghost" size="sm" onClick={async () => {
                      try {
                        const res = await fetch(`/api/forum/topics/${topicId}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ pinned: !topic.pinned }),
                        });
                        if (res.ok) { fetchTopic(); toast.success(topic.pinned ? 'Tema desfijado' : 'Tema fijado'); }
                      } catch { toast.error('Error'); }
                    }} className="text-gold hover:text-gold/80" title={topic.pinned ? 'Desfijar' : 'Fijar'}>
                      <Pin className={`h-4 w-4 ${topic.pinned ? 'fill-gold' : ''}`} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={async () => {
                      try {
                        const res = await fetch(`/api/forum/topics/${topicId}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ closed: !topic.closed }),
                        });
                        if (res.ok) { fetchTopic(); toast.success(topic.closed ? 'Tema reabierto' : 'Tema cerrado'); }
                      } catch { toast.error('Error'); }
                    }} className={topic.closed ? 'text-green-400 hover:text-green-300' : 'text-amber-400 hover:text-amber-300'} title={topic.closed ? 'Reabrir' : 'Cerrar'}>
                      <Lock className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="sm" onClick={deleteTopic} className="text-red-400 hover:text-red-300">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground">
            <Link href={`/usuario/${topic.author.id}`} className="flex items-center gap-1.5 hover:text-gold transition-colors">
              {topic.author.image ? (
                <div className="h-6 w-6 rounded-full overflow-hidden shrink-0 relative">
                  <Image src={topic.author.image} alt={topic.author.name || 'Avatar'} fill className="object-cover" />
                </div>
              ) : (
                <div className="h-6 w-6 rounded-full bg-gold/20 flex items-center justify-center text-[10px] font-bold text-gold">
                  {(topic.author.name || '?')[0].toUpperCase()}
                </div>
              )}
              {topic.author.name || 'Anónimo'}
              {(topic.author as any).role === 'ADMIN' && (
                <span className="ml-1 inline-flex items-center gap-0.5 text-[10px] font-semibold text-gold bg-gold/10 px-1.5 py-0.5 rounded">👑 Admin</span>
              )}
              {(topic.author as any).role === 'MODERATOR' && (
                <span className="ml-1 inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">🛡️ Moderador</span>
              )}
            </Link>
            <span>·</span>
            <span>{(() => { try { return formatDistanceToNow(new Date(topic.createdAt), { addSuffix: true, locale: es }); } catch { return ''; } })()}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {topic.views} visitas</span>
          </div>
          <div className="mt-4 text-sm text-foreground/80 leading-relaxed">
            <ForumMarkdown content={topic.content} />
          </div>
        </CardContent>
      </Card>

      {/* Replies */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-1">
          <MessageSquare className="h-4 w-4" /> {topic.replies.length} {topic.replies.length === 1 ? 'respuesta' : 'respuestas'}
        </h2>
        <div className="space-y-2">
          {topic.replies.map((reply) => {
            const isReplyAuthor = session?.user?.id === reply.author.id;
            const canDeleteReply = isReplyAuthor || isAdmin;
            return (
              <Card key={reply.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {reply.author.image ? (
                      <div className="h-8 w-8 rounded-full overflow-hidden shrink-0 relative">
                        <Image src={reply.author.image} alt={reply.author.name || 'Avatar'} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gold/20 flex items-center justify-center text-xs font-bold text-gold shrink-0">
                        {(reply.author.name || '?')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Link href={`/usuario/${reply.author.id}`} className="text-sm font-semibold hover:text-gold transition-colors">
                            {reply.author.name || 'Anónimo'}
                          </Link>
                          {(reply.author as any).role === 'ADMIN' && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-gold bg-gold/10 px-1.5 py-0.5 rounded">👑 Admin</span>
                          )}
                          {(reply.author as any).role === 'MODERATOR' && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">🛡️ Moderador</span>
                          )}
                          <span className="text-[10px] text-muted-foreground">
                            {(() => { try { return formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true, locale: es }); } catch { return ''; } })()}
                          </span>
                        </div>
                        {canDeleteReply && (
                          <button onClick={async () => {
                            if (!confirm('¿Eliminar esta respuesta?')) return;
                            try {
                              const res = await fetch(`/api/forum/replies/${reply.id}`, { method: 'DELETE' });
                              if (res.ok) { fetchTopic(); toast.success('Respuesta eliminada'); }
                            } catch { toast.error('Error'); }
                          }} className="text-muted-foreground hover:text-red-400 transition-colors p-1" title="Eliminar respuesta">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-foreground/80">
                        <ForumMarkdown content={reply.content} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Reply Form */}
      {!topic.closed && session?.user ? (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-3">Tu respuesta</h3>
            <RichTextToolbar textareaRef={replyTextareaRef} value={replyContent} onChange={setReplyContent} />
            <textarea
              ref={replyTextareaRef}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Escribe tu respuesta... Usa **negrita**, *cursiva*, listas y más"
              className="w-full min-h-[100px] bg-muted rounded-lg px-3 py-2 text-sm border border-border/50 focus:border-gold/40 focus:outline-none resize-y mt-2"
            />
            <div className="flex justify-end mt-3">
              <Button onClick={postReply} disabled={posting || !replyContent.trim()}
                className="bg-gold hover:bg-gold-dark text-graphite font-semibold">
                {posting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
                Responder
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : topic.closed ? (
        <Card>
          <CardContent className="py-4 text-center text-sm text-muted-foreground">
            <Lock className="h-4 w-4 inline mr-1" /> Este tema está cerrado y no admite nuevas respuestas.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-4 text-center text-sm text-muted-foreground">
            <Link href="/login" className="text-gold hover:text-gold-dark">Inicia sesión</Link> para responder.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
