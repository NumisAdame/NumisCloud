'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Newspaper, ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const CATEGORIES = [
  { value: '', label: 'Todas' },
  { value: 'mercado', label: 'Mercado' },
  { value: 'descubrimiento', label: 'Descubrimientos' },
  { value: 'historia', label: 'Historia' },
  { value: 'subastas', label: 'Subastas' },
  { value: 'tecnologia', label: 'Tecnología' },
];

interface Article {
  id: string;
  title: string;
  summary: string;
  imageUrl?: string;
  category?: string;
  createdAt: string;
  author?: { name: string };
}

export function NewsContent() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '9' });
      if (category) params.set('category', category);
      const res = await fetch(`/api/news?${params}`);
      const data = await res.json();
      setArticles(data.articles || []);
      setTotalPages(data.pages || 1);
    } catch { setArticles([]); } finally { setLoading(false); }
  }, [page, category]);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  const catLabel = (c?: string) => CATEGORIES.find(x => x.value === c)?.label || c || '';

  return (
    <div>
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Newspaper className="h-8 w-8 text-gold" />
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-ivory">Noticias Numismáticas</h1>
        </div>
        <p className="text-ivory/60 max-w-2xl">Últimas noticias del mundo de la numismática: mercado, descubrimientos, subastas y más.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map(c => (
          <button
            key={c.value}
            onClick={() => { setCategory(c.value); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              category === c.value
                ? 'bg-gold text-graphite'
                : 'bg-white/5 text-ivory/60 hover:bg-white/10 hover:text-ivory'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white/5 rounded-xl h-72 animate-pulse" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20">
          <Newspaper className="h-16 w-16 text-ivory/20 mx-auto mb-4" />
          <p className="text-ivory/50 text-lg">No hay noticias publicadas todavía</p>
          <p className="text-ivory/30 text-sm mt-1">Vuelve pronto para estar al día</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map(a => (
            <Link key={a.id} href={`/noticias/${a.id}`}
              className="group bg-graphite-light/50 border border-gold/10 rounded-xl overflow-hidden hover:border-gold/30 transition-all hover:shadow-lg hover:shadow-gold/5">
              <div className="aspect-video bg-graphite-light relative overflow-hidden">
                {a.imageUrl ? (
                  <Image src={a.imageUrl} alt={a.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Newspaper className="h-12 w-12 text-gold/20" />
                  </div>
                )}
                {a.category && (
                  <span className="absolute top-3 left-3 bg-gold/90 text-graphite text-xs font-bold px-2.5 py-1 rounded-full">
                    {catLabel(a.category)}
                  </span>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-bold text-ivory group-hover:text-gold transition-colors line-clamp-2 mb-2">
                  {a.title}
                </h3>
                <p className="text-ivory/50 text-sm line-clamp-3 mb-4">{a.summary}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-ivory/30">{fmtDate(a.createdAt)}</span>
                  <ChevronRight className="h-4 w-4 text-gold/50 group-hover:text-gold group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          <Button variant="outline" size="sm" disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="border-gold/30 text-gold hover:bg-gold/10">Anterior</Button>
          <span className="text-ivory/50 text-sm flex items-center px-3">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="border-gold/30 text-gold hover:bg-gold/10">Siguiente</Button>
        </div>
      )}
    </div>
  );
}
