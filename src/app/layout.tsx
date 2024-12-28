import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { AutoConnectProvider } from "@/components/wallet/autoConnectProvider";
import { WalletProvider } from "@/components/wallet/walletProvider";
import { Toaster } from "@/components/ui/toaster";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NFT Marketplace",
  description: "A modern NFT marketplace platform",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-background`}
      >
        <AutoConnectProvider>
          <WalletProvider>
            <Navbar />
            <main className="flex-1 p-4 pt-24 pb-12 md:pt-28 md:pb-16">
              {children}
            </main>
            <footer className="border-t p-4 border-border/40 py-6 bg-background/95">
              <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  © 2024 NFT Marketplace. All rights reserved.
                </div>
                <div className="flex gap-6">
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Terms
                  </a>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Privacy
                  </a>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Contact
                  </a>
                </div>
              </div>
            </footer>
          </WalletProvider>
          <Toaster />
        </AutoConnectProvider>
      </body>
    </html>
  );
}
