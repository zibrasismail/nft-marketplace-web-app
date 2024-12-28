"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useEffect } from "react";
import Cookies from "js-cookie";
import { usePathname, useRouter } from "next/navigation";

// Protected routes that require wallet connection
const protectedRoutes = ["/stats", "/mint", "/donate"];

export function useWalletConnection() {
  const { connected } = useWallet();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (connected) {
      // Set cookie when wallet is connected
      Cookies.set("wallet-connected", "true", {
        secure: true,
        sameSite: "strict",
      });
    } else {
      // Remove cookie when wallet is disconnected
      Cookies.remove("wallet-connected");

      // Check if current path is protected
      if (protectedRoutes.some((route) => pathname.startsWith(route))) {
        // Redirect to home page
        router.push("/");
      }
    }
  }, [connected, pathname, router]);

  return { connected };
}
