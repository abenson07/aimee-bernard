import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

export default async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const isAuthenticated = await verifySessionToken(token);
  const isLoginRoute = request.nextUrl.pathname === "/login";

  if (!isAuthenticated && !isLoginRoute) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  // The Site editor is home: signing in, and the bare address, land there.
  if (isAuthenticated && (isLoginRoute || request.nextUrl.pathname === "/")) {
    return NextResponse.redirect(new URL("/site", request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
