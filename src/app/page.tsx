import { Button } from "@/components/ui/button";
import { PetraWalletSelector } from "@/components/wallet/walletSelection";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                Discover, Collect & Sell NFTs
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
                The world&apos;s largest digital marketplace for crypto
                collectibles and non-fungible tokens.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link href="/explore">
                  <Button className="w-full sm:w-auto text-lg bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600">
                    Explore NFTs
                  </Button>
                </Link>
                <Link href="/mint">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto text-lg"
                  >
                    Create NFT
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="grid grid-cols-2 gap-4 animate-float">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-2xl overflow-hidden border-2 border-border/40 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20"
                  >
                    <Image
                      src={`/nft-${i}.jpg`}
                      alt={`Featured NFT ${i}`}
                      fill
                      className="object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted/40 border-t border-border/40">
        <div className="container py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              Ready to Start Your NFT Journey?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of artists and collectors in the world&apos;s most
              vibrant NFT marketplace.
            </p>
            <PetraWalletSelector />
          </div>
        </div>
      </section>
    </>
  );
}
