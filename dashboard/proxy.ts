import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

export default async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const isAuthenticated = await verifySessionToken(token);
  const isLoginRoute = request.nextUrl.pathname === "/login";

  /* clone() + pathname keeps the configured basePath on the redirect; building
     a bare `new URL("/login", …)` would drop it. */
  const redirectTo = (pathname: string) => {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    return NextResponse.redirect(url);
  };

  if (!isAuthenticated && !isLoginRoute) {
    return redirectTo("/login");
  }

  if (isAuthenticated && isLoginRoute) {
    return redirectTo("/");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
