"use client";
import { PetraWalletSelector } from "@/components/wallet/walletSelection";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { connected } = useWalletConnection();

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle menu item click
  const handleMenuItemClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between">
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center gap-4">
          <div className="relative w-16 h-16 transition-transform hover:scale-105">
            <Image
              src="/logoBg.png"
              alt="NFT Marketplace"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent hover:from-purple-700 hover:to-blue-600 transition-colors">
            NFT Marketplace
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/explore"
            className="text-sm font-medium transition-colors hover:text-primary relative group"
          >
            Explore
            <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform"></span>
          </Link>

          {connected && (
            <>
              <Link
                href="/stats"
                className="text-sm font-medium transition-colors hover:text-primary relative group"
              >
                Stats
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform"></span>
              </Link>
              <Link
                href="/mint"
                className="text-sm font-medium transition-colors hover:text-primary relative group"
              >
                Mint
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform"></span>
              </Link>
              <Link
                href="/purchased"
                className="text-sm font-medium transition-colors hover:text-primary relative group"
              >
                Purchased NFTs
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform"></span>
              </Link>
              <Link
                href="/donate"
                className="text-sm font-medium transition-colors hover:text-primary relative group"
              >
                Donate
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform"></span>
              </Link>
            </>
          )}

          <PetraWalletSelector />
        </div>

        {/* Mobile Menu Button */}
        <button
          ref={buttonRef}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        ref={menuRef}
        className={`md:hidden ${
          isMenuOpen ? "block" : "hidden"
        } border-t border-border/40`}
      >
        <div className="container py-4 space-y-4">
          <Link
            href="/explore"
            className="block px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            onClick={handleMenuItemClick}
          >
            Explore
          </Link>

          {connected && (
            <>
              <Link
                href="/stats"
                className="block px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                onClick={handleMenuItemClick}
              >
                Stats
              </Link>
              <Link
                href="/mint"
                className="block px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                onClick={handleMenuItemClick}
              >
                Mint
              </Link>
              <Link
                href="/purchased"
                className="text-sm font-medium transition-colors hover:text-primary relative group"
              >
                Purchased NFTs
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform"></span>
              </Link>
              <Link
                href="/donate"
                className="block px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                onClick={handleMenuItemClick}
              >
                Donate
              </Link>
            </>
          )}

          <div className="px-4">
            <PetraWalletSelector />
          </div>
        </div>
      </div>
    </nav>
  );
}
