import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Combobox } from "~/components/ui/combobox";

interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
}

export default function FloatingActionButton() {
  const [open, setOpen] = useState(false);
  const [cryptoList, setCryptoList] = useState<
    { label: string; value: string; priceUSD: number }[]
  >([]);
  const [selectedCrypto, setSelectedCrypto] = useState("");
  const [amount, setAmount] = useState("");

  const utils = api.useUtils();
  const addAssetMutation = api.assets.addAsset.useMutation({
    onMutate: async (newAsset) => {
      await utils.assets.getAssets.cancel();
      const previousAssets = utils.assets.getAssets.getData();

      utils.assets.getAssets.setData(undefined, (old) => {
        const optimisticAsset = {
          ...newAsset,
          id: Math.random(),
          userId: "",
          totalValue: newAsset.amount * (newAsset.priceUSD ?? 0),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        return old ? [...old, optimisticAsset] : [optimisticAsset];
      });

      setOpen(false);
      return { previousAssets };
    },
    onError: (err, newAsset, context) => {
      utils.assets.getAssets.setData(undefined, context?.previousAssets);
      setOpen(true);
    },
    onSettled: () => {
      void utils.assets.getAssets.invalidate();
    },
  });

  useEffect(() => {
    async function fetchCryptoList() {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1",
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const data: CryptoData[] = await res.json();

        console.log("data", data);

        setCryptoList(
          data.map((coin) => ({
            label: `${coin.name} (${coin.symbol.toUpperCase()})`,
            value: coin.id,
            priceUSD: coin.current_price,
          })),
        )
      } catch (error) {
        console.error("Error fetching crypto list:", error);
        setCryptoList([]);
      }
    }

    fetchCryptoList();
  }, []);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow empty string for better UX
    if (value === "" || value === "0" || value === ".") {
      setAmount(value);
      return;
    }

    // Allow valid decimal numbers
    const number = parseFloat(value);
    if (!isNaN(number) && number >= 0) {
      setAmount(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCrypto) return;

    const selected = cryptoList.find((c) => c.value === selectedCrypto);
    if (!selected) return;

    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount) && numAmount > 0) {
      addAssetMutation.mutate({
        name: selected.label.split(" (")[0] ?? "", // Get just the name part
        symbol: selected.label.split(" (")[1]?.replace(")", "") ?? "", // Get symbol part
        amount: numAmount,
        priceUSD: selected.priceUSD, // Include the price
      });
      setAmount("");
      setSelectedCrypto("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="fixed bottom-4 right-4 h-16 w-16 rounded-full p-0 shadow-lg">
          <Plus
            className="scale-[1.5] transform text-white"
            strokeWidth={1.75}
          />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Asset</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="crypto">Select Cryptocurrency</Label>
            <Combobox
              options={cryptoList.map(({ label, value }) => ({ label, value }))}
              value={selectedCrypto}
              onChange={setSelectedCrypto}
            />
          </div>

          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="text"
              placeholder="Amount"
              value={amount}
              onChange={handleAmountChange}
              className="mt-2"
            />
          </div>

          <Button
            type="submit"
            disabled={!selectedCrypto || !amount || addAssetMutation.isLoading}
          >
            {addAssetMutation.isLoading ? "Adding..." : "Add Asset"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
