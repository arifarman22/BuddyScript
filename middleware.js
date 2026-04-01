import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/feed") && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if ((pathname === "/login" || pathname === "/register") && token) {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL(token ? "/feed" : "/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/feed", "/login", "/register"],
};
