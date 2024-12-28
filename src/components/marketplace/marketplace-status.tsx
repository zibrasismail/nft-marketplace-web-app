"use client";

import { MintForm } from "@/components/mint/mint-form";
import { UserNFTs } from "@/components/nft/user-nfts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState } from "react";

export function MarketplaceStatus() {
  const { account } = useWallet();
  const [shouldRefreshNFTs, setShouldRefreshNFTs] = useState(0);

  const handleMintSuccess = () => {
    setShouldRefreshNFTs((prev) => prev + 1);
  };

  if (!account) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>NFT Marketplace</CardTitle>
          <CardDescription>
            Please connect your wallet to mint and trade NFTs
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Mint NFT</CardTitle>
          <CardDescription>Create a new NFT in the marketplace</CardDescription>
        </CardHeader>
        <CardContent>
          <MintForm onMintSuccess={handleMintSuccess} />
        </CardContent>
      </Card>

      <UserNFTs key={shouldRefreshNFTs} />
    </div>
  );
}
