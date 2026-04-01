/** Digits for tel / WhatsApp; assumes India (+91) when 10 local digits. */
export function normalizePhoneDigits(raw: string): string | null {
  let d = raw.replace(/\D/g, '')
  if (!d) return null
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1)
  if (d.length === 10) return `91${d}`
  if (d.length >= 11 && d.length <= 15) return d
  return null
}

export function telHref(raw: string): string | null {
  const d = normalizePhoneDigits(raw)
  return d ? `tel:+${d}` : null
}

export function whatsappHref(raw: string): string | null {
  const d = normalizePhoneDigits(raw)
  return d ? `https://wa.me/${d}` : null
}
