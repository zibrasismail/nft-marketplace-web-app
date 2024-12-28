import { MarketplaceStatus } from "@/components/marketplace/marketplace-status";

export default function MintPage() {
  return (
    <div className="min-h-screen">
      <section className="py-12">
        <div className="container max-w-4xl">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent mb-4">
            Mint Your NFT
          </h1>
          <p className="text-muted-foreground mb-8">
            Create and mint your unique digital assets on the Aptos blockchain
          </p>

          <MarketplaceStatus />
        </div>
      </section>
    </div>
  );
}
