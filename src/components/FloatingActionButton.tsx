"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import type { CryptoAsset } from "~/types/CryptoAsset"

export default function FloatingActionButton({ onAddAsset }: { onAddAsset: (asset: CryptoAsset) => void }) {
  const [open, setOpen] = useState(false)
  const [newAsset, setNewAsset] = useState<Partial<CryptoAsset>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newAsset.name && newAsset.symbol && newAsset.value && newAsset.percentage) {
      onAddAsset({
        id: Date.now(),
        name: newAsset.name,
        symbol: newAsset.symbol,
        value: Number(newAsset.value),
        percentage: Number(newAsset.percentage),
      })
      setNewAsset({})
      setOpen(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="fixed bottom-4 right-4 rounded-full w-16 h-16 bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90">
            <Plus className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle>Add New Asset</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newAsset.name || ""}
                onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                required
                className="dark:bg-gray-700"
              />
            </div>
            <div>
              <Label htmlFor="symbol">Symbol</Label>
              <Input
                id="symbol"
                value={newAsset.symbol || ""}
                onChange={(e) => setNewAsset({ ...newAsset, symbol: e.target.value })}
                required
                className="dark:bg-gray-700"
              />
            </div>
            <div>
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                type="number"
                value={newAsset.value || ""}
                onChange={(e) => setNewAsset({ ...newAsset, value: e.target.value })}
                required
                className="dark:bg-gray-700"
              />
            </div>
            <div>
              <Label htmlFor="percentage">Percentage</Label>
              <Input
                id="percentage"
                type="number"
                value={newAsset.percentage || ""}
                onChange={(e) => setNewAsset({ ...newAsset, percentage: e.target.value })}
                required
                className="dark:bg-gray-700"
              />
            </div>
            <Button type="submit">Add Asset</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

