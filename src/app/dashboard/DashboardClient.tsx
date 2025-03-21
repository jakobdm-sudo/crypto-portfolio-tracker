"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { ThemeToggle } from "~/components/theme-toggle";
import PieChart from "~/components/PieChart";
import CryptoList from "~/components/CryptoList";
import FloatingActionButton from "~/components/FloatingActionButton";
import PieChartSkeleton from "~/components/skeletons/PieChartSkeleton";
import CryptoListSkeleton from "~/components/skeletons/CryptoListSkeleton";

export default function DashboardClient() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <div className="relative">
      <div className="mx-4 my-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          <span className="text-primary">{session?.user?.name}&apos;s </span>
          Crypto Portfolio
        </h1>
        <ThemeToggle />
      </div>

      <Suspense fallback={<PieChartSkeleton />}>
        <PieChart />
      </Suspense>

      <Suspense fallback={<CryptoListSkeleton />}>
        <CryptoList />
      </Suspense>

      <FloatingActionButton />
    </div>
  );
}
