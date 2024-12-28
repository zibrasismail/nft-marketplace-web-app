"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { aptos } from "@/config/aptosConfig";
import { CONTRACT_NAME, MARKETPLACE_ADDRESS } from "@/config/constants";
import { useToast } from "@/hooks/use-toast";
import { InputViewFunctionData } from "@aptos-labs/ts-sdk";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

interface NFT {
  id: number;
  owner: string;
  minter: string;
  name: string;
  description: string;
  uri: string;
  price: number;
  for_sale: boolean;
  rarity: number;
  mint_time: number;
}

export const RARITY_LABELS: { [key: number]: string } = {
  1: "Common",
  2: "Uncommon",
  3: "Rare",
  4: "Epic",
  5: "Legendary",
};

export const getRarityLabel = (rarity: number): string => {
  return RARITY_LABELS[rarity] || `Unknown (${rarity})`;
};

export const RARITY_COLORS: { [key: number]: string } = {
  1: "text-gray-500",
  2: "text-green-500",
  3: "text-blue-500",
  4: "text-purple-500",
  5: "text-yellow-500",
};

interface SaleModalProps {
  nft: NFT;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (price: string) => Promise<void>;
}

function SaleModal({ isOpen, onClose, onConfirm }: SaleModalProps) {
  const [price, setPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!price) return;

    setIsSubmitting(true);
    try {
      await onConfirm(price);
      setPrice("");
      onClose();
    } catch (error) {
      console.error("Error in sale modal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>List NFT for Sale</DialogTitle>
          <DialogDescription>Set a price for your NFT in APT</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="price" className="text-sm font-medium">
              Price (APT)
            </label>
            <Input
              id="price"
              type="number"
              step="0.1"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price in APT"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Listing...
                </>
              ) : (
                "List for Sale"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export const formatPrice = (price: number): string => {
  return price.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8,
  });
};

export function UserNFTs() {
  const { account } = useWallet();
  const { toast } = useToast();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNft, setSelectedNft] = useState<NFT | null>(null);

  const fetchUserNFTs = useCallback(async () => {
    if (!account?.address) {
      console.log("No wallet address found, skipping NFT fetch");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const payload: InputViewFunctionData = {
        function: `${MARKETPLACE_ADDRESS}::${CONTRACT_NAME}::get_user_nfts`,
        functionArguments: [account.address],
        typeArguments: [],
      };

      const response = await aptos.view({ payload });

      if (!response || !Array.isArray(response[0])) {
        setNfts([]);
        return;
      }

      const hexToString = (hex: string): string => {
        if (!hex || typeof hex !== "string") return "";
        hex = hex.startsWith("0x") ? hex.slice(2) : hex;
        let str = "";
        for (let i = 0; i < hex.length; i += 2) {
          str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }
        return str;
      };

      /* eslint-disable @typescript-eslint/no-explicit-any */
      const processedNFTs = response[0].map((nft: any) => ({
        id: Number(nft.id),
        owner: nft.owner,
        minter: nft.minter,
        name: hexToString(nft.name),
        description: hexToString(nft.description),
        uri: hexToString(nft.uri),
        price: Number(nft.price) / 100000000,
        for_sale: nft.for_sale,
        rarity: Number(nft.rarity),
      }));

      setNfts(processedNFTs as NFT[]);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      toast({
        variant: "destructive",
        title: "Error Loading NFTs",
        description: "Failed to load your NFTs. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [account?.address, toast]);

  useEffect(() => {
    if (account?.address) {
      fetchUserNFTs();
    }
  }, [account?.address, fetchUserNFTs]);

  const handleSaleClick = (nft: NFT) => {
    setSelectedNft(nft);
  };

  const handleListForSale = async (price: string) => {
    if (!selectedNft || !account) return;

    try {
      const priceInOctas = Math.floor(parseFloat(price) * 100000000);

      const payload = {
        function: `${MARKETPLACE_ADDRESS}::${CONTRACT_NAME}::list_for_sale`,
        type_arguments: [],
        arguments: [selectedNft.id.toString(), priceInOctas.toString()],
      };

      const response = await (window as any).aptos.signAndSubmitTransaction(
        payload
      );
      await aptos.waitForTransaction({ transactionHash: response.hash });

      toast({
        title: "NFT Listed",
        description: `Your NFT has been listed for ${price} APT`,
      });

      fetchUserNFTs();
    } catch (error) {
      console.error("Error listing NFT for sale:", error);
      toast({
        variant: "destructive",
        title: "Error Listing NFT",
        description: "Failed to list NFT for sale. Please try again.",
      });
    }
  };

  if (!account) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Your Minted NFTs</CardTitle>
          <CardDescription>
            Please connect your wallet to view your NFTs
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="mt-8 border-red-200 bg-red-50/50">
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading NFTs</CardTitle>
          <CardDescription className="text-red-600">
            {error}. Please try again later.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (nfts.length === 0) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Your Minted NFTs</CardTitle>
          <CardDescription>
            You have no available NFTs to list. Your minted NFTs will appear
            here until they are listed or sold.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Your Minted NFTs</CardTitle>
        <CardDescription>
          NFTs you&apos;ve created that are available to list for sale
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nfts.map((nft) => (
            <Card key={nft.id} className="overflow-hidden">
              <div className="aspect-square relative">
                <Image
                  src={nft.uri}
                  alt={nft.name}
                  width={400}
                  height={400}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    console.log(`Failed to load image for NFT: ${nft.id}`);
                    e.currentTarget.src = "/placeholder-image.png";
                  }}
                />
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{nft.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {nft.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span
                      className={`font-medium ${RARITY_COLORS[nft.rarity]}`}
                    >
                      Rarity: {getRarityLabel(nft.rarity)}
                    </span>
                    <span className="text-muted-foreground">
                      {nft.for_sale
                        ? `Price: ${formatPrice(nft.price)} APT`
                        : "Not for sale"}
                    </span>
                  </div>
                  {!nft.for_sale && (
                    <Button
                      className="w-full"
                      onClick={() => handleSaleClick(nft)}
                    >
                      List for Sale
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>

      <SaleModal
        nft={selectedNft!}
        isOpen={!!selectedNft}
        onClose={() => setSelectedNft(null)}
        onConfirm={handleListForSale}
      />
    </Card>
  );
}
