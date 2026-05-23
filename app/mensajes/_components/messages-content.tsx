'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, ArrowLeft, Search, User as UserIcon, Bold, Italic, Underline, List, ImageIcon, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { ForumMarkdown } from '@/components/ui/forum-markdown';
import { motion, AnimatePresence } from 'framer-motion';

interface ConversationPreview {
  id: string;
  otherUser: { id: string; name: string | null; image: string | null } | null;
  lastMessage: { content: string; senderId: string; senderName: string | null; createdAt: string } | null;
  unreadCount: number;
  updatedAt: string;
}

interface Msg {
  id: string;
  content: string;
  senderId: string;
  sender: { id: string; name: string | null; image: string | null };
  createdAt: string;
}

interface SearchUser {
  id: string;
  name: string | null;
  image: string | null;
}

export function MessagesContent() {
  const { data: session } = useSession() || {};
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const msgInputRef = useRef<HTMLTextAreaElement>(null);

  const wrapMsgSelection = (before: string, after: string) => {
    const ta = msgInputRef.current;
    if (!ta) return;
    const currentValue = ta.value;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = currentValue.substring(start, end);
    const replacement = selected || 'texto';
    const newText = currentValue.substring(0, start) + before + replacement + after + currentValue.substring(end);
    setInput(newText);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + replacement.length);
    });
  };

  const insertMsgList = () => {
    const ta = msgInputRef.current;
    if (!ta) return;
    const currentValue = ta.value;
    const start = ta.selectionStart;
    const prefix = currentValue.substring(0, start);
    const nl = prefix.length > 0 && !prefix.endsWith('\n') ? '\n' : '';
    const newText = currentValue.substring(0, start) + `${nl}- Elemento 1\n- Elemento 2\n` + currentValue.substring(start);
    setInput(newText);
    requestAnimationFrame(() => { ta.focus(); });
  };

  const handleMsgAction = (action: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    action();
  };

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/messages');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchConversations();
    // Poll for new conversations every 15s
    pollRef.current = setInterval(fetchConversations, 15000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchConversations]);

  // Handle deep link to conversation
  useEffect(() => {
    const convId = searchParams?.get('c');
    if (convId) setActiveConvId(convId);
  }, [searchParams]);

  // Fetch messages when active conversation changes
  const fetchMessages = useCallback(async (convId: string, isPolling = false) => {
    if (!isPolling) setLoadingMessages(true);
    try {
      const res = await fetch(`/api/messages/${convId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch { /* ignore */ } finally { if (!isPolling) setLoadingMessages(false); }
  }, []);

  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId);
      // Poll messages every 5s when in conversation (silent, no loading state)
      const msgPoll = setInterval(() => fetchMessages(activeConvId, true), 5000);
      return () => clearInterval(msgPoll);
    }
  }, [activeConvId, fetchMessages]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // Search users
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults((data.users || []).filter((u: SearchUser) => u.id !== session?.user?.id));
        }
      } catch { /* ignore */ }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, session?.user?.id]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setSending(true);
    setInput('');

    try {
      if (activeConvId) {
        const res = await fetch(`/api/messages/${activeConvId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: text }),
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(prev => [...prev, data.message]);
          fetchConversations();
        } else {
          toast.error('Error al enviar el mensaje');
        }
      }
    } catch {
      toast.error('Error al enviar el mensaje');
    } finally {
      setSending(false);
    }
  };

  const startConversation = async (userId: string) => {
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);

    // Check if conversation already exists
    const existing = conversations.find(c => c.otherUser?.id === userId);
    if (existing) {
      setActiveConvId(existing.id);
      return;
    }

    // Will need a first message — set up a temporary state
    // For now, just create conversation with a greeting
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: userId, message: '¡Hola!' }),
      });
      if (res.ok) {
        const data = await res.json();
        setActiveConvId(data.conversationId);
        fetchConversations();
      }
    } catch {
      toast.error('Error al iniciar conversación');
    }
  };

  const activeConv = conversations.find(c => c.id === activeConvId);
  const fmtTime = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-3rem)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-gold" />
            Mensajes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Conversaciones privadas con otros coleccionistas</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowSearch(!showSearch)} className="border-gold/30 text-gold hover:bg-gold/10">
          <Search className="h-4 w-4 mr-1" /> Nuevo mensaje
        </Button>
      </div>

      {/* Search panel */}
      {showSearch && (
        <div className="mb-4 p-4 bg-card border rounded-lg">
          <Input
            placeholder="Buscar usuario por nombre..."
            value={searchQuery}
            onChange={(e: any) => setSearchQuery(e.target.value)}
            className="mb-3"
            autoFocus
          />
          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {searchResults.map((u) => (
                <button key={u.id} onClick={() => startConversation(u.id)}
                  className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-muted transition-colors text-left">
                  {u.image ? (
                    <Image src={u.image} alt={u.name || ''} width={32} height={32} className="rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold text-xs font-bold">
                      {(u.name || '?')[0]}
                    </div>
                  )}
                  <span className="text-sm font-medium">{u.name || 'Anónimo'}</span>
                </button>
              ))}
            </div>
          )}
          {searchQuery.length >= 2 && searchResults.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">No se encontraron usuarios</p>
          )}
        </div>
      )}

      <div className="flex-1 flex border rounded-lg overflow-hidden bg-card min-h-0">
        {/* Conversation list */}
        <div className={`w-full md:w-80 border-r flex flex-col ${activeConvId ? 'hidden md:flex' : 'flex'}`}>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />)}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No tienes conversaciones aún</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Usa "Nuevo mensaje" para comenzar</p>
              </div>
            ) : (
              conversations.map((c) => (
                <button key={c.id} onClick={() => setActiveConvId(c.id)}
                  className={`w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors border-b text-left ${
                    activeConvId === c.id ? 'bg-gold/5 border-l-2 border-l-gold' : ''
                  }`}>
                  {c.otherUser?.image ? (
                    <Image src={c.otherUser.image} alt={c.otherUser.name || ''} width={40} height={40} className="rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold flex-shrink-0">
                      {(c.otherUser?.name || '?')[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold truncate">{c.otherUser?.name || 'Anónimo'}</span>
                      {c.lastMessage && <span className="text-xs text-muted-foreground flex-shrink-0">{fmtTime(c.lastMessage.createdAt)}</span>}
                    </div>
                    {c.lastMessage && (
                      <p className={`text-xs truncate mt-0.5 ${c.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                        {c.lastMessage.senderId === session?.user?.id ? 'Tú: ' : ''}{c.lastMessage.content}
                      </p>
                    )}
                  </div>
                  {c.unreadCount > 0 && (
                    <div className="w-2.5 h-2.5 rounded-full bg-gold flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message view */}
        <div className={`flex-1 flex flex-col ${!activeConvId ? 'hidden md:flex' : 'flex'}`}>
          {activeConvId ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 p-3 border-b">
                <button onClick={() => setActiveConvId(null)} className="md:hidden p-1 hover:bg-muted rounded">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                {activeConv?.otherUser?.image ? (
                  <Image src={activeConv.otherUser.image} alt={activeConv.otherUser.name || ''} width={36} height={36} className="rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold">
                    {(activeConv?.otherUser?.name || '?')[0]}
                  </div>
                )}
                <span className="font-semibold text-sm">{activeConv?.otherUser?.name || 'Anónimo'}</span>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    Envía el primer mensaje
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {messages.map((msg) => {
                      const isMe = msg.senderId === session?.user?.id;
                      return (
                        <motion.div key={msg.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                            isMe
                              ? 'bg-gold text-graphite rounded-br-md'
                              : 'bg-muted rounded-bl-md'
                          }`}>
                            <div className="break-words [&_p]:mb-0.5 [&_p:last-child]:mb-0 [&_ul]:mb-0.5 [&_ol]:mb-0.5">
                              <ForumMarkdown content={msg.content} />
                            </div>
                            <p className={`text-[10px] mt-1 ${isMe ? 'text-graphite/50' : 'text-muted-foreground'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>

              {/* Input */}
              <div className="border-t">
                <div className="flex items-center gap-0.5 px-3 pt-2 pb-1">
                  <button type="button" className="inline-flex items-center justify-center rounded-md h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Negrita"
                    onMouseDown={handleMsgAction(() => wrapMsgSelection('**', '**'))}>
                    <Bold className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" className="inline-flex items-center justify-center rounded-md h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Cursiva"
                    onMouseDown={handleMsgAction(() => wrapMsgSelection('*', '*'))}>
                    <Italic className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" className="inline-flex items-center justify-center rounded-md h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Subrayado"
                    onMouseDown={handleMsgAction(() => wrapMsgSelection('<u>', '</u>'))}>
                    <Underline className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-px h-4 bg-border mx-1" />
                  <button type="button" className="inline-flex items-center justify-center rounded-md h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Lista"
                    onMouseDown={handleMsgAction(() => insertMsgList())}>
                    <List className="h-3.5 w-3.5" />
                  </button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="px-3 pb-3 flex gap-2">
                  <textarea
                    ref={msgInputRef}
                    value={input}
                    onChange={(e: any) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Escribe un mensaje... Shift+Enter para nueva línea"
                    disabled={sending}
                    rows={2}
                    className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm border border-border/50 focus:border-gold/40 focus:outline-none resize-none"
                  />
                  <Button type="submit" disabled={sending || !input.trim()} className="bg-gold hover:bg-gold-dark text-graphite self-end">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-center p-8">
              <div>
                <MessageCircle className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-muted-foreground">Selecciona una conversación o inicia una nueva</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
