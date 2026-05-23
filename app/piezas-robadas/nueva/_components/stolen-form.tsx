'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PIECE_TYPES, METALS } from '@/lib/constants';
import { toast } from 'sonner';

export function StolenForm() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', type: 'MONEDA', country: '', year: '',
    metal: '', contactEmail: '', contactPhone: '', location: '',
    dateStolen: '', policeReport: '',
  });

  if (status === 'loading') return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 text-gold animate-spin" /></div>;

  if (!session?.user) return (
    <div className="text-center py-20">
      <ShieldAlert className="h-16 w-16 text-ivory/20 mx-auto mb-4" />
      <p className="text-ivory/50 text-lg mb-4">Debes iniciar sesión para reportar una pieza</p>
      <Link href="/login"><Button className="bg-gold hover:bg-gold-dark text-graphite">Iniciar sesión</Button></Link>
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description) { toast.error('Título y descripción son obligatorios'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/stolen-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, contactEmail: form.contactEmail || (session.user as any).email }),
      });
      if (!res.ok) throw new Error();
      toast.success('Denuncia enviada. Será revisada antes de publicarse.');
      router.push('/piezas-robadas');
    } catch {
      toast.error('Error al enviar la denuncia');
    } finally { setSubmitting(false); }
  };

  const up = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/piezas-robadas" className="inline-flex items-center gap-2 text-gold/70 hover:text-gold text-sm mb-6">
        <ArrowLeft className="h-4 w-4" /> Volver al registro
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <ShieldAlert className="h-7 w-7 text-red-400" />
        <h1 className="font-display text-2xl font-bold text-ivory">Reportar pieza robada / extraviada</h1>
      </div>

      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-8 text-sm text-ivory/70">
        <p>Tu denuncia será revisada por el equipo antes de publicarse. Incluye la mayor cantidad de información posible para ayudar a identificar la pieza.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-sm font-medium text-ivory/70 mb-1.5 block">Título de la pieza *</label>
          <Input value={form.title} onChange={e => up('title', e.target.value)} placeholder="Ej: Duro de plata 1870"
            className="bg-white/5 border-gold/20 text-ivory" required />
        </div>

        <div>
          <label className="text-sm font-medium text-ivory/70 mb-1.5 block">Descripción detallada *</label>
          <textarea value={form.description} onChange={e => up('description', e.target.value)}
            rows={5} placeholder="Describe la pieza con el mayor detalle posible: características físicas, marcas, desgaste, etc."
            className="w-full bg-white/5 border border-gold/20 rounded-lg px-3 py-2 text-ivory text-sm placeholder:text-ivory/30 focus:outline-none focus:ring-2 focus:ring-gold/30" required />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-ivory/70 mb-1.5 block">Tipo</label>
            <select value={form.type} onChange={e => up('type', e.target.value)}
              className="w-full bg-white/5 border border-gold/20 rounded-lg px-3 py-2 text-ivory text-sm">
              {PIECE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-ivory/70 mb-1.5 block">País de origen</label>
            <Input value={form.country} onChange={e => up('country', e.target.value)} placeholder="Ej: España"
              className="bg-white/5 border-gold/20 text-ivory" />
          </div>
          <div>
            <label className="text-sm font-medium text-ivory/70 mb-1.5 block">Año aproximado</label>
            <Input type="number" value={form.year} onChange={e => up('year', e.target.value)} placeholder="Ej: 1870"
              className="bg-white/5 border-gold/20 text-ivory" />
          </div>
          <div>
            <label className="text-sm font-medium text-ivory/70 mb-1.5 block">Metal</label>
            <select value={form.metal} onChange={e => up('metal', e.target.value)}
              className="w-full bg-white/5 border border-gold/20 rounded-lg px-3 py-2 text-ivory text-sm">
              <option value="">-- Seleccionar --</option>
              {METALS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <hr className="border-gold/10" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-ivory/70 mb-1.5 block">Lugar del robo</label>
            <Input value={form.location} onChange={e => up('location', e.target.value)} placeholder="Ciudad, país"
              className="bg-white/5 border-gold/20 text-ivory" />
          </div>
          <div>
            <label className="text-sm font-medium text-ivory/70 mb-1.5 block">Fecha del robo</label>
            <Input type="date" value={form.dateStolen} onChange={e => up('dateStolen', e.target.value)}
              className="bg-white/5 border-gold/20 text-ivory" />
          </div>
          <div>
            <label className="text-sm font-medium text-ivory/70 mb-1.5 block">Nº denuncia policial</label>
            <Input value={form.policeReport} onChange={e => up('policeReport', e.target.value)} placeholder="Referencia"
              className="bg-white/5 border-gold/20 text-ivory" />
          </div>
        </div>

        <hr className="border-gold/10" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-ivory/70 mb-1.5 block">Email de contacto</label>
            <Input type="email" value={form.contactEmail} onChange={e => up('contactEmail', e.target.value)}
              placeholder={(session.user as any).email || 'tu@email.com'}
              className="bg-white/5 border-gold/20 text-ivory" />
          </div>
          <div>
            <label className="text-sm font-medium text-ivory/70 mb-1.5 block">Teléfono (opcional)</label>
            <Input value={form.contactPhone} onChange={e => up('contactPhone', e.target.value)}
              placeholder="+34 600 000 000" className="bg-white/5 border-gold/20 text-ivory" />
          </div>
        </div>

        <Button type="submit" disabled={submitting} className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-base">
          {submitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Send className="h-5 w-5 mr-2" />}
          Enviar denuncia
        </Button>
      </form>
    </div>
  );
}
