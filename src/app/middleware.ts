import { NextRequest, NextResponse } from "next/server";

const isWalletConnected = async (request: NextRequest) => {
  const sessionToken = request.cookies.get("aptosSession")?.value;
  return sessionToken !== undefined;
};

export function middleware(request: NextRequest) {
  const protectedRoutes = [
    "/explore",
    "/mint",
    "/stats",
    "/purchased",
    "/donate",
  ];

  if (
    protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))
  ) {
    if (!isWalletConnected(request)) {
      return NextResponse.redirect(new URL("/connect-wallet", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/explore",
    "/explore/:path*",
    "/mint/:path*",
    "/stats/:path*",
    "/purchased/:path*",
    "/donate/:path*",
  ],
};
