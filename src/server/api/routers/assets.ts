import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "~/env";
import type { CryptoAsset } from "~/types/CryptoAsset";

// Cache for crypto prices to avoid hitting rate limits
const priceCache: Record<string, { price: number; timestamp: number }> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchCryptoPrices(
  assetNames: string[],
): Promise<Map<string, number>> {
  // Skip API calls if disabled (for development/testing)
  if (env.DISABLE_API_CALLS) {
    return new Map(assetNames.map((name) => [name.toLowerCase(), 1]));
  }

  try {
    const ids = assetNames.join(",");
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }

    const data: Record<string, { usd: number }> = await response.json();
    return new Map(
      Object.entries(data).map(([id, prices]) => [
        id.toLowerCase(),
        prices.usd,
      ]),
    );
  } catch (error) {
    console.error("Error fetching crypto prices:", error);
    // Return cached prices if available, otherwise use 1 as fallback
    return new Map(
      assetNames.map((name) => [
        name.toLowerCase(),
        priceCache[name.toLowerCase()]?.price ?? 1,
      ]),
    );
  }
}

async function updateAssetPrices(
  assets: CryptoAsset[],
): Promise<CryptoAsset[]> {
  if (!assets.length) return assets;

  const now = Date.now();
  const namesToFetch = assets
    .map((asset) => asset.name.toLowerCase())
    .filter((name) => {
      const cached = priceCache[name];
      return !cached || now - cached.timestamp > CACHE_DURATION;
    });

  if (namesToFetch.length > 0) {
    const prices = await fetchCryptoPrices(namesToFetch);

    // Update price cache
    for (const [name, price] of prices.entries()) {
      priceCache[name] = { price, timestamp: now };
    }
  }

  // Update assets with new prices
  return assets.map((asset) => {
    const name = asset.name.toLowerCase();
    const price = priceCache[name]?.price ?? 1;
    return {
      ...asset,
      priceUSD: price,
      totalValue: asset.amount * price,
    };
  });
}

export const assetsRouter = createTRPCRouter({
  getAssets: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user?.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }

    // First get static data from database
    const assets = await ctx.db.cryptoAsset.findMany({
      where: { userId: ctx.session.user.id },
    });

    // Then update with fresh prices
    const updatedAssets = await updateAssetPrices(assets);

    // Calculate total portfolio value
    const totalPortfolioValue = updatedAssets.reduce(
      (sum, asset) => sum + (asset.totalValue ?? 0),
      0,
    );

    // Return assets with portfolio percentages
    return updatedAssets.map((asset) => ({
      ...asset,
      portfolioPercentage: asset.totalValue
        ? ((asset.totalValue / totalPortfolioValue) * 100).toFixed(2)
        : "0.00",
    }));
  }),

  addAsset: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        symbol: z.string(),
        amount: z.number(),
        priceUSD: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      const asset = await ctx.db.cryptoAsset.create({
        data: {
          userId: ctx.session.user.id,
          name: input.name,
          symbol: input.symbol,
          amount: input.amount,
          priceUSD: input.priceUSD,
          totalValue: input.amount * input.priceUSD,
        },
      });

      // Update price cache with the new price
      priceCache[input.name.toLowerCase()] = {
        price: input.priceUSD,
        timestamp: Date.now(),
      };

      return asset;
    }),

  deleteAsset: protectedProcedure
    .input(
      z.object({
        id: z.number(), // Accepts an asset ID as input
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const asset = await ctx.db.cryptoAsset.findUnique({
        where: { id: input.id, userId: ctx.session?.user?.id },
      });

      if (!asset) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Asset not found" });
      }

      return ctx.db.cryptoAsset.delete({
        where: { id: input.id },
      });
    }),

  updateAsset: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        amount: z.number().min(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      // First verify the asset belongs to the user
      const existingAsset = await ctx.db.cryptoAsset.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!existingAsset) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Asset not found",
        });
      }

      // Get current price from cache or API
      const name = existingAsset.name.toLowerCase();
      const price = priceCache[name]?.price ?? 1;

      // Update the asset with new amount and calculated total value
      const updatedAsset = await ctx.db.cryptoAsset.update({
        where: { id: input.id },
        data: {
          amount: input.amount,
          totalValue: input.amount * price,
        },
      });

      return updatedAsset;
    }),
});
