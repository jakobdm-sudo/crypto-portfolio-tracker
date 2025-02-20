import { Plus } from "lucide-react";
import { Button } from "./button";

export default function FAB() {
  return (
    <Button className="h-6 w-6 rounded-full p-0 shadow-lg">
      <Plus className="scale-[1] text-white" strokeWidth={1.5} />
    </Button>
  );
}
