"use client";

import { useRouter } from "next/navigation";

export default function ReserveButton({
  carId,
  isAuthenticated,
}: {
  carId: string;
  isAuthenticated: boolean;
}) {
  const router = useRouter();

  function onReserve() {
    if (!isAuthenticated) {
      router.push(`/login?next=/cars/${carId}/checkout`);
      return;
    }
    router.push(`/cars/${carId}/checkout`);
  }

  return (
    <button
      onClick={onReserve}
      className="press-scale w-full rounded-md bg-amber-500 px-6 py-4 text-base font-bold text-black transition-colors duration-150 hover:bg-amber-400 disabled:opacity-50"
    >
      {isAuthenticated ? "Réserver ce véhicule" : "Se connecter pour réserver"}
    </button>
  );
}
