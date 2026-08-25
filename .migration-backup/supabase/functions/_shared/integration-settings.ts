const encoder = new TextEncoder()
const decoder = new TextDecoder()

const bytesToBase64 = (bytes: Uint8Array) =>
  btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(""))

const base64ToBytes = (value: string) => {
  const decoded = atob(value)
  return Uint8Array.from(decoded, (character) => character.charCodeAt(0))
}

async function encryptionKey() {
  const rawKey = Deno.env.get("SETTINGS_ENCRYPTION_KEY")
  if (!rawKey) throw new Error("Secure settings storage is not configured")

  const raw = base64ToBytes(rawKey)
  if (raw.byteLength !== 32) throw new Error("Secure settings storage key is invalid")

  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"])
}

export async function encryptSetting(value: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    await encryptionKey(),
    encoder.encode(value)
  )
  return `v1:${bytesToBase64(iv)}:${bytesToBase64(new Uint8Array(encrypted))}`
}

export async function decryptSetting(value: string) {
  const [version, encodedIv, encodedPayload] = value.split(":")
  if (version !== "v1" || !encodedIv || !encodedPayload) {
    throw new Error("Stored integration setting has an invalid format")
  }

  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBytes(encodedIv) },
    await encryptionKey(),
    base64ToBytes(encodedPayload)
  )
  return decoder.decode(plaintext)
}

/**
 * Returns a provider setting from the encrypted database store. Values never
 * reach the browser; this helper is only used by trusted Edge Functions.
 */
export async function getIntegrationSetting(admin: any, settingKey: string) {
  const { data, error } = await admin
    .from("integration_settings")
    .select("encrypted_value")
    .eq("setting_key", settingKey)
    .maybeSingle()

  if (error) throw new Error(`Could not load ${settingKey}: ${error.message}`)
  if (!data?.encrypted_value) return null
  return decryptSetting(data.encrypted_value)
}
