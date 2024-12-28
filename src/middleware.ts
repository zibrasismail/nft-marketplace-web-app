import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const { pathname } = request.nextUrl;

  // Only protect the /mint route for now to debug the issue
  if (pathname.startsWith("/mint")) {
    const walletCookie = request.cookies.get("wallet-connected");
    const isWalletConnected = walletCookie?.value === "true";

    // Log cookie state (will appear in server logs)
    console.log("Wallet Cookie:", walletCookie);
    console.log("Is Wallet Connected:", isWalletConnected);

    if (!isWalletConnected) {
      // Add a response header for debugging
      const response = NextResponse.redirect(new URL("/", request.url));
      response.headers.set("X-Redirect-Reason", "Wallet not connected");
      return response;
    }
  }

  return NextResponse.next();
}

// Update matcher to be more specific
export const config = {
  matcher: [
    "/mint/:path*",
    "/purchased/:path*",
    "/donate/:path*",
    "/stats/:path*",
    "/explore/:path*",
  ],
};
