export async function GET() {
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`)
  return Response.json({ ok: true })
}