import { createTRPCRouter, publicProcedure } from "../trpc";
import { env } from "~/env";

export const configRouter = createTRPCRouter({
  getRefetchInterval: publicProcedure.query(() => {
    try {
      return env.API_REFETCH_INTERVAL ?? 1800000;
    } catch (error) {
      // Fallback to default if env variable is not available
      return 1800000;
    }
  }),
});
