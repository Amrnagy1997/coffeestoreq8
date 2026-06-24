import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuth = !!token;
  const isAdminPage = req.nextUrl.pathname.startsWith("/admin");
  const isProtectedPage =
    req.nextUrl.pathname.startsWith("/profile") ||
    req.nextUrl.pathname.startsWith("/checkout");

  if (isAdminPage) {
    if (!isAuth) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if ((token as any)?.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (isProtectedPage && !isAuth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*", "/checkout/:path*"],
};
