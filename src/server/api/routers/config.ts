import { createTRPCRouter, publicProcedure } from "../trpc";
import { env } from "~/env";

const DEFAULT_REFETCH_INTERVAL = 1800000; // 30 minutes

export const configRouter = createTRPCRouter({
  getRefetchInterval: publicProcedure.query(() => {
    try {
      const interval = env.API_REFETCH_INTERVAL;
      if (typeof interval === "number" && interval > 0) {
        return interval;
      }
      return DEFAULT_REFETCH_INTERVAL;
    } catch (error) {
      console.error("Error getting refetch interval:", error);
      return DEFAULT_REFETCH_INTERVAL;
    }
  }),
});
