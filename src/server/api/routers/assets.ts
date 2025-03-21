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
  if (env.DISABLE_API_CALLS) {
    console.log("API calls disabled, using fallback prices");
    return new Map(assetNames.map((name) => [name.toLowerCase(), 1]));
  }

  try {
    const ids = assetNames.join(",").toLowerCase();
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store", // Disable caching to ensure fresh data
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data: Record<string, { usd: number }> = await response.json();
    const prices = new Map<string, number>();

    for (const [id, priceData] of Object.entries(data)) {
      if (priceData?.usd) {
        const price = priceData.usd;
        prices.set(id.toLowerCase(), price);
        // Update cache
        priceCache[id.toLowerCase()] = {
          price,
          timestamp: Date.now(),
        };
      }
    }

    if (prices.size === 0) {
      throw new Error("No valid prices returned from API");
    }

    console.log("Successfully fetched prices:", Object.fromEntries(prices));
    return prices;
  } catch (error) {
    console.error("Error fetching crypto prices:", error);

    // Return cached prices if available
    const cachedPrices = new Map<string, number>();
    for (const name of assetNames) {
      const normalizedName = name.toLowerCase();
      const cached = priceCache[normalizedName];

      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        cachedPrices.set(normalizedName, cached.price);
      } else {
        cachedPrices.set(normalizedName, 1); // Fallback price
      }
    }

    return cachedPrices;
  }
}

async function updateAssetPrices(
  assets: CryptoAsset[],
): Promise<CryptoAsset[]> {
  if (!assets.length) return assets;

  try {
    const prices = await fetchCryptoPrices(assets.map((asset) => asset.name));

    return assets.map((asset) => {
      const price = prices.get(asset.name.toLowerCase()) ?? 1;
      return {
        ...asset,
        priceUSD: price,
        totalValue: asset.amount * price,
      };
    });
  } catch (error) {
    console.error("Error updating asset prices:", error);
    // Return assets with fallback prices if update fails
    return assets.map((asset) => ({
      ...asset,
      priceUSD: 1,
      totalValue: asset.amount * 1,
    }));
  }
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
