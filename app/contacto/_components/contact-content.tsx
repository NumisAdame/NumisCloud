'use client';

import { useState } from 'react';
import { Mail, Send, Loader2, CheckCircle2, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function ContactContent() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error('Todos los campos son obligatorios');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setSent(true);
      toast.success('Mensaje enviado correctamente');
    } catch {
      toast.error('Error al enviar el mensaje. Inténtalo de nuevo.');
    } finally { setSubmitting(false); }
  };

  const up = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  if (sent) return (
    <div className="max-w-lg mx-auto text-center py-20">
      <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto mb-4" />
      <h2 className="font-display text-2xl font-bold text-ivory mb-2">¡Mensaje enviado!</h2>
      <p className="text-ivory/60">Gracias por contactarnos. Te responderemos lo antes posible.</p>
      <Button onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
        variant="outline" className="mt-6 border-gold/30 text-gold hover:bg-gold/10">
        Enviar otro mensaje
      </Button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Mail className="h-8 w-8 text-gold" />
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-ivory">Contacto</h1>
        </div>
        <p className="text-ivory/60">¿Tienes alguna pregunta, sugerencia o quieres colaborar? Escríbenos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-ivory/70 mb-1.5 block">Nombre *</label>
                <Input value={form.name} onChange={e => up('name', e.target.value)}
                  placeholder="Tu nombre" className="bg-white/5 border-gold/20 text-ivory" required />
              </div>
              <div>
                <label className="text-sm font-medium text-ivory/70 mb-1.5 block">Email *</label>
                <Input type="email" value={form.email} onChange={e => up('email', e.target.value)}
                  placeholder="tu@email.com" className="bg-white/5 border-gold/20 text-ivory" required />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-ivory/70 mb-1.5 block">Asunto *</label>
              <Input value={form.subject} onChange={e => up('subject', e.target.value)}
                placeholder="Asunto del mensaje" className="bg-white/5 border-gold/20 text-ivory" required />
            </div>
            <div>
              <label className="text-sm font-medium text-ivory/70 mb-1.5 block">Mensaje *</label>
              <textarea value={form.message} onChange={e => up('message', e.target.value)}
                rows={6} placeholder="Escribe tu mensaje aquí..."
                className="w-full bg-white/5 border border-gold/20 rounded-lg px-3 py-2 text-ivory text-sm placeholder:text-ivory/30 focus:outline-none focus:ring-2 focus:ring-gold/30" required />
            </div>
            <Button type="submit" disabled={submitting} className="bg-gold hover:bg-gold-dark text-graphite font-semibold py-6 px-8">
              {submitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Send className="h-5 w-5 mr-2" />}
              Enviar mensaje
            </Button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-graphite-light/50 border border-gold/10 rounded-xl p-6">
            <h3 className="font-display text-lg font-bold text-ivory mb-4">Información</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-gold mt-0.5" />
                <div>
                  <p className="text-ivory/70 text-sm font-medium">Email</p>
                  <a href="mailto:info@numiscloud.es" className="text-gold text-sm hover:underline">info@numiscloud.es</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gold mt-0.5" />
                <div>
                  <p className="text-ivory/70 text-sm font-medium">Ubicación</p>
                  <p className="text-ivory/50 text-sm">España</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gold/5 border border-gold/15 rounded-xl p-6">
            <p className="text-ivory/60 text-sm leading-relaxed">
              Respondemos normalmente en menos de 48 horas. Para consultas urgentes, puedes escribirnos directamente al email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
