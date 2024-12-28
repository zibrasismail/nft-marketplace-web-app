"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { aptos } from "@/config/aptosConfig";
import { CONTRACT_NAME, MARKETPLACE_ADDRESS } from "@/config/constants";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface MarketplaceStats {
  totalNFTs: number;
  totalListed: number;
  totalSold: number;
  totalVolume: number;
  totalCreators: number;
}

interface MoveStatsResponse {
  total_nfts: string;
  total_listed: string;
  total_sold: string;
  total_volume: string;
  total_creators: string;
}

export default function StatsPage() {
  const [stats, setStats] = useState<MarketplaceStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await aptos.view({
        payload: {
          function: `${MARKETPLACE_ADDRESS}::${CONTRACT_NAME}::get_marketplace_stats`,
          functionArguments: [],
          typeArguments: [],
        },
      });

      console.log("Stats response:", response);

      if (response && Array.isArray(response) && response.length > 0) {
        const moveStats = response[0] as unknown as MoveStatsResponse;

        setStats({
          totalNFTs: Number(moveStats?.total_nfts ?? 0),
          totalListed: Number(moveStats?.total_listed ?? 0),
          totalSold: Number(moveStats?.total_sold ?? 0),
          totalVolume: Number(moveStats?.total_volume ?? 0) / 100000000, // Convert to APT
          totalCreators: Number(moveStats?.total_creators ?? 0),
        });
      } else {
        console.error("Invalid response format:", response);
        setStats({
          totalNFTs: 0,
          totalListed: 0,
          totalSold: 0,
          totalVolume: 0,
          totalCreators: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStats({
        totalNFTs: 0,
        totalListed: 0,
        totalSold: 0,
        totalVolume: 0,
        totalCreators: 0,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const chartData = stats
    ? [
        { name: "Total NFTs", value: stats.totalNFTs },
        { name: "Listed", value: stats.totalListed },
        { name: "Sold", value: stats.totalSold },
      ]
    : [];

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Marketplace Statistics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Volume</CardTitle>
            <CardDescription>Total value of NFT sales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats?.totalVolume.toFixed(2)} APT
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Creators</CardTitle>
            <CardDescription>Number of NFT creators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalCreators}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Sales</CardTitle>
            <CardDescription>Number of NFTs sold</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalSold}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>NFT Overview</CardTitle>
            <CardDescription>
              Distribution of NFTs in the marketplace
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Marketplace Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total NFTs</p>
                  <p className="text-2xl font-bold">{stats?.totalNFTs}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Listed NFTs</p>
                  <p className="text-2xl font-bold">{stats?.totalListed}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sold NFTs</p>
                  <p className="text-2xl font-bold">{stats?.totalSold}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Sale Success Rate
                  </p>
                  <p className="text-2xl font-bold">
                    {stats && stats.totalNFTs > 0
                      ? ((stats.totalSold / stats.totalNFTs) * 100).toFixed(1)
                      : "0.0"}
                    %
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
