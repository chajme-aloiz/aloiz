// GET /api/push/key: veřejný klíč, se kterým prohlížeč zaregistruje upozornění.
export const dynamic = "force-dynamic";
export function GET() {
  return Response.json({ key: process.env.VAPID_PUBLIC_KEY || "" });
}
