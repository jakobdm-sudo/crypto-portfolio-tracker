import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {

const hashedPassword = await bcrypt.hash("password", 10);
  // Create user with nested crypto assets
  await prisma.user.create({
    data: {
      name: "Jakob",
      email: "jakob@mail.com",
      password: hashedPassword,
      assets: {
        create: [
          {
            name: "Bitcoin",
            symbol: "BTC",
            amount: 0.5,
            priceUSD: 100000,
            totalValue: 50000,
          },
          {
            name: "Ethereum",
            symbol: "ETH",
            amount: 1,
            priceUSD: 30000,
            totalValue: 30000,
          },
        ],
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e: Error) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
