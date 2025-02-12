"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import CryptoPortfolio from "~/components/CryptoPortfolio";
import { useEffect } from "react";
import { ClientOnly } from "~/components/client-only";
import PieChart from "~/components/PieChart";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const {
    data: assets,
    isLoading,
    refetch,
  } = api.assets.getAssets.useQuery(undefined, {
    // Disable automatic refetching
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    // Only rely 10 mintues interval for fetching prices
    refetchInterval: 18000000, // 30 minutes
  });

  if (status === "loading") return <p>Loading...</p>;
  if (!session) {
    router.push("/login");
    return <p>Redirecting...</p>;
  }

  return (
    <>
      <CryptoPortfolio assets={assets ?? []} isLoading={isLoading} />
    </>
  );
}
