import { createTRPCRouter, publicProcedure } from "../trpc";
import { env } from "~/env";

export const configRouter = createTRPCRouter({
  getRefetchInterval: publicProcedure.query(() => {
    return env.API_REFETCH_INTERVAL ?? 1800000;
  }),
});
