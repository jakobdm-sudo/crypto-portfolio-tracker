"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import ErrorBoundary from "~/components/error-boundary";
import CryptoPortfolio from "~/components/CryptoPortfolio";
import { api } from "~/trpc/react";
import PieChartSkeleton from "~/components/skeletons/PieChartSkeleton";
import CryptoListSkeleton from "~/components/skeletons/CryptoListSkeleton";

export default function DashboardClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [assets] = api.assets.getAssets.useSuspenseQuery();

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="relative">
            <div className="mx-4 my-2 flex items-center justify-between">
              <h1 className="text-2xl font-bold">Loading Dashboard...</h1>
            </div>
            <PieChartSkeleton />
            <CryptoListSkeleton />
          </div>
        }
      >
        <CryptoPortfolio assets={assets} isLoading={false} />
      </Suspense>
    </ErrorBoundary>
  );
}
