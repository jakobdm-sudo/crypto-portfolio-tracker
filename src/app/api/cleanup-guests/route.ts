import { cleanupGuestAccounts } from "~/server/cron";

export async function GET() {
  await cleanupGuestAccounts();
  return new Response("Cleanup completed", { status: 200 });
}
