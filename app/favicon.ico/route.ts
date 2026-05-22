import { NextResponse } from "next/server";

export const runtime = "edge";

export function GET(request: Request) {
  const url = new URL(request.url);
  url.pathname = "/icon/horus.png";
  url.search = "";
  return NextResponse.redirect(url, 308);
}

export function HEAD(request: Request) {
  return GET(request);
}
