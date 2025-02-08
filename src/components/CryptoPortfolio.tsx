"use client"

import { useState } from "react"
import PieChart from "./PieChart"
import CryptoList from "./CryptoList"
import FloatingActionButton from "./FloatingActionButton"
import type { CryptoAsset } from "~/types/CryptoAsset"

const mockData: CryptoAsset[] = [
  { id: 1, name: "Bitcoin", symbol: "BTC", value: 50_000.00, percentage: 45 },
  { id: 2, name: "Ethereum", symbol: "ETH", value: 25_000.00, percentage: 30 },
  { id: 3, name: "Cardano", symbol: "ADA", value: 10_000.00, percentage: 15 },
  { id: 4, name: "Polkadot", symbol: "DOT", value: 5_000.00, percentage: 10 },
]

export default function CryptoPortfolio() {
  const [assets, setAssets] = useState<CryptoAsset[]>(mockData)

  const addAsset = (newAsset: CryptoAsset) => {
    setAssets([...assets, newAsset])
  }

  return (
    <div className="relative">
      <div className="mb-8">
        <PieChart assets={assets} />
      </div>
      <CryptoList assets={assets} />
      <FloatingActionButton onAddAsset={addAsset} />
    </div>
  )
}

