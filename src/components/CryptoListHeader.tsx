import { Pencil, Settings2, GripVertical } from "lucide-react";


export default function CryptoListHeader() {
  return (
    <div className="flex flex-row justify-end items-center gap-2">
      <button className="bg-primary rounded-lg p-2">
        <Pencil className="w-4 h-4" />
      </button>
      <button className="bg-primary rounded-lg p-2">
        <Settings2 className="w-4 h-4" />
      </button>

    </div>
  );
}
