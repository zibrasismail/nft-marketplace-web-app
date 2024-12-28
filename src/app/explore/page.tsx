"use client";

import {
  formatPrice,
  getRarityLabel,
  RARITY_COLORS,
} from "@/components/nft/user-nfts";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
}

export default function ExplorePage() {
  const { account } = useWallet();
  const { toast } = useToast();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRarity, setSelectedRarity] = useState("all");
  const [selectedNft, setSelectedNft] = useState<NFT | null>(null);

  const fetchNFTs = useCallback(async () => {
    try {
      setIsLoading(true);

      const payload: InputViewFunctionData = {
        function: `${MARKETPLACE_ADDRESS}::${CONTRACT_NAME}::get_all_nfts_for_sale`,
        functionArguments: [],
        typeArguments: [],
      };

      const response = await aptos.view({ payload });

      if (!response || !Array.isArray(response[0])) {
        setNfts([]);
        return;
      }

      const hexToString = (hex: string): string => {
        if (!hex || typeof hex !== "string") {
          console.warn("Invalid hex string:", hex);
          return "";
        }
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

      // Filter NFTs based on rarity if selected
      const filteredNFTs = processedNFTs.filter(
        (nft) =>
          selectedRarity === "all" || Number(selectedRarity) === nft.rarity
      );

      setNfts(filteredNFTs);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      toast({
        variant: "destructive",
        title: "Error Loading NFTs",
        description: "Failed to load NFTs. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedRarity, toast]);

  useEffect(() => {
    fetchNFTs();
  }, [fetchNFTs]);

  const handleBuyClick = (nft: NFT) => {
    setSelectedNft(nft);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedNft || !account) return;

    try {
      const payload = {
        function: `${MARKETPLACE_ADDRESS}::${CONTRACT_NAME}::purchase_nft`,
        type_arguments: [],
        arguments: [selectedNft.owner, selectedNft.id.toString()],
      };

      // @ts-expect-error window is not typed
      const response = await window.aptos.signAndSubmitTransaction(payload);
      await aptos.waitForTransaction({ transactionHash: response.hash });

      toast({
        title: "NFT Purchased",
        description: `You have successfully purchased the NFT for ${formatPrice(
          selectedNft.price
        )} APT`,
      });

      setSelectedNft(null);
      fetchNFTs();
    } catch (error) {
      console.error("Error purchasing NFT:", error);
      toast({
        variant: "destructive",
        title: "Error Purchasing NFT",
        description: "Failed to purchase NFT. Please try again.",
      });
    }
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Explore NFTs</h1>
        <Select value={selectedRarity} onValueChange={setSelectedRarity}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Rarity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Rarities</SelectItem>
            <SelectItem value="1">Common</SelectItem>
            <SelectItem value="2">Uncommon</SelectItem>
            <SelectItem value="3">Rare</SelectItem>
            <SelectItem value="4">Epic</SelectItem>
            <SelectItem value="5">Legendary</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : nfts.length === 0 ? (
        <Card>
          <CardHeader className="text-center">
            <CardTitle>No NFTs Found</CardTitle>
            <CardDescription>
              {selectedRarity === "all"
                ? "No NFTs are currently listed for sale"
                : `No ${getRarityLabel(
                    Number(selectedRarity)
                  )} NFTs are currently listed for sale`}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nfts.map((nft) => (
            <Card key={nft.id} className="overflow-hidden">
              <div className="aspect-square relative">
                <Image
                  src={nft.uri}
                  alt={nft.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  onError={(e) => {
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
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span
                      className={`font-medium ${RARITY_COLORS[nft.rarity]}`}
                    >
                      {getRarityLabel(nft.rarity)}
                    </span>
                    <span className="text-lg font-semibold">
                      {formatPrice(nft.price)} APT
                    </span>
                  </div>
                  {account && account.address !== nft.owner && (
                    <Button
                      className="w-full"
                      onClick={() => handleBuyClick(nft)}
                    >
                      Buy Now
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedNft} onOpenChange={() => setSelectedNft(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogDescription>
              Are you sure you want to purchase this NFT?
            </DialogDescription>
          </DialogHeader>
          {selectedNft && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Price:</span>
                <span className="text-lg font-semibold">
                  {formatPrice(selectedNft.price)} APT
                </span>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedNft(null)}>
                  Cancel
                </Button>
                <Button onClick={handleConfirmPurchase}>
                  Confirm Purchase
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
