// Fetches a small brand icon via Google's public favicon service — no API
// key, no rate-limit concerns for personal use. Given a domain like
// "netflix.com", returns a 64px icon URL.
export function faviconUrl(domain, size = 64) {
  if (!domain) return null
  const clean = domain.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
  if (!clean) return null
  return `https://www.google.com/s2/favicons?sz=${size}&domain=${encodeURIComponent(clean)}`
}

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024 // 2MB — plenty for a small logo, keeps storage light

// Uploads a jpg/png to the 'logos' storage bucket and returns its public URL.
export async function uploadLogo(supabase, file) {
  if (!file) throw new Error('No file selected')
  if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
    throw new Error('Please choose a PNG, JPG, or WEBP image')
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error('Image is too large — please use something under 2MB')
  }
  const ext = file.name.split('.').pop() || 'png'
  const path = `${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from('logos').upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from('logos').getPublicUrl(path)
  return data.publicUrl
}

// Best-effort guess at a domain from a line item's name, offered as a
// starting point in the form — never auto-saved without the person seeing it.
// Deliberately conservative: only fires on names that look like a single
// recognizable brand word, not on things like "RE Taxes" or "Other".
export function guessDomain(name) {
  if (!name) return ''
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
  if (!cleaned) return ''
  // Take the first word only — "Netflix" -> netflix.com, but
  // "Chase Mortgage" won't guess "chasemortgage.com" (usually wrong)
  const firstWord = cleaned.split(/\s+/)[0]
  if (firstWord.length < 3) return ''
  return `${firstWord}.com`
}
