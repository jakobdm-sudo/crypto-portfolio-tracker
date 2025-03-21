import { Suspense } from "react";
import DashboardClient from "./DashboardClient";
import PieChartSkeleton from "~/components/skeletons/PieChartSkeleton";
import CryptoListSkeleton from "~/components/skeletons/CryptoListSkeleton";

// Add this line to make the page dynamic
export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
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
      <DashboardClient />
    </Suspense>
  );
}
