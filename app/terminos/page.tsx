import { PublicLayout } from '@/components/public/public-layout';

export default function TerminosPage() {
  return (
    <PublicLayout>
      <article className="max-w-3xl mx-auto">
        <h1 className="font-display text-3xl font-bold text-ivory mb-8">Términos y Condiciones</h1>
        <div className="prose prose-invert text-ivory/70 space-y-6 text-sm leading-relaxed">
          <p className="text-ivory/50 italic">Última actualización: mayo 2026</p>

          <section>
            <h2 className="text-xl font-display font-bold text-ivory mt-8 mb-3">1. Objeto</h2>
            <p>Los presentes Términos y Condiciones regulan el uso de la plataforma NumisCloud, un servicio en línea para la gestión de colecciones numismáticas. Al registrarse y utilizar NumisCloud, el usuario acepta estos términos en su totalidad.</p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-ivory mt-8 mb-3">2. Registro y cuenta</h2>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>El usuario debe proporcionar información veraz durante el registro.</li>
              <li>Cada persona física puede mantener una única cuenta.</li>
              <li>El usuario es responsable de mantener la confidencialidad de sus credenciales.</li>
              <li>Nos reservamos el derecho de suspender cuentas que incumplan estos términos.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-ivory mt-8 mb-3">3. Planes y suscripciones</h2>
            <p>NumisCloud ofrece:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong className="text-ivory">Plan Gratuito:</strong> limitado a 20 piezas, incluye 7 días de Chat IA gratuito.</li>
              <li><strong className="text-ivory">Plan Premium:</strong> piezas ilimitadas, Chat IA numismático, exportación de datos, y funciones avanzadas. Disponible en modalidad mensual (1,99€/mes) o anual (14,99€/año).</li>
            </ul>
            <p className="mt-2">Los pagos se procesan de forma segura a través de Stripe. Las suscripciones se renuevan automáticamente salvo cancelación previa. Puede cancelar su suscripción en cualquier momento desde la sección de Suscripción.</p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-ivory mt-8 mb-3">4. Contenido del usuario</h2>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>El usuario mantiene todos los derechos sobre el contenido que sube a la plataforma.</li>
              <li>El usuario garantiza que tiene derecho a subir las imágenes y datos que proporciona.</li>
              <li>NumisCloud no se responsabiliza de la exactitud de las valoraciones o descripciones generadas por IA.</li>
              <li>Los datos del Chat IA son orientativos y no constituyen tasación profesional.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-ivory mt-8 mb-3">5. Registro de piezas robadas</h2>
            <p>NumisCloud proporciona un servicio de registro de piezas robadas o extraviadas de buena fe. Las denuncias son revisadas antes de su publicación. NumisCloud no se responsabiliza de la veracidad de los reportes publicados y se reserva el derecho de eliminar contenido inapropiado o falso.</p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-ivory mt-8 mb-3">6. Propiedad intelectual</h2>
            <p>La plataforma NumisCloud, su diseño, código y contenido original son propiedad del titular. Queda prohibida su reproducción sin autorización.</p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-ivory mt-8 mb-3">7. Limitación de responsabilidad</h2>
            <p>NumisCloud se proporciona "tal cual". No garantizamos la disponibilidad ininterrumpida del servicio ni la exactitud de las valoraciones automáticas. En ningún caso seremos responsables de daños indirectos derivados del uso de la plataforma.</p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-ivory mt-8 mb-3">8. Modificaciones</h2>
            <p>Nos reservamos el derecho de modificar estos términos. Los cambios significativos serán notificados por email. El uso continuado de la plataforma tras la notificación implica la aceptación de los nuevos términos.</p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-ivory mt-8 mb-3">9. Legislación aplicable</h2>
            <p>Estos términos se rigen por la legislación española. Para la resolución de cualquier controversia, las partes se someten a los juzgados y tribunales de la ciudad de domicilio del titular.</p>
          </section>
        </div>
      </article>
    </PublicLayout>
  );
}
