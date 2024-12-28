import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protected routes that require wallet connection
const protectedRoutes = [
  "/stats",
  "/mint",
  "/donate",
  "/explore",
  "/purchased",
];

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const { pathname } = request.nextUrl;

  // Check if the pathname is in protectedRoutes
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    // Get the wallet connection state from cookies
    const isWalletConnected =
      request.cookies.get("wallet-connected")?.value === "true";

    // If wallet is not connected, redirect to home page
    if (!isWalletConnected) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    "/stats/:path*",
    "/mint/:path*",
    "/donate/:path*",
    "/explore/:path*",
    "/purchased/:path*",
  ],
};
