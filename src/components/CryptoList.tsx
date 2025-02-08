import Image from "next/image";
import type { CryptoAsset } from "~/types/CryptoAsset";
import { formatCurrency } from "~/utils/formatters";

export default function CryptoList({ assets }: { assets: CryptoAsset[] }) {
  return (
    <div className="space-y-4">
      {assets.map((asset) => (
        <div
          key={asset.id}
          className="flex items-center rounded-lg bg-card p-4 shadow dark:bg-gray-800"
        >
          <div className="mr-4 flex-shrink-0">
            <Image
              src={`/placeholder.svg?height=40&width=40&text=${asset.symbol}`}
              alt={asset.name}
              width={40}
              height={40}
              className="rounded-full bg-gray-200 dark:bg-gray-700"
            />
          </div>
          <div className="flex-grow">
            <h3 className="text-lg font-semibold">{asset.name}</h3>
            <p className="text-sm text-muted-foreground">{asset.symbol}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">
              {formatCurrency(asset.value)}
            </p>
            <p className="text-sm text-muted-foreground">
              {asset.percentage}% of portfolio
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
