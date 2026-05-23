'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  ShieldAlert, Search, Plus, MapPin, Calendar, FileText,
  Camera, Phone, CheckCircle, Clock, Eye, ChevronDown, ChevronUp, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PIECE_TYPES } from '@/lib/constants';

interface Report {
  id: string; title: string; description: string; type: string;
  country?: string; year?: number; metal?: string; imageUrl?: string;
  location?: string; dateStolen?: string; createdAt: string;
}

export function StolenContent() {
  const { data: session } = useSession() || {};
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showGuide, setShowGuide] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '12' });
      if (search) params.set('search', search);
      if (typeFilter) params.set('type', typeFilter);
      const res = await fetch(`/api/stolen-reports?${params}`);
      const data = await res.json();
      setReports(data.reports || []);
      setTotalPages(data.pages || 1);
    } catch { setReports([]); } finally { setLoading(false); }
  }, [page, search, typeFilter]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const typeLabel = (t: string) => PIECE_TYPES.find(x => x.value === t)?.label || t;

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ShieldAlert className="h-8 w-8 text-red-400" />
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-ivory">Registro de Piezas Robadas</h1>
        </div>
        <p className="text-ivory/60 max-w-2xl">Consulta las denuncias de piezas numismáticas robadas o extraviadas. Si reconoces alguna pieza, contacta con el denunciante.</p>
      </div>

      {/* Guide toggle */}
      <button
        onClick={() => setShowGuide(!showGuide)}
        className="flex items-center gap-2 mb-6 text-gold/80 hover:text-gold text-sm font-medium transition-colors group"
      >
        <FileText className="h-4 w-4" />
        ¿Cómo funciona el registro de piezas robadas?
        {showGuide ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {showGuide && (
        <div className="mb-8 bg-graphite-light/60 border border-gold/15 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gold/10 border-b border-gold/15 px-6 py-4">
            <h2 className="font-display text-lg font-bold text-ivory flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-400" />
              Guía del proceso de denuncia
            </h2>
            <p className="text-ivory/50 text-sm mt-1">Sigue estos pasos para reportar una pieza robada o extraviada</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Step 1 */}
              <div className="flex gap-4 p-4 bg-white/[0.03] rounded-xl border border-white/5">
                <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0">
                  <span className="text-gold font-bold text-sm">1</span>
                </div>
                <div>
                  <h3 className="text-ivory font-semibold text-sm flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-gold/70" />
                    Crea el informe
                  </h3>
                  <p className="text-ivory/50 text-xs mt-1.5 leading-relaxed">
                    Pulsa <strong className="text-red-300">"Reportar pieza"</strong> y rellena el formulario con todos los datos que recuerdes: tipo de pieza, país, año, metal, descripción detallada y cualquier referencia de catálogo.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4 p-4 bg-white/[0.03] rounded-xl border border-white/5">
                <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0">
                  <span className="text-gold font-bold text-sm">2</span>
                </div>
                <div>
                  <h3 className="text-ivory font-semibold text-sm flex items-center gap-1.5">
                    <Camera className="h-3.5 w-3.5 text-gold/70" />
                    Aporta fotografías
                  </h3>
                  <p className="text-ivory/50 text-xs mt-1.5 leading-relaxed">
                    Incluye imágenes de la pieza (anverso y reverso si es posible). Las fotografías son esenciales para que otros coleccionistas puedan identificar la pieza en ferias, subastas o tiendas.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4 p-4 bg-white/[0.03] rounded-xl border border-white/5">
                <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0">
                  <span className="text-gold font-bold text-sm">3</span>
                </div>
                <div>
                  <h3 className="text-ivory font-semibold text-sm flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-gold/70" />
                    Datos de contacto
                  </h3>
                  <p className="text-ivory/50 text-xs mt-1.5 leading-relaxed">
                    Proporciona un email de contacto y, opcionalmente, un teléfono. Si alguien reconoce tu pieza, podrá ponerse en contacto contigo directamente. También puedes incluir el número de la denuncia policial.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4 p-4 bg-white/[0.03] rounded-xl border border-white/5">
                <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0">
                  <span className="text-gold font-bold text-sm">4</span>
                </div>
                <div>
                  <h3 className="text-ivory font-semibold text-sm flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-gold/70" />
                    Revisión por el equipo
                  </h3>
                  <p className="text-ivory/50 text-xs mt-1.5 leading-relaxed">
                    Tu informe será revisado por nuestro equipo de moderación para verificar que la información es correcta y cumple con las normas. Este proceso suele completarse en 24-48 horas.
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex gap-4 p-4 bg-white/[0.03] rounded-xl border border-white/5">
                <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0">
                  <span className="text-gold font-bold text-sm">5</span>
                </div>
                <div>
                  <h3 className="text-ivory font-semibold text-sm flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-gold/70" />
                    Publicación y visibilidad
                  </h3>
                  <p className="text-ivory/50 text-xs mt-1.5 leading-relaxed">
                    Una vez aprobado, tu informe será visible en esta página para toda la comunidad. Los coleccionistas podrán consultarlo y alertar si detectan la pieza en el mercado.
                  </p>
                </div>
              </div>

              {/* Step 6 */}
              <div className="flex gap-4 p-4 bg-white/[0.03] rounded-xl border border-white/5">
                <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0">
                  <span className="text-gold font-bold text-sm">6</span>
                </div>
                <div>
                  <h3 className="text-ivory font-semibold text-sm flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-gold/70" />
                    Resolución
                  </h3>
                  <p className="text-ivory/50 text-xs mt-1.5 leading-relaxed">
                    Si recuperas la pieza, contacta con nosotros para que marquemos el informe como <strong className="text-green-400">resuelto</strong>. El registro se mantendrá como referencia pero indicará que la pieza fue recuperada.
                  </p>
                </div>
              </div>
            </div>

            {/* States explanation */}
            <div className="border-t border-white/5 pt-5">
              <h3 className="text-ivory font-semibold text-sm mb-3">Estados de un informe</h3>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                  <Clock className="h-3.5 w-3.5 text-amber-400" />
                  <div>
                    <span className="text-amber-300 text-xs font-semibold">Pendiente</span>
                    <p className="text-ivory/40 text-[10px]">En revisión por el equipo</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2">
                  <Eye className="h-3.5 w-3.5 text-blue-400" />
                  <div>
                    <span className="text-blue-300 text-xs font-semibold">Aprobado</span>
                    <p className="text-ivory/40 text-[10px]">Visible para la comunidad</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                  <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                  <div>
                    <span className="text-green-300 text-xs font-semibold">Resuelto</span>
                    <p className="text-ivory/40 text-[10px]">Pieza recuperada</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                  <div>
                    <span className="text-red-300 text-xs font-semibold">Rechazado</span>
                    <p className="text-ivory/40 text-[10px]">No cumple las normas</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gold/5 border border-gold/15 rounded-xl p-4">
              <h3 className="text-gold font-semibold text-sm mb-2">💡 Consejos para un informe eficaz</h3>
              <ul className="text-ivory/50 text-xs space-y-1.5 leading-relaxed">
                <li>• <strong className="text-ivory/70">Sé lo más detallado posible</strong> en la descripción: marcas, golpes, pátina, características únicas.</li>
                <li>• <strong className="text-ivory/70">Incluye referencias de catálogo</strong> (KM, Cayón, Calicó, etc.) para facilitar la identificación.</li>
                <li>• <strong className="text-ivory/70">Indica la fecha y lugar del robo</strong>, así como las circunstancias si es posible.</li>
                <li>• <strong className="text-ivory/70">Adjunta el número de denuncia policial</strong> para dar más credibilidad al informe.</li>
                <li>• <strong className="text-ivory/70">Comparte el enlace</strong> de tu denuncia en redes sociales y foros numismáticos para mayor difusión.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ivory/30" />
          <Input placeholder="Buscar por título, descripción, país..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-10 bg-white/5 border-gold/20 text-ivory placeholder:text-ivory/30" />
        </div>
        <select value={typeFilter}
          onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
          className="bg-white/5 border border-gold/20 rounded-lg px-3 py-2 text-ivory text-sm">
          <option value="">Todos los tipos</option>
          {PIECE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        {session?.user && (
          <Link href="/piezas-robadas/nueva">
            <Button className="bg-red-600 hover:bg-red-700 text-white whitespace-nowrap">
              <Plus className="h-4 w-4 mr-1" /> Reportar pieza
            </Button>
          </Link>
        )}
      </div>

      {!session?.user && (
        <div className="bg-gold/10 border border-gold/20 rounded-lg p-4 mb-8 text-center">
          <p className="text-ivory/70 text-sm">
            <Link href="/login" className="text-gold font-semibold hover:underline">Inicia sesión</Link> para reportar una pieza robada o extraviada.
          </p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <div key={i} className="bg-white/5 rounded-xl h-64 animate-pulse" />)}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-20">
          <ShieldAlert className="h-16 w-16 text-ivory/20 mx-auto mb-4" />
          <p className="text-ivory/50 text-lg">No hay denuncias registradas</p>
          <p className="text-ivory/30 text-sm mt-1">Esperamos que no las haya nunca</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map(r => (
            <div key={r.id} className="bg-graphite-light/50 border border-red-500/20 rounded-xl overflow-hidden hover:border-red-500/40 transition-all">
              {r.imageUrl ? (
                <div className="aspect-video bg-graphite-light">
                  <img src={r.imageUrl} alt={r.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-video bg-graphite-light flex items-center justify-center">
                  <ShieldAlert className="h-12 w-12 text-red-500/20" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-red-500/20 text-red-300 text-xs font-bold px-2 py-0.5 rounded-full">{typeLabel(r.type)}</span>
                  {r.year && <span className="text-ivory/40 text-xs">~{r.year}</span>}
                </div>
                <h3 className="font-display text-lg font-bold text-ivory mb-2 line-clamp-2">{r.title}</h3>
                <p className="text-ivory/50 text-sm line-clamp-3 mb-3">{r.description}</p>
                <div className="flex flex-wrap gap-3 text-xs text-ivory/30">
                  {r.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {r.location}</span>}
                  {r.dateStolen && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(r.dateStolen).toLocaleDateString('es-ES')}</span>}
                  {r.country && <span>{r.country}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
