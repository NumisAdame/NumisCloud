import { PublicLayout } from '@/components/public/public-layout';

export default function PrivacidadPage() {
  return (
    <PublicLayout>
      <article className="max-w-3xl mx-auto">
        <h1 className="font-display text-3xl font-bold text-ivory mb-8">Política de Privacidad</h1>
        <div className="prose prose-invert text-ivory/70 space-y-6 text-sm leading-relaxed">
          <p className="text-ivory/50 italic">Última actualización: mayo 2026</p>

          <section>
            <h2 className="text-xl font-display font-bold text-ivory mt-8 mb-3">1. Responsable del tratamiento</h2>
            <p>NumisCloud es una plataforma de gestión de colecciones numismáticas operada desde España. El responsable del tratamiento de los datos personales es el titular de NumisCloud. Para cualquier consulta relacionada con la privacidad, puede contactarnos a través de <a href="mailto:info@numiscloud.es" className="text-gold hover:underline">info@numiscloud.es</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-ivory mt-8 mb-3">2. Datos que recopilamos</h2>
            <p>Recopilamos los siguientes tipos de datos:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong className="text-ivory">Datos de registro:</strong> nombre, dirección de correo electrónico y país.</li>
              <li><strong className="text-ivory">Datos de la colección:</strong> información sobre piezas numismáticas (títulos, descripciones, imágenes, valores).</li>
              <li><strong className="text-ivory">Datos de uso:</strong> interacciones con la plataforma, fechas de acceso.</li>
              <li><strong className="text-ivory">Datos de pago:</strong> procesados de forma segura a través de Stripe. No almacenamos datos de tarjetas de crédito.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-ivory mt-8 mb-3">3. Finalidad del tratamiento</h2>
            <p>Sus datos se utilizan para:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Gestionar su cuenta y proporcionarle acceso a la plataforma.</li>
              <li>Almacenar y gestionar su colección numismática.</li>
              <li>Procesar suscripciones y pagos.</li>
              <li>Enviar comunicaciones relacionadas con el servicio.</li>
              <li>Mejorar la plataforma y la experiencia de usuario.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-ivory mt-8 mb-3">4. Base legal</h2>
            <p>El tratamiento de sus datos se basa en: la ejecución del contrato de servicio, su consentimiento explícito al registrarse, y nuestro interés legítimo en mejorar la plataforma, conforme al Reglamento General de Protección de Datos (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD).</p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-ivory mt-8 mb-3">5. Conservación de datos</h2>
            <p>Sus datos se conservarán mientras mantenga una cuenta activa. Puede solicitar la eliminación de su cuenta y todos los datos asociados en cualquier momento desde la sección de Perfil.</p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-ivory mt-8 mb-3">6. Sus derechos</h2>
            <p>Conforme al RGPD, usted tiene derecho a:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong className="text-ivory">Acceso:</strong> conocer qué datos personales tratamos.</li>
              <li><strong className="text-ivory">Rectificación:</strong> corregir datos inexactos.</li>
              <li><strong className="text-ivory">Supresión:</strong> solicitar la eliminación de sus datos.</li>
              <li><strong className="text-ivory">Portabilidad:</strong> recibir sus datos en formato estructurado (CSV).</li>
              <li><strong className="text-ivory">Oposición:</strong> oponerse al tratamiento de sus datos.</li>
              <li><strong className="text-ivory">Limitación:</strong> solicitar la limitación del tratamiento.</li>
            </ul>
            <p className="mt-2">Para ejercer estos derechos, contacte con nosotros en <a href="mailto:info@numiscloud.es" className="text-gold hover:underline">info@numiscloud.es</a>. También puede presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD).</p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-ivory mt-8 mb-3">7. Seguridad</h2>
            <p>Implementamos medidas técnicas y organizativas para proteger sus datos: cifrado en tránsito (TLS), almacenamiento seguro de contraseñas (bcrypt), y acceso restringido a los datos.</p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-ivory mt-8 mb-3">8. Cookies</h2>
            <p>Utilizamos cookies esenciales para el funcionamiento de la plataforma (sesión de usuario, preferencias). No utilizamos cookies de seguimiento de terceros ni cookies publicitarias.</p>
          </section>
        </div>
      </article>
    </PublicLayout>
  );
}
