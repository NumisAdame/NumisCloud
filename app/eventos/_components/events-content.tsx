'use client';

import { useState, useEffect, useCallback } from 'react';
import { CalendarDays, MapPin, ExternalLink, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EventItem {
  id: string; title: string; description?: string; location: string;
  city?: string; country?: string; startDate: string; endDate?: string;
  url?: string; organizer?: string; featured: boolean;
}

export function EventsContent() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPast, setShowPast] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (showPast) params.set('past', 'true');
      const res = await fetch(`/api/events?${params}`);
      const data = await res.json();
      setEvents(data.events || []);
    } catch { setEvents([]); } finally { setLoading(false); }
  }, [showPast]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  const fmtRange = (s: string, e?: string) => e ? `${fmtDate(s)} — ${fmtDate(e)}` : fmtDate(s);

  const isToday = (s: string, e?: string) => {
    const now = new Date();
    const start = new Date(s);
    const end = e ? new Date(e) : start;
    return now >= start && now <= end;
  };

  return (
    <div>
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <CalendarDays className="h-8 w-8 text-gold" />
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-ivory">Ferias y Convenciones</h1>
        </div>
        <p className="text-ivory/60 max-w-2xl">Calendario de eventos numismáticos: ferias, subastas, convenciones y encuentros de coleccionistas.</p>
      </div>

      <div className="flex gap-2 mb-8">
        <button onClick={() => setShowPast(false)}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${!showPast ? 'bg-gold text-graphite' : 'bg-white/5 text-ivory/60 hover:bg-white/10'}`}>
          Próximos eventos
        </button>
        <button onClick={() => setShowPast(true)}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${showPast ? 'bg-gold text-graphite' : 'bg-white/5 text-ivory/60 hover:bg-white/10'}`}>
          Eventos pasados
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3,4].map(i => <div key={i} className="bg-white/5 rounded-xl h-32 animate-pulse" />)}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20">
          <CalendarDays className="h-16 w-16 text-ivory/20 mx-auto mb-4" />
          <p className="text-ivory/50 text-lg">{showPast ? 'No hay eventos pasados registrados' : 'No hay próximos eventos'}</p>
          <p className="text-ivory/30 text-sm mt-1">Pronto añadiremos más eventos al calendario</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map(ev => (
            <div key={ev.id} className={`bg-graphite-light/50 border rounded-xl p-6 transition-all ${
              ev.featured ? 'border-gold/30 shadow-lg shadow-gold/5' : 'border-gold/10 hover:border-gold/20'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Date block */}
                <div className="flex-shrink-0 w-16 text-center">
                  <div className="bg-gold/10 rounded-lg p-2">
                    <span className="text-gold text-2xl font-bold block">
                      {new Date(ev.startDate).getDate()}
                    </span>
                    <span className="text-gold/70 text-xs uppercase">
                      {new Date(ev.startDate).toLocaleDateString('es-ES', { month: 'short' })}
                    </span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-1">
                    {ev.featured && <Star className="h-4 w-4 text-gold fill-gold flex-shrink-0 mt-1" />}
                    {isToday(ev.startDate, ev.endDate || undefined) && (
                      <span className="bg-green-500/20 text-green-300 text-xs font-bold px-2 py-0.5 rounded-full">EN CURSO</span>
                    )}
                    <h3 className="font-display text-lg font-bold text-ivory">{ev.title}</h3>
                  </div>

                  {ev.description && <p className="text-ivory/50 text-sm mb-3 line-clamp-2">{ev.description}</p>}

                  <div className="flex flex-wrap gap-4 text-sm text-ivory/40">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {fmtRange(ev.startDate, ev.endDate || undefined)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {ev.location}{ev.city ? `, ${ev.city}` : ''}{ev.country ? ` (${ev.country})` : ''}
                    </span>
                    {ev.organizer && <span className="text-ivory/30">{ev.organizer}</span>}
                  </div>
                </div>

                {ev.url && (
                  <a href={ev.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                    <Button variant="outline" size="sm" className="border-gold/30 text-gold hover:bg-gold/10">
                      <ExternalLink className="h-3.5 w-3.5 mr-1" /> Web
                    </Button>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
