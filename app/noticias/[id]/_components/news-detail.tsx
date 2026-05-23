'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShareButtons } from '@/components/ui/share-buttons';

interface Article {
  id: string; title: string; summary: string; content: string;
  imageUrl?: string; category?: string; createdAt: string;
  author?: { name: string };
}

export function NewsDetail({ articleId }: { articleId: string }) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/news/${articleId}`)
      .then(r => r.json())
      .then(d => setArticle(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [articleId]);

  if (loading) return (
    <div className="max-w-3xl mx-auto">
      <div className="h-8 w-48 bg-white/5 rounded animate-pulse mb-6" />
      <div className="h-64 bg-white/5 rounded-xl animate-pulse mb-8" />
      <div className="space-y-3">
        {[1,2,3,4,5].map(i => <div key={i} className="h-4 bg-white/5 rounded animate-pulse" />)}
      </div>
    </div>
  );

  if (!article) return (
    <div className="text-center py-20">
      <p className="text-ivory/50 text-lg mb-4">Artículo no encontrado</p>
      <Link href="/noticias"><Button variant="outline" className="border-gold/30 text-gold">Volver a noticias</Button></Link>
    </div>
  );

  return (
    <article className="max-w-3xl mx-auto">
      <Link href="/noticias" className="inline-flex items-center gap-2 text-gold/70 hover:text-gold text-sm mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Volver a noticias
      </Link>

      {article.imageUrl && (
        <div className="aspect-video rounded-xl overflow-hidden mb-8 relative bg-graphite-light">
          <Image src={article.imageUrl} alt={article.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 768px" priority />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-ivory/40">
        {article.category && (
          <span className="bg-gold/15 text-gold px-3 py-1 rounded-full text-xs font-bold uppercase">{article.category}</span>
        )}
        <span className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          {new Date(article.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
        {article.author?.name && (
          <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {article.author.name}</span>
        )}
      </div>

      <h1 className="font-display text-3xl sm:text-4xl font-bold text-ivory mb-6 leading-tight">{article.title}</h1>
      <p className="text-ivory/60 text-lg mb-8 border-l-4 border-gold/30 pl-4 italic">{article.summary}</p>

      <div className="prose prose-invert max-w-none text-ivory/80 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br/>') }} />

      <div className="mt-10 pt-6 border-t border-ivory/10">
        <ShareButtons title={article.title} text={article.summary} />
      </div>
    </article>
  );
}
