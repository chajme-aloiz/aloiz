// Záloha pro sdílení, když service worker ještě neběží: jen otevře aplikaci.
export function POST(req: Request) {
  return Response.redirect(new URL("/?share=1", req.url), 303);
}
export function GET(req: Request) {
  return Response.redirect(new URL("/", req.url), 303);
}
