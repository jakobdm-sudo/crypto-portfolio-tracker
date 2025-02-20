import Image from "next/image";
import type { CryptoAsset } from "~/types/CryptoAsset";
import { formatCurrency } from "~/utils/formatters";
import { Pencil, Settings2, Trash2 } from "lucide-react";
import { useState, useMemo, useCallback, useRef } from "react";
import { motion, PanInfo, AnimatePresence } from "framer-motion";
import { api } from "~/trpc/react";
import { CRYPTO_ICONS, DEFAULT_CRYPTO_ICON } from "~/utils/cryptoIcons";

export default function CryptoList({ assets }: { assets: CryptoAsset[] }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>("totalValue");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const [editingAmounts, setEditingAmounts] = useState<Record<number, string>>(
    {},
  );

  const utils = api.useUtils();
  const deleteAssetMutation = api.assets.deleteAsset.useMutation({
    onMutate: async (deletedAsset) => {
      await utils.assets.getAssets.cancel();

      const previousAssets = utils.assets.getAssets.getData();

      utils.assets.getAssets.setData(undefined, (old) =>
        old?.filter((asset) => asset.id !== deletedAsset.id),
      );

      return { previousAssets };
    },
    onError: (err, deletedAsset, context) => {
      utils.assets.getAssets.setData(undefined, context?.previousAssets);
    },
    onSettled: () => {
      utils.assets.getAssets.invalidate();
    },
  });

  const updateAssetMutation = api.assets.updateAsset.useMutation({
    onMutate: async (updatedAsset) => {
      await utils.assets.getAssets.cancel();
      const previousAssets = utils.assets.getAssets.getData();

      utils.assets.getAssets.setData(undefined, (old) =>
        old?.map((asset) =>
          asset.id === updatedAsset.id
            ? {
                ...asset,
                amount: updatedAsset.amount,
                totalValue: Number(
                  (updatedAsset.amount * (asset.priceUSD ?? 0)).toFixed(8),
                ),
              }
            : asset,
        ),
      );

      return { previousAssets };
    },
    onError: (err, updatedAsset, context) => {
      utils.assets.getAssets.setData(undefined, context?.previousAssets);
    },
  });

  const sortedAssets = [...assets].sort((a, b) => {
    if (sortBy === "totalValue") {
      return sortOrder === "asc"
        ? (a.totalValue ?? 0) - (b.totalValue ?? 0)
        : (b.totalValue ?? 0) - (a.totalValue ?? 0);
    }
    return sortOrder === "asc"
      ? a.name.localeCompare(b.name)
      : b.name.localeCompare(a.name);
  });

  const handleDragEnd = async (info: PanInfo, asset: CryptoAsset) => {
    const threshold = -100;

    if (info.offset.x < threshold) {
      setDeletingIds((prev) => new Set(prev).add(asset.id));
      deleteAssetMutation.mutate({ id: asset.id });
    }
  };

  const handleAmountChange = (asset: CryptoAsset, value: string) => {
    setEditingAmounts((prev) => ({ ...prev, [asset.id]: value }));

    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      updateAssetMutation.mutate({
        id: asset.id,
        amount: numValue,
      });
    }
  };

  return (
    <div className="border-width-2 mx-4 space-y-4 overflow-hidden rounded-lg border border-primary/20 bg-primary/10 p-4 pb-8 shadow-lg md:mx-20">
      {/* Header Buttons */}
      <div className="flex flex-col items-end justify-end">
        <div className="flex flex-row items-center justify-end gap-4">
          <button
            className="rounded-lg bg-primary p-2"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            className="rounded-lg bg-primary p-2"
            onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
          >
            <Settings2 className="h-4 w-4" />
          </button>
        </div>
        {isSortMenuOpen && (
          <div className="animate-fade-in mt-2 w-20 rounded-lg bg-card p-2 shadow-lg">
            <button className="w-full rounded-lg p-2 hover:bg-primary/10">
              Sort by Total Value
            </button>
          </div>
        )}
      </div>

      <AnimatePresence mode="popLayout">
        {sortedAssets.map((asset) => (
          <motion.div
            key={asset.id}
            className="relative w-full overflow-hidden rounded-lg"
            layout
            initial={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              x: "-100%",
              transition: { duration: 0.2 },
            }}
            animate={
              deletingIds.has(asset.id)
                ? {
                    x: "-100%",
                    opacity: 0,
                    transition: { duration: 0.2 },
                  }
                : {
                    x: 0,
                    opacity: 1,
                  }
            }
          >
            {/* Red Background + Trash Icon */}
            <div className="absolute inset-0 flex items-center justify-end bg-red-600 pr-6">
              <Trash2 className="text-white" size={24} />
            </div>

            {/* Draggable Card */}
            <motion.div
              className={`relative flex h-[88px] w-full items-center rounded-lg ${isEditing ? "border-2 border-primary" : "border-2 border-transparent"} bg-card p-4 shadow-xl`}
              drag={isEditing ? false : "x"}
              dragConstraints={isEditing ? undefined : { left: -150, right: 0 }}
              dragElastic={isEditing ? undefined : 0.1}
              dragMomentum={false}
              transition={{
                type: "spring",
                damping: 20,
                stiffness: 200,
              }}
              onDragEnd={(_, info) => !isEditing && handleDragEnd(info, asset)}
            >
              <div className="mr-4 flex-shrink-0">
                <Image
                  src={CRYPTO_ICONS[asset.symbol]?.icon ?? DEFAULT_CRYPTO_ICON}
                  alt={asset.name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              </div>
              <div className="flex-grow">
                <h3 className="text-sm font-semibold md:text-lg">
                  {asset.name}
                </h3>
                <p className="text-xs text-muted-foreground md:text-sm">
                  {asset.symbol}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold md:text-lg">
                  {formatCurrency(asset.totalValue ?? 0)}
                </p>
                <div className="flex flex-row items-center justify-center text-xs text-muted-foreground md:text-sm">
                  {isEditing ? (
                    <input
                      type="number"
                      className="h-[28px] w-[6rem] rounded-md border border-input bg-background px-1 text-xs leading-[28px] [appearance:textfield] md:text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      value={editingAmounts[asset.id] ?? asset.amount}
                      onChange={(e) =>
                        handleAmountChange(asset, e.target.value)
                      }
                      min="0"
                      step="any"
                      onFocus={(e) => {
                        setEditingAmounts((prev) => ({
                          ...prev,
                          [asset.id]: asset.amount.toString(),
                        }));
                        e.target.select();
                      }}
                      onBlur={() => {
                        setEditingAmounts((prev) => {
                          const newState = { ...prev };
                          delete newState[asset.id];
                          return newState;
                        });
                      }}
                    />
                  ) : (
                    <span className="inline-flex h-[28px] items-center px-1">
                      {Number(asset.amount).toLocaleString("en-US", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 8,
                        useGrouping: false,
                      })}
                    </span>
                  )}
                  <span className="inline-flex h-[28px] items-center">
                    {asset.symbol} @ {formatCurrency(asset.priceUSD ?? 0)}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
