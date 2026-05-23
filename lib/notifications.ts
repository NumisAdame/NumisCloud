/**
 * Send a notification email via Abacus AI notification API.
 * Non-blocking — logs errors but doesn't throw.
 */
export async function sendNotificationEmail(params: {
  notificationId: string;
  recipientEmail: string;
  subject: string;
  body: string;
  replyTo?: string;
}) {
  try {
    const appUrl = process.env.NEXTAUTH_URL || '';
    const hostname = appUrl ? new URL(appUrl).hostname : 'numiscloud.es';
    const appName = 'NumisCloud';

    const response = await fetch('https://apps.abacus.ai/api/sendNotificationEmail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deployment_token: process.env.ABACUSAI_API_KEY,
        app_id: process.env.WEB_APP_ID,
        notification_id: params.notificationId,
        subject: params.subject,
        body: params.body,
        is_html: true,
        recipient_email: params.recipientEmail,
        sender_email: `noreply@${hostname}`,
        sender_alias: appName,
        ...(params.replyTo && { reply_to: params.replyTo }),
      }),
    });

    const result = await response.json();
    if (!result.success) {
      if (result.notification_disabled) {
        console.log(`[Notification] ${params.notificationId} disabled by user, skipping`);
        return;
      }
      console.error('[Notification] Failed:', result.message);
    } else {
      console.log('[Notification] Sent:', params.subject, 'to', params.recipientEmail);
    }
  } catch (error: any) {
    console.error('[Notification] Error sending:', error?.message);
  }
}

/**
 * Build the welcome email HTML body.
 */
export function buildWelcomeEmailHtml(userName: string): string {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F5F0E8; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #1A1A2E, #2D4A3E); padding: 40px 30px; text-align: center;">
        <h1 style="color: #C5A55A; margin: 0; font-size: 28px;">🪙 Bienvenido a NumisCloud</h1>
        <p style="color: #F5F0E8; margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Tu colección numismática en la nube</p>
      </div>
      <div style="padding: 30px; color: #1A1A2E;">
        <h2 style="color: #2D4A3E; margin-top: 0;">¡Hola${userName ? ', ' + userName : ''}!</h2>
        <p style="font-size: 15px; line-height: 1.6;">Gracias por unirte a NumisCloud. Tu cuenta ha sido creada correctamente.</p>
        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #C5A55A;">
          <h3 style="color: #C5A55A; margin-top: 0;">✨ Lo que puedes hacer:</h3>
          <ul style="font-size: 14px; line-height: 1.8; padding-left: 20px; color: #333;">
            <li><strong>Catalogar</strong> tus monedas, billetes y medallas</li>
            <li><strong>Chat IA</strong> - Identifica y valora piezas con inteligencia artificial (7 días gratis)</li>
            <li><strong>Foro</strong> - Conecta con otros coleccionistas</li>
            <li><strong>Comunidad</strong> - Comparte tus piezas y descubre las de otros</li>
            <li><strong>Álbumes</strong> - Organiza tu colección por categorías</li>
          </ul>
        </div>
        <p style="font-size: 14px; color: #666;">Tu prueba gratuita del Chat IA dura <strong>7 días</strong>. Después, puedes suscribirte desde <strong>€1,99/mes</strong>.</p>
        <div style="text-align: center; margin: 25px 0;">
          <a href="https://numiscloud.es/dashboard" style="display: inline-block; background: #C5A55A; color: #1A1A2E; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 15px;">Ir a mi colección →</a>
        </div>
      </div>
      <div style="background: #1A1A2E; padding: 15px 30px; text-align: center;">
        <p style="color: #C5A55A; margin: 0; font-size: 12px;">NumisCloud — Tu colección numismática en la nube</p>
      </div>
    </div>
  `;
}

/**
 * Build the subscription confirmation email HTML body.
 */
export function buildSubscriptionEmailHtml(userName: string, plan: string, periodEnd: Date): string {
  const planLabel = plan === 'annual' ? 'Anual' : 'Mensual';
  const price = plan === 'annual' ? '€14,99/año' : '€1,99/mes';
  const renewDate = periodEnd.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F5F0E8; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #1A1A2E, #2D4A3E); padding: 40px 30px; text-align: center;">
        <h1 style="color: #C5A55A; margin: 0; font-size: 28px;">👑 ¡Suscripción Activada!</h1>
        <p style="color: #F5F0E8; margin: 10px 0 0; font-size: 16px; opacity: 0.9;">NumisCloud Premium</p>
      </div>
      <div style="padding: 30px; color: #1A1A2E;">
        <h2 style="color: #2D4A3E; margin-top: 0;">¡Gracias${userName ? ', ' + userName : ''}!</h2>
        <p style="font-size: 15px; line-height: 1.6;">Tu suscripción a NumisCloud Premium ha sido activada correctamente.</p>
        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #C5A55A;">
          <h3 style="color: #C5A55A; margin-top: 0;">📋 Detalles de tu plan:</h3>
          <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #666;">Plan:</td><td style="padding: 8px 0; font-weight: bold;">${planLabel}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Precio:</td><td style="padding: 8px 0; font-weight: bold;">${price}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Próxima renovación:</td><td style="padding: 8px 0; font-weight: bold;">${renewDate}</td></tr>
          </table>
        </div>
        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #2D4A3E; margin-top: 0;">🚀 Funciones Premium desbloqueadas:</h3>
          <ul style="font-size: 14px; line-height: 1.8; padding-left: 20px; color: #333;">
            <li>Piezas ilimitadas en tu colección</li>
            <li>Chat IA numismático sin restricciones</li>
            <li>Imágenes ilimitadas por pieza</li>
            <li>Soporte prioritario</li>
          </ul>
        </div>
        <p style="font-size: 13px; color: #666;">Puedes gestionar tu suscripción desde tu perfil en cualquier momento.</p>
        <div style="text-align: center; margin: 25px 0;">
          <a href="https://numiscloud.es/suscripcion" style="display: inline-block; background: #C5A55A; color: #1A1A2E; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 15px;">Gestionar suscripción →</a>
        </div>
      </div>
      <div style="background: #1A1A2E; padding: 15px 30px; text-align: center;">
        <p style="color: #C5A55A; margin: 0; font-size: 12px;">NumisCloud — Tu colección numismática en la nube</p>
      </div>
    </div>
  `;
}
