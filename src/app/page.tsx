import CryptoPortfolio from "~/components/CryptoPortfolio"
import { ThemeToggle } from "~/components/theme-toggle"

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Crypto Portfolio</h1>
        <ThemeToggle />
      </div>
      <CryptoPortfolio />
    </main>
  )
}

