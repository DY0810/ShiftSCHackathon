import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const apiKey = process.env.API_SECRET_KEY;

  // Fail closed: if API_SECRET_KEY is not configured, block all API requests
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 }
    );
  }

  // Allow requests that provide the correct API key (external/programmatic callers)
  const provided = request.headers.get("x-api-key");
  if (provided === apiKey) {
    return NextResponse.next();
  }

  // Allow same-origin browser requests (Referer or Origin matches our host)
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");

  if (host) {
    const allowedOrigin = `https://${host}`;
    const allowedOriginHttp = `http://${host}`; // for local dev

    if (
      origin === allowedOrigin ||
      origin === allowedOriginHttp ||
      referer?.startsWith(allowedOrigin) ||
      referer?.startsWith(allowedOriginHttp)
    ) {
      return NextResponse.next();
    }
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export const config = {
  matcher: "/api/:path*",
};
