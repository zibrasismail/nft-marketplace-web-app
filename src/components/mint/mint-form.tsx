"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { aptos } from "@/config/aptosConfig";
import { CONTRACT_NAME, MARKETPLACE_ADDRESS } from "@/config/constants";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface MintFormData {
  name: string;
  description: string;
  uri: string;
  rarity: string;
}

interface MintFormProps {
  onMintSuccess?: () => void;
}

export function MintForm({ onMintSuccess }: MintFormProps) {
  const { toast } = useToast();
  const { account } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<MintFormData>({
    name: "",
    description: "",
    uri: "",
    rarity: "1",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      toast({
        variant: "destructive",
        title: "Connect Wallet",
        description: "Please connect your wallet to mint NFTs",
      });
      return;
    }

    try {
      setIsLoading(true);

      const mintPayload = {
        function: `${MARKETPLACE_ADDRESS}::${CONTRACT_NAME}::mint_nft`,
        type_arguments: [],
        arguments: [
          Array.from(new TextEncoder().encode(formData.name)),
          Array.from(new TextEncoder().encode(formData.description)),
          Array.from(new TextEncoder().encode(formData.uri)),
          parseInt(formData.rarity),
        ],
      };

      // @ts-expect-error window is not typed
      const response = await window.aptos.signAndSubmitTransaction(mintPayload);
      await aptos.waitForTransaction({ transactionHash: response.hash });

      toast({
        title: "NFT Minted Successfully",
        description: "Your NFT has been minted successfully",
      });

      setFormData({
        name: "",
        description: "",
        uri: "",
        rarity: "1",
      });

      onMintSuccess?.();
    } catch (error) {
      console.error("Mint error:", error);
      toast({
        variant: "destructive",
        title: "Error Minting NFT",
        description: "There was an error minting your NFT. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">NFT Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter NFT name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Describe your NFT"
          className="min-h-[100px]"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="uri">Image URI</Label>
        <Input
          id="uri"
          value={formData.uri}
          onChange={(e) => setFormData({ ...formData, uri: e.target.value })}
          placeholder="Enter image URI (IPFS or other permanent storage)"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="rarity">Rarity Level</Label>
        <Select
          value={formData.rarity}
          onValueChange={(value) => setFormData({ ...formData, rarity: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select rarity level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Common</SelectItem>
            <SelectItem value="2">Uncommon</SelectItem>
            <SelectItem value="3">Rare</SelectItem>
            <SelectItem value="4">Epic</SelectItem>
            <SelectItem value="5">Legendary</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        type="submit"
        disabled={isLoading || !account}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Minting...
          </>
        ) : (
          "Mint NFT"
        )}
      </Button>
    </form>
  );
}
