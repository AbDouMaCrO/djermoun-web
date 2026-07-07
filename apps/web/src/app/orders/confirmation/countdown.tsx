"use client";

import { useEffect, useState } from "react";

function remaining(expiresAt: number) {
  const ms = expiresAt - Date.now();
  if (ms <= 0) return null;
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  return { days, hours, minutes };
}

export default function Countdown({ expiresAt }: { expiresAt: string }) {
  const target = new Date(expiresAt).getTime();
  const [left, setLeft] = useState(() => remaining(target));

  useEffect(() => {
    const t = setInterval(() => setLeft(remaining(target)), 60_000);
    return () => clearInterval(t);
  }, [target]);

  if (!left) {
    return <span className="font-semibold text-red-700">Reservation expired</span>;
  }

  return (
    <span className="font-semibold">
      {left.days} days, {left.hours} hours, {left.minutes} minutes remaining
    </span>
  );
}
