import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

const rateLimit = new Map<string, number>();

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const now = Date.now();
  const lastRequest = rateLimit.get(clientAddress) || 0;
  if (now - lastRequest < 60_000) {
    return new Response(
      JSON.stringify({ success: false, error: 'Por favor espera un momento antes de enviar otro mensaje.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }
  rateLimit.set(clientAddress, now);

  try {
    const body = await request.json();
    const { name, email, message, university } = body;

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ success: false, error: 'Nombre, email y mensaje son requeridos.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email inválido.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = import.meta.env.RESEND_API_KEY;
    const contactEmail = import.meta.env.CONTACT_EMAIL || 'contacto@mcu.org';

    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'El servicio de correo no está configurado. Contáctanos por WhatsApp.' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const resend = new Resend(apiKey);

    await resend.emails.send({
      from: 'MCU Website <noreply@mcu.org>',
      to: contactEmail,
      replyTo: email,
      subject: `Nuevo mensaje de ${name} — MCU Website`,
      html: `
        <h2>Nuevo mensaje desde el sitio web de MCU</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Universidad:</strong> ${university || 'No especificada'}</p>
        <hr />
        <p><strong>Mensaje:</strong></p>
        <p>${message.replace(/\n/g, '<br />')}</p>
      `,
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Error interno. Intenta de nuevo más tarde.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
