import { PublicLayout } from '@/components/public/public-layout';

export default function AvisoLegalPage() {
  return (
    <PublicLayout>
      <article className="max-w-3xl mx-auto">
        <h1 className="font-display text-3xl font-bold text-ivory mb-8">Aviso Legal</h1>
        <div className="prose prose-invert text-ivory/70 space-y-6 text-sm leading-relaxed">
          <p className="text-ivory/50 italic">Última actualización: mayo 2026</p>

          <section>
            <h2 className="text-xl font-display font-bold text-ivory mt-8 mb-3">1. Datos identificativos</h2>
            <p>En cumplimiento del deber de información recogido en la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE), se facilitan los siguientes datos:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong className="text-ivory">Denominación:</strong> NumisCloud</li>
              <li><strong className="text-ivory">Actividad:</strong> Plataforma de gestión de colecciones numismáticas</li>
              <li><strong className="text-ivory">Email de contacto:</strong> <a href="mailto:info@numiscloud.es" className="text-gold hover:underline">info@numiscloud.es</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-ivory mt-8 mb-3">2. Objeto</h2>
            <p>El presente sitio web tiene como objetivo ofrecer una plataforma digital para la catalogación, gestión y valoración de colecciones numismáticas (monedas, billetes, medallas y piezas similares).</p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-ivory mt-8 mb-3">3. Condiciones de uso</h2>
            <p>El acceso y uso de este sitio web atribuye la condición de usuario, e implica la aceptación plena de todas las condiciones incluidas en este Aviso Legal, así como en la Política de Privacidad y los Términos y Condiciones. El usuario se compromete a hacer un uso adecuado del sitio web de conformidad con la ley, los usos y la buena fe.</p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-ivory mt-8 mb-3">4. Propiedad intelectual e industrial</h2>
            <p>Todos los contenidos del sitio web (textos, imágenes, diseño gráfico, código fuente, logotipos, marcas) son propiedad del titular o de terceros que han autorizado su uso. Queda prohibida su reproducción, distribución, comunicación pública o transformación sin autorización expresa.</p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-ivory mt-8 mb-3">5. Exclusión de responsabilidad</h2>
            <p>NumisCloud no se hace responsable de:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Los daños que puedan derivarse de interferencias, interrupciones o fallos del servicio.</li>
              <li>La exactitud o veracidad de las valoraciones generadas por inteligencia artificial.</li>
              <li>El contenido publicado por los usuarios en el registro de piezas robadas.</li>
              <li>El uso que los usuarios hagan de la información obtenida a través de la plataforma.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-ivory mt-8 mb-3">6. Legislación aplicable y jurisdicción</h2>
            <p>El presente Aviso Legal se rige por la legislación española. Para la resolución de cualquier controversia que pudiera surgir, las partes se someten a la jurisdicción de los juzgados y tribunales del domicilio del titular.</p>
          </section>
        </div>
      </article>
    </PublicLayout>
  );
}
