import Cookies from "js-cookie"
import { supabase } from "@/lib/supabase"

export const KEY_COOKIE = "phantom_key"

export function getKey(): string | undefined {
  return Cookies.get(KEY_COOKIE)
}

export function saveKey(key: string) {
  Cookies.set(KEY_COOKIE, key, { expires: 365 })
}

export function generateKey(): string {
  return crypto.randomUUID()
}

export function downloadKey(key: string) {
  const blob = new Blob(
    [`Your PhantomScrape key:\n\n${key}\n\nKeep this safe.`],
    { type: "text/plain" }
  )
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "phantomscrape-key.txt"
  a.click()
  URL.revokeObjectURL(url)
}

export async function registerKey(key: string) {
  await supabase.from("keys").insert({ key })
}

export async function verifyKey(key: string): Promise<boolean> {
  const { data } = await supabase
    .from("keys")
    .select("key")
    .eq("key", key)
    .single()
  return !!data
}