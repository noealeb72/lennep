/** Número WhatsApp (Chile +56 9 … sin + ni espacios). */
export const WHATSAPP_PHONE_E164 = '56936241165'

export function whatsappConversationUrl(message: string): string {
  const q = encodeURIComponent(message)
  return `https://wa.me/${WHATSAPP_PHONE_E164}?text=${q}`
}
