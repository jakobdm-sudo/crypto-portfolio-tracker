import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const assetsRouter = createTRPCRouter({
  getAssets: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Fetch user assets from the database
      const assets = await ctx.db.cryptoAsset.findMany({
        where: { userId: ctx.session?.user?.id },
      });

      if (!assets.length) return [];

      // Check if API calls are disabled (for Vercel deployment)
      if (process.env.DISABLE_API_CALLS === "true") {
        return assets;
      }

      // Disbale API calls for testing
      const isAPIEnabled = false;
      if (isAPIEnabled) {
        return assets;
      }

      // Use name for API calls (lowercase)
      const ids = assets.map((asset) => asset.name.toLowerCase()).join(",");
      const priceRes = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&per_page=100&page=1&sparkline=false`,
      );

      if (!priceRes.ok) {
        throw new Error(`API request failed: ${await priceRes.text()}`);
      }

      const priceData: Array<{ id: string; current_price: number }> =
        await priceRes.json();

      if (!Array.isArray(priceData)) {
        throw new Error("Invalid API response format");
      }

      // Create a map for easier price lookup
      const priceMap = new Map(
        priceData.map((coin) => [coin.id, coin.current_price]),
      );

      // Update asset prices & total value dynamically
      return assets.map((asset) => ({
        ...asset,
        priceUSD: priceMap.get(asset.name.toLowerCase()) ?? asset.priceUSD,
        totalValue: Number(
          (
            asset.amount *
            (priceMap.get(asset.name.toLowerCase()) ?? asset.priceUSD)
          ).toFixed(8),
        ),
      }));
    } catch (error) {
      console.error("Error in getAssets:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch asset data",
        cause: error,
      });
    }
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
    .mutation(({ ctx, input }) => {
      console.log("User ID in addAsset:", ctx.session?.user?.id); // Debugging log

      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      return ctx.db.cryptoAsset.create({
        data: {
          userId: ctx.session?.user?.id,
          name: input.name,
          symbol: input.symbol,
          amount: input.amount,
          priceUSD: input.priceUSD,
          totalValue: input.amount * input.priceUSD,
        },
      });
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
        amount: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const asset = await ctx.db.cryptoAsset.findUnique({
        where: { id: input.id, userId: ctx.session?.user?.id },
      });

      if (!asset) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Asset not found" });
      }

      // Calculate new total value using existing price
      const totalValue = Number(
        (input.amount * (asset.priceUSD ?? 0)).toFixed(8),
      );

      return ctx.db.cryptoAsset.update({
        where: { id: input.id },
        data: {
          amount: input.amount,
          totalValue: totalValue,
        },
      });
    }),
});
