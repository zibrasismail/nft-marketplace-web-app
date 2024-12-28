"use client";

import { getRarityLabel, RARITY_COLORS } from "@/components/nft/user-nfts";
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
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { aptos } from "@/config/aptosConfig";
import { CONTRACT_NAME, MARKETPLACE_ADDRESS } from "@/config/constants";
import { useToast } from "@/hooks/use-toast";
import { hexToAsciiString, InputViewFunctionData } from "@aptos-labs/ts-sdk";
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

interface TransferModalProps {
  nft: NFT;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (address: string) => Promise<void>;
}

function TransferModal({ isOpen, onClose, onConfirm }: TransferModalProps) {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientAddress) return;

    setIsSubmitting(true);
    try {
      await onConfirm(recipientAddress);
      setRecipientAddress("");
      onClose();
    } catch (error) {
      console.error("Error in transfer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer NFT</DialogTitle>
          <DialogDescription>
            Enter the recipient&apos;s wallet address to transfer your NFT
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="Enter recipient's address"
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  Transferring...
                </>
              ) : (
                "Transfer NFT"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function PurchasedPage() {
  const { account } = useWallet();
  const { toast } = useToast();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNft, setSelectedNft] = useState<NFT | null>(null);
  const [receivedNfts, setReceivedNfts] = useState<NFT[]>([]);
  const [activeTab, setActiveTab] = useState("purchased");

  const fetchPurchasedNFTs = useCallback(async () => {
    if (!account?.address) {
      console.log("No wallet address found, skipping NFT fetch");
      return;
    }

    try {
      setIsLoading(true);

      const payload: InputViewFunctionData = {
        function: `${MARKETPLACE_ADDRESS}::${CONTRACT_NAME}::get_purchased_nfts`,
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

      setNfts(processedNFTs);
    } catch (error) {
      console.error("Error fetching purchased NFTs:", error);
      toast({
        variant: "destructive",
        title: "Error Loading NFTs",
        description: "Failed to load your purchased NFTs. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [account?.address, toast]);

  const fetchReceivedNFTs = useCallback(async () => {
    if (!account?.address) return;

    try {
      const response = await aptos.view({
        payload: {
          function: `${MARKETPLACE_ADDRESS}::${CONTRACT_NAME}::get_received_nfts`,
          functionArguments: [account.address],
          typeArguments: [],
        },
      });

      if (response && Array.isArray(response[0])) {
        const processedNFTs = response[0].map((nft: any) => ({
          id: Number(nft.id),
          owner: nft.owner,
          minter: nft.minter,
          name: hexToAsciiString(nft.name),
          description: hexToAsciiString(nft.description),
          uri: hexToAsciiString(nft.uri),
          price: Number(nft.price) / 100000000,
          for_sale: nft.for_sale,
          rarity: Number(nft.rarity),
        }));
        setReceivedNfts(processedNFTs);
      }
    } catch (error) {
      console.error("Error fetching received NFTs:", error);
    }
  }, [account?.address]);

  const handleTransfer = async (recipientAddress: string) => {
    if (!selectedNft || !account) return;

    try {
      const payload = {
        function: `${MARKETPLACE_ADDRESS}::${CONTRACT_NAME}::transfer_nft`,
        type_arguments: [],
        arguments: [recipientAddress, selectedNft.id.toString()],
      };

      const response = await (window as any).aptos.signAndSubmitTransaction(
        payload
      );
      await aptos.waitForTransaction({ transactionHash: response.hash });

      toast({
        title: "NFT Transferred",
        description: "Your NFT has been transferred successfully",
      });

      // Refresh NFTs
      fetchPurchasedNFTs();
      fetchReceivedNFTs();
    } catch (error) {
      console.error("Error transferring NFT:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to transfer NFT. Please try again.",
      });
    }
  };

  useEffect(() => {
    if (account?.address) {
      fetchPurchasedNFTs();
      fetchReceivedNFTs();
    }
  }, [account?.address, fetchPurchasedNFTs, fetchReceivedNFTs]);

  if (!account) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Your Purchased NFTs</CardTitle>
          <CardDescription>
            Please connect your wallet to view your purchased NFTs
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8">Purchased NFTs</h1>
        <Card>
          <CardHeader className="text-center">
            <CardTitle>No Purchased NFTs</CardTitle>
            <CardDescription>
              You haven&apos;t purchased any NFTs yet. Check out the marketplace
              to buy some!
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Your NFTs</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="purchased">Purchased NFTs</TabsTrigger>
        </TabsList>

        <TabsContent value="purchased">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nfts.map((nft) => (
              <Card key={nft.id} className="overflow-hidden">
                <div className="aspect-square relative">
                  <Image
                    src={nft.uri}
                    alt={nft.name}
                    width={400}
                    height={400}
                    className="object-cover w-full h-full"
                    onError={(e: any) => {
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
                      <span className="text-sm text-muted-foreground">
                        Minted by: {nft.minter.slice(0, 6)}...
                      </span>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => setSelectedNft(nft)}
                    >
                      Transfer NFT
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="received">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {receivedNfts.map((nft) => (
              <Card key={nft.id} className="overflow-hidden">
                <div className="aspect-square relative">
                  <Image
                    src={nft.uri}
                    alt={nft.name}
                    width={400}
                    height={400}
                    className="object-cover w-full h-full"
                    onError={(e: any) => {
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
                      <span className="text-sm text-muted-foreground">
                        Transferred from: {nft.minter.slice(0, 6)}...
                      </span>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => setSelectedNft(nft)}
                    >
                      Transfer NFT
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <TransferModal
        nft={selectedNft!}
        isOpen={!!selectedNft}
        onClose={() => setSelectedNft(null)}
        onConfirm={handleTransfer}
      />
    </div>
  );
}
