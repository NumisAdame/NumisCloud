'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Send, Loader2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { RichTextToolbar } from '@/components/ui/rich-text-toolbar';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export function NewTopicForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession() || {};
  const userRole = (session?.user as any)?.role;
  const canCreate = userRole === 'ADMIN' || userRole === 'MODERATOR';
  const preselectedCategory = searchParams?.get('category') || '';

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCats, setLoadingCats] = useState(true);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (status === 'authenticated' && !canCreate) {
      router.replace('/foro');
    }
  }, [status, canCreate, router]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/forum/categories');
        if (res.ok) {
          const data = await res.json();
          const cats = data?.categories ?? [];
          setCategories(cats);
          // Auto-select preselected
          if (preselectedCategory) {
            const match = cats.find((c: Category) => c.slug === preselectedCategory);
            if (match) setCategoryId(match.id);
          }
        }
      } catch (err) {
        console.error('Fetch categories error:', err);
      } finally {
        setLoadingCats(false);
      }
    };
    fetchCategories();
  }, [preselectedCategory]);

  if (status === 'loading') return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>;
  if (status === 'unauthenticated' || !canCreate) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !categoryId) {
      toast.error('Completa todos los campos');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/forum/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), content: content.trim(), categoryId }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success('Tema creado');
        router.push(`/foro/tema/${data?.topic?.id}`);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err?.error ?? 'Error al crear tema');
      }
    } catch {
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/foro" className="text-sm text-muted-foreground hover:text-gold flex items-center gap-1 mb-2">
          <ArrowLeft className="h-3.5 w-3.5" /> Volver al foro
        </Link>
        <h1 className="font-display text-2xl font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="h-7 w-7 text-gold" /> Nuevo tema
        </h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Categoría *</Label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="mt-1 w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:border-gold/40 focus:outline-none"
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Título *</Label>
              <Input
                value={title}
                onChange={(e: any) => setTitle(e.target?.value ?? '')}
                placeholder="Título del tema"
                className="mt-1"
                maxLength={200}
              />
            </div>
            <div>
              <Label>Contenido *</Label>
              <div className="mt-1">
                <RichTextToolbar textareaRef={contentRef} value={content} onChange={setContent} />
                <textarea
                  ref={contentRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Escribe el contenido de tu tema... Usa **negrita**, *cursiva*, listas y más"
                  className="mt-2 w-full min-h-[200px] bg-background border border-input rounded-md px-3 py-2 text-sm focus:border-gold/40 focus:outline-none resize-y"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={loading} className="bg-gold hover:bg-gold-dark text-graphite font-semibold">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
                Publicar tema
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
