import { supabase } from "@/lib/supabase"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

export async function scrapeSingle(url: string, throttle: number, format: string) {
    const res = await fetch(`${BASE_URL}/scrape`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, throttle, format })
    })
    return res.json()
}

export async function scrapeBulk(urls: string[], throttle: number, format: string) {
    const res = await fetch(`${BASE_URL}/scrape/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls, throttle, format })
    })
    return res.json()
}

export async function deleteJob(jobId: string) {
  const { error } = await supabase
    .from("jobs")
    .delete()
    .eq("id", jobId)
  return !error
}