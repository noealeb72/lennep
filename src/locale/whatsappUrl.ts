/** Número WhatsApp (Chile +56 9 … sin + ni espacios). */
export const WHATSAPP_PHONE_E164 = '56936241165'

export function whatsappConversationUrl(message: string): string {
  const q = encodeURIComponent(message)
  return `https://wa.me/${WHATSAPP_PHONE_E164}?text=${q}`
}

/** Plantilla con `{specialty}` (nombre de la especialidad). */
export function whatsappSpecialtyInquiryUrl(specialty: string, messageTemplate: string): string {
  return whatsappConversationUrl(messageTemplate.replaceAll('{specialty}', specialty))
}
