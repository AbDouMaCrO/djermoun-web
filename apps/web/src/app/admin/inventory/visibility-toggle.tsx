"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toggleCarVisibility } from "@/app/actions/inventory";

export default function VisibilityToggle({
  carId,
  isVisible,
}: {
  carId: string;
  isVisible: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onToggle() {
    startTransition(async () => {
      await toggleCarVisibility(carId, isVisible);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={pending}
      aria-label={isVisible ? "Hide from site" : "Show on site"}
      className={`press-scale rounded-md border p-1.5 transition-colors duration-150 disabled:opacity-50 ${
        isVisible
          ? "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
          : "border-slate-300 text-slate-500 hover:bg-slate-100"
      }`}
    >
      {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
    </button>
  );
}
