import { useState, type ChangeEvent, type FormEvent } from 'react'
import { submitContactToInbox, type ContactFormPayload } from '../../../src/locale/contactFormSubmit'

type FormState = {
  nombre: string
  institucion: string
  email: string
  telefono: string
  mensaje: string
  honeypot: string
}

type SubmitState = 'idle' | 'loading' | 'success' | 'error'

const RATE_LIMIT_KEY = 'contact-form-rate-limit'
const RATE_LIMIT_MAX = 3
const RATE_LIMIT_WINDOW = 3600000 // 1 hora en ms

function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>"']/g, '') // Elimina caracteres peligrosos
    .substring(0, 500) // Limita longitud
}

function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email) && email.length <= 255
}

function checkRateLimit(): boolean {
  const stored = localStorage.getItem(RATE_LIMIT_KEY)
  if (!stored) return true
  const timestamps = JSON.parse(stored) as number[]
  const now = Date.now()
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW)
  if (recent.length >= RATE_LIMIT_MAX) return false
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify([...recent, now]))
  return true
}

export function ContactSection() {
  const [form, setForm] = useState<FormState>({
    nombre: '',
    institucion: '',
    email: '',
    telefono: '',
    mensaje: '',
    honeypot: '',
  })
  const [state, setState] = useState<SubmitState>('idle')
  const [error, setError] = useState('')

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setError('')
    const { name, value } = e.target
    if (name === 'honeypot') {
      setForm((p) => ({ ...p, [name]: value }))
      return // No sanitizar honeypot
    }
    setForm((p) => ({ ...p, [name]: sanitizeInput(value) }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setState('loading')
    setError('')

    // Validar honeypot (anti-spam)
    if (form.honeypot) {
      setState('idle')
      return
    }

    // Validaciones
    if (!form.nombre || form.nombre.length < 2) {
      setError('Nombre requerido (mínimo 2 caracteres)')
      setState('idle')
      return
    }
    if (!form.email || !validateEmail(form.email)) {
      setError('Email inválido')
      setState('idle')
      return
    }
    if (!form.mensaje || form.mensaje.length < 10) {
      setError('Mensaje requerido (mínimo 10 caracteres)')
      setState('idle')
      return
    }

    // Rate limiting
    if (!checkRateLimit()) {
      setError('Límite de envíos excedido. Intenta en 1 hora.')
      setState('error')
      return
    }

    // Enviar
    const payload: ContactFormPayload = {
      nombre: form.nombre,
      institucion: form.institucion || 'No especificada',
      email: form.email,
      telefono: form.telefono || 'No especificado',
      mensaje: form.mensaje,
    }

    const success = await submitContactToInbox(payload, 'Nuevo contacto')
    if (success) {
      setState('success')
      setForm({ nombre: '', institucion: '', email: '', telefono: '', mensaje: '', honeypot: '' })
      setTimeout(() => setState('idle'), 3000)
    } else {
      setError('Error al enviar. Intenta nuevamente.')
      setState('error')
    }
  }

  return (
    <section id="contacto" className="content-section">
      <h2>Contacto</h2>
      <p className="section-intro">
        Estamos disponibles para resolver tus dudas y coordinar cobertura para tu institución.
      </p>

      <div className="section-grid section-grid--two">
        <div className="info-card">
          <h3>Canales de contacto</h3>
          <p>Email: contacto@lennepgroup.com</p>
          <p>WhatsApp: +56 9 3624 1165</p>
        </div>
        <form className="contact-form" onSubmit={handleSubmit}>
          <label>
            Nombre completo *
            <input
              type="text"
              name="nombre"
              placeholder="Tu nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              minLength={2}
            />
          </label>
          <label>
            Email *
            <input
              type="email"
              name="email"
              placeholder="tu@email.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Institución
            <input
              type="text"
              name="institucion"
              placeholder="Nombre de la institución"
              value={form.institucion}
              onChange={handleChange}
            />
          </label>
          <label>
            Teléfono
            <input
              type="tel"
              name="telefono"
              placeholder="+56 9 XXXX XXXX"
              value={form.telefono}
              onChange={handleChange}
            />
          </label>
          <label>
            Mensaje *
            <textarea
              rows={4}
              name="mensaje"
              placeholder="Contanos sobre tus necesidades..."
              value={form.mensaje}
              onChange={handleChange}
              required
              minLength={10}
            />
          </label>
          {/* Honeypot: campo oculto para detectar bots */}
          <input
            type="text"
            name="honeypot"
            value={form.honeypot}
            onChange={handleChange}
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete="off"
          />
          {error && <p style={{ color: '#d32f2f', fontSize: '0.9em' }}>{error}</p>}
          {state === 'success' && (
            <p style={{ color: '#388e3c', fontSize: '0.9em' }}>✓ Mensaje enviado correctamente</p>
          )}
          <button type="submit" disabled={state === 'loading'}>
            {state === 'loading' ? 'Enviando...' : 'Enviar mensaje'}
          </button>
        </form>
      </div>
    </section>
  )
}
