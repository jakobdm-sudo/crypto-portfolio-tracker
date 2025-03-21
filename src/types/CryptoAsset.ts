export interface CryptoAsset {
  id: number; // Matches `@id @default(autoincrement())`
  userId: string; // Foreign key linking asset to the user
  name: string;
  symbol: string;
  amount: number; // Amount of the asset owned
  priceUSD?: number; // Optional: Latest price of the asset in USD
  totalValue?: number; // Optional: Total value of this asset (amount * priceUSD)
  createdAt: string; // Prisma `DateTime` is stored as an ISO string in TypeScript
  updatedAt: string;
  portfolioPercentage?: string;
}
