'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Send, Loader2, Trash2, Edit2, X, CornerDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import Image from 'next/image';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string; image?: string };
  replies?: Comment[];
}

interface CommentSectionProps {
  pieceId: string;
  initialCount?: number;
}

export function CommentSection({ pieceId, initialCount = 0 }: CommentSectionProps) {
  const { data: session } = useSession() || {};
  const [comments, setComments] = useState<Comment[]>([]);
  const [total, setTotal] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pieces/${pieceId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data?.comments ?? []);
        setTotal(data?.total ?? 0);
      }
    } catch (err) {
      console.error('Comments fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (expanded) fetchComments();
  }, [expanded, pieceId]);

  const postComment = async (parentId?: string) => {
    const content = parentId ? replyContent : newComment;
    if (!content.trim()) return;
    setPosting(true);
    try {
      const res = await fetch(`/api/pieces/${pieceId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim(), parentId }),
      });
      if (res.ok) {
        if (parentId) { setReplyContent(''); setReplyTo(null); }
        else setNewComment('');
        fetchComments();
        toast.success('Comentario añadido');
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err?.error ?? 'Error');
      }
    } catch { toast.error('Error de conexión'); }
    finally { setPosting(false); }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/pieces/${pieceId}/comments/${commentId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchComments();
        toast.success('Comentario eliminado');
      }
    } catch { toast.error('Error'); }
  };

  const updateComment = async (commentId: string) => {
    if (!editContent.trim()) return;
    try {
      const res = await fetch(`/api/pieces/${pieceId}/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent.trim() }),
      });
      if (res.ok) {
        setEditingId(null); setEditContent('');
        fetchComments();
        toast.success('Comentario actualizado');
      }
    } catch { toast.error('Error'); }
  };

  const renderComment = (comment: Comment, isReply = false) => {
    const isOwn = session?.user?.id === comment.user.id;
    const isAdmin = (session?.user as any)?.role === 'ADMIN';
    const isEditing = editingId === comment.id;

    return (
      <div key={comment.id} className={cn('py-3', isReply ? 'pl-6 border-l-2 border-gold/10 ml-4' : 'border-b border-border/50 last:border-0')}>
        <div className="flex items-start gap-2">
          {comment.user.image ? (
            <div className="h-7 w-7 rounded-full overflow-hidden shrink-0 relative">
              <Image src={comment.user.image} alt={comment.user.name || 'Avatar'} fill className="object-cover" />
            </div>
          ) : (
            <div className="h-7 w-7 rounded-full bg-gold/20 flex items-center justify-center text-xs font-bold text-gold shrink-0">
              {(comment.user.name || '?')[0].toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/usuario/${comment.user.id}`} className="text-sm font-semibold hover:text-gold transition-colors">
                {comment.user.name || 'Anónimo'}
              </Link>
              <span className="text-[10px] text-muted-foreground">
                {(() => { try { return formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: es }); } catch { return ''; } })()}
              </span>
            </div>
            {isEditing ? (
              <div className="mt-1 flex gap-2">
                <input
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="flex-1 bg-muted rounded px-2 py-1 text-sm"
                  autoFocus
                />
                <Button size="sm" variant="ghost" onClick={() => updateComment(comment.id)}
                  className="h-7 px-2 text-gold">
                  <Send className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}
                  className="h-7 px-2">
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <p className="text-sm text-foreground/80 mt-0.5 whitespace-pre-wrap">{comment.content}</p>
            )}
            <div className="flex items-center gap-3 mt-1">
              {!isReply && session?.user && (
                <button onClick={() => { setReplyTo(comment.id); setReplyContent(''); }}
                  className="text-[11px] text-muted-foreground hover:text-gold flex items-center gap-1">
                  <CornerDownRight className="h-3 w-3" /> Responder
                </button>
              )}
              {(isOwn || isAdmin) && !isEditing && (
                <>
                  <button onClick={() => { setEditingId(comment.id); setEditContent(comment.content); }}
                    className="text-[11px] text-muted-foreground hover:text-gold flex items-center gap-1">
                    <Edit2 className="h-3 w-3" /> Editar
                  </button>
                  <button onClick={() => deleteComment(comment.id)}
                    className="text-[11px] text-muted-foreground hover:text-red-400 flex items-center gap-1">
                    <Trash2 className="h-3 w-3" /> Eliminar
                  </button>
                </>
              )}
            </div>
            {/* Reply input */}
            {replyTo === comment.id && (
              <div className="mt-2 flex gap-2">
                <input
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Escribe tu respuesta..."
                  className="flex-1 bg-muted rounded px-3 py-1.5 text-sm"
                  autoFocus
                />
                <Button size="sm" onClick={() => postComment(comment.id)} disabled={posting}
                  className="h-8 bg-gold hover:bg-gold-dark text-graphite">
                  <Send className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setReplyTo(null)} className="h-8">
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-2">
                {comment.replies.map((r) => renderComment(r, true))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="text-sm font-medium">{total} {total === 1 ? 'comentario' : 'comentarios'}</span>
      </button>

      {expanded && (
        <div className="mt-3 bg-muted/30 rounded-lg p-4">
          {/* New comment form */}
          {session?.user ? (
            <div className="flex gap-2 mb-4">
              {session.user.image ? (
                <div className="h-8 w-8 rounded-full overflow-hidden shrink-0 relative">
                  <Image src={session.user.image as string} alt="Tu avatar" fill className="object-cover" />
                </div>
              ) : (
                <div className="h-8 w-8 rounded-full bg-gold/20 flex items-center justify-center text-xs font-bold text-gold shrink-0">
                  {((session.user.name || '?') as string)[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1 flex gap-2">
                <input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escribe un comentario..."
                  className="flex-1 bg-background rounded-lg px-3 py-2 text-sm border border-border/50 focus:border-gold/40 focus:outline-none"
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); postComment(); } }}
                />
                <Button onClick={() => postComment()} disabled={posting || !newComment.trim()}
                  size="sm" className="h-9 bg-gold hover:bg-gold-dark text-graphite">
                  {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mb-3">Inicia sesión para comentar</p>
          )}

          {/* Comments list */}
          {loading ? (
            <div className="py-4 text-center text-muted-foreground text-sm">
              <Loader2 className="h-5 w-5 animate-spin inline mr-2" /> Cargando comentarios...
            </div>
          ) : comments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Aún no hay comentarios. ¡Sé el primero!</p>
          ) : (
            <div>{comments.map((c) => renderComment(c))}</div>
          )}
        </div>
      )}
    </div>
  );
}
