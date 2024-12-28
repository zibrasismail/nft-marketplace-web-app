"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { aptos } from "@/config/aptosConfig";
import { CONTRACT_NAME, MARKETPLACE_ADDRESS } from "@/config/constants";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Award, Gift, Loader2, Palette } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface Creator {
  address: string;
  totalNFTs: number;
  listedNFTs: number;
}

export default function DonatePage() {
  const { account } = useWallet();
  const { toast } = useToast();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [donationAmount, setDonationAmount] = useState<{
    [key: string]: string;
  }>({});

  const fetchAllCreators = useCallback(async () => {
    if (!account?.address) return;

    try {
      setIsLoading(true);

      const response = await aptos.view({
        payload: {
          function: `${MARKETPLACE_ADDRESS}::${CONTRACT_NAME}::get_all_creators`,
          functionArguments: [],
          typeArguments: [],
        },
      });

      if (response && Array.isArray(response[0])) {
        const creatorStats = response[0]
          /* eslint-disable @typescript-eslint/no-explicit-any */
          .map((creator: any) => ({
            address: creator.address,
            totalNFTs: Number(creator.total_nfts),
            listedNFTs: Number(creator.listed_nfts),
          }))
          .filter(
            (creator: Creator) =>
              creator.address !== account.address && creator.totalNFTs > 0
          );

        setCreators(creatorStats);
      }
    } catch (error) {
      console.error("Error fetching creators:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load creator information",
      });
    } finally {
      setIsLoading(false);
    }
  }, [account?.address, toast]);

  useEffect(() => {
    fetchAllCreators();
  }, [fetchAllCreators]);

  const handleDonate = async (creatorAddress: string) => {
    if (!account || !donationAmount[creatorAddress]) return;

    try {
      const amount = Math.floor(
        parseFloat(donationAmount[creatorAddress]) * 100000000
      );

      console.log(creatorAddress, amount);

      const payload = {
        function: `${MARKETPLACE_ADDRESS}::${CONTRACT_NAME}::donate_to_creator`,
        type_arguments: [],
        arguments: [creatorAddress, amount.toString()],
      };

      // @ts-expect-error window is not typed
      const response = await window.aptos.signAndSubmitTransaction(payload);
      await aptos.waitForTransaction({ transactionHash: response.hash });

      toast({
        title: "Donation Successful",
        description: `You have donated ${donationAmount[creatorAddress]} APT to the creator`,
      });

      setDonationAmount({ ...donationAmount, [creatorAddress]: "" });
    } catch (error) {
      console.error("Error donating:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process donation. Please try again.",
      });
    }
  };

  if (!account) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Support Creators</CardTitle>
            <CardDescription>
              Please connect your wallet to support NFT creators
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Support NFT Creators</h1>
        <p className="text-muted-foreground">
          Support talented NFT creators by donating APT tokens
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center space-x-4">
            <Palette className="w-8 h-8 text-primary" />
            <div>
              <CardTitle>{creators.length}</CardTitle>
              <CardDescription>Active Creators</CardDescription>
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center space-x-4">
            <Award className="w-8 h-8 text-primary" />
            <div>
              <CardTitle>
                {creators.reduce((sum, creator) => sum + creator.totalNFTs, 0)}
              </CardTitle>
              <CardDescription>Total NFTs Created</CardDescription>
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center space-x-4">
            <Gift className="w-8 h-8 text-primary" />
            <div>
              <CardTitle>
                {creators.reduce((sum, creator) => sum + creator.listedNFTs, 0)}
              </CardTitle>
              <CardDescription>NFTs For Sale</CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {creators.map((creator) => (
          <Card key={creator.address}>
            <CardHeader>
              <CardTitle className="text-lg">Creator Profile</CardTitle>
              <CardDescription>
                Address: {creator.address.slice(0, 6)}...
                {creator.address.slice(-4)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      NFTs Created
                    </p>
                    <p className="text-2xl font-bold">{creator.totalNFTs}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Listed NFTs</p>
                    <p className="text-2xl font-bold">{creator.listedNFTs}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`donation-${creator.address}`}>
                    Donation Amount (APT)
                  </Label>
                  <Input
                    id={`donation-${creator.address}`}
                    type="number"
                    step="0.1"
                    min="0"
                    value={donationAmount[creator.address] || ""}
                    onChange={(e) =>
                      setDonationAmount({
                        ...donationAmount,
                        [creator.address]: e.target.value,
                      })
                    }
                    placeholder="Enter amount in APT"
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => handleDonate(creator.address)}
                  disabled={
                    !donationAmount[creator.address] ||
                    parseFloat(donationAmount[creator.address]) <= 0
                  }
                >
                  Support Creator
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
