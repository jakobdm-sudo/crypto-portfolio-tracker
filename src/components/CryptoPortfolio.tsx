"use client";

import PieChart from "./PieChart";
import CryptoList from "./CryptoList";
import FloatingActionButton from "./FloatingActionButton";
import type { CryptoAsset } from "~/types/CryptoAsset";
import { ThemeToggle } from "./theme-toggle";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { ClientOnly } from "~/components/client-only";

export default function CryptoPortfolio({
  assets,
  isLoading,
}: {
  assets: CryptoAsset[];
  isLoading: boolean;
}) {
  const { data: session } = useSession();
 
  return (
    <div className="relative">
      {isLoading ? (
        <p>Loading assets...</p>
      ) : assets.length === 0 ? (
        <p>No assets found. Add your first asset!</p>
      ) : (
        <>
          <div className="mx-4 my-2 flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              <span className="text-primary">{session?.user?.name}'s </span>
              Crypto Portfolio
            </h1>
            <ThemeToggle />
          </div>
          <div className="mb-8">
            <PieChart assets={assets} />
            
          </div>
          <CryptoList assets={assets} />
        </>
      )}
      <FloatingActionButton />
    </div>
  );
}
