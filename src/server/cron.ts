import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Run this periodically (e.g., every hour) to clean up expired guest accounts
export async function cleanupGuestAccounts() {
  try {
    const now = new Date();
    const result = await prisma.user.deleteMany({
      where: {
        isGuest: true,
        expiresAt: {
          lt: now, // This will match all dates less than (before) current time
        },
      },
    });
    console.log(
      `Cleaned up ${result.count} expired guest accounts at ${now.toISOString()}`,
    );
  } catch (error) {
    console.error("Error cleaning up guest accounts:", error);
  }
}
