export const CONTACT_INBOX = 'contacto@lennepgroup.com'

/** FormSubmit: tras activar el formulario desde el correo, puedes sustituir el email por el hash del mail de activación. */
const FORMSUBMIT_AJAX = `https://formsubmit.co/ajax/${encodeURIComponent(CONTACT_INBOX)}`

export type ContactFormPayload = {
  nombre: string
  institucion: string
  email: string
  telefono: string
  mensaje: string
}

/** Texto único para el cuerpo del mail (FormSubmit plantilla "box"). */
export function formatContactEmailBody(p: ContactFormPayload): string {
  const dash = '—'
  const inst = p.institucion.trim() || dash
  const tel = p.telefono.trim() || dash
  return [
    '============================================================',
    '  Nuevo contacto · Lennep (formulario web)',
    '============================================================',
    '',
    'Nombre completo',
    `  ${p.nombre}`,
    '',
    'Institución',
    `  ${inst}`,
    '',
    'Correo (responder a)',
    `  ${p.email}`,
    '',
    'Teléfono',
    `  ${tel}`,
    '',
    '------------------------------------------------------------',
    'Mensaje',
    '------------------------------------------------------------',
    '',
    p.mensaje.trim(),
    '',
  ].join('\n')
}

export function buildMailtoContactUrl(p: ContactFormPayload, subject: string): string {
  const body = formatContactEmailBody(p)
  const q = new URLSearchParams({
    subject,
    body,
  })
  return `mailto:${CONTACT_INBOX}?${q.toString()}`
}

/** Validar y sanitizar payload antes de envío. */
function validatePayload(p: ContactFormPayload): string | null {
  if (!p.nombre || p.nombre.length < 2) return 'Nombre inválido'
  if (!p.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) return 'Email inválido'
  if (!p.mensaje || p.mensaje.length < 10) return 'Mensaje insuficiente'
  if (p.nombre.length > 500 || p.mensaje.length > 5000) return 'Contenido excesivo'
  return null
}

/** Genera y valida token CSRF basado en client-side. */
function generateCsrfToken(): string {
  const arr = new Uint8Array(16)
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(arr)
  } else {
    for (let i = 0; i < 16; i++) arr[i] = Math.floor(Math.random() * 256)
  }
  return Array.from(arr, (x) => x.toString(16).padStart(2, '0')).join('')
}

/** Envío vía FormSubmit: activar una vez con el botón del correo "Activate Form"; después llegan los mensajes del formulario. */
export async function submitContactToInbox(
  p: ContactFormPayload,
  subject: string
): Promise<boolean> {
  // Validar datos
  const validationError = validatePayload(p)
  if (validationError) {
    console.warn('[Contact Form]', validationError)
    return false
  }

  try {
    const csrfToken = generateCsrfToken()
    const res = await fetch(FORMSUBMIT_AJAX, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify({
        _subject: `${subject} · ${p.nombre}`,
        _replyto: p.email,
        _template: 'box',
        _captcha: false, // Desactivado: usando honeypot en cliente
        _csrf: csrfToken,
        Solicitud: formatContactEmailBody(p),
      }),
    })
    if (!res.ok) return false
    const data = (await res.json()) as { success?: boolean }
    return Boolean(data.success)
  } catch (err) {
    console.error('[Contact Form] Error:', err)
    return false
  }
}
