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

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g
const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/

/** Quita caracteres de control; no interpreta HTML (React ya escapa en pantalla). */
export function sanitizeContactPayload(raw: ContactFormPayload): ContactFormPayload {
  const strip = (value: string) => value.replace(CONTROL_CHARS, '')
  return {
    nombre: strip(raw.nombre).trim().replace(/\s+/g, ' '),
    institucion: strip(raw.institucion).trim(),
    email: strip(raw.email).trim().toLowerCase(),
    telefono: strip(raw.telefono).replace(/\D/g, ''),
    mensaje: strip(raw.mensaje).trim(),
  }
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

/** Validar payload ya sanitizado antes de envío. */
export function validateContactPayload(p: ContactFormPayload): string | null {
  if (!p.nombre || p.nombre.length < 2 || p.nombre.length > 120) return 'Nombre inválido'
  if (p.institucion.length > 200) return 'Institución demasiado larga'
  if (!p.email || !EMAIL_RE.test(p.email) || p.email.length > 254) return 'Email inválido'
  if (!p.telefono || !/^[0-9]{8,15}$/.test(p.telefono)) return 'Teléfono inválido'
  if (!p.mensaje || p.mensaje.length < 10 || p.mensaje.length > 5000) return 'Mensaje inválido'
  return null
}

export function isSafeMailtoHref(href: string): boolean {
  return href.startsWith(`mailto:${CONTACT_INBOX}?`)
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
  const payload = sanitizeContactPayload(p)
  if (validateContactPayload(payload)) {
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
        _subject: `${subject} · ${payload.nombre}`,
        _replyto: payload.email,
        _template: 'box',
        _captcha: false,
        _csrf: csrfToken,
        Solicitud: formatContactEmailBody(payload),
      }),
    })
    if (!res.ok) return false
    const data = (await res.json()) as { success?: boolean }
    return Boolean(data.success)
  } catch {
    return false
  }
}
