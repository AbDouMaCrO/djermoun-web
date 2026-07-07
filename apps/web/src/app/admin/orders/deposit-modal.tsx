"use client";

import { useState, useTransition } from "react";
import { addDepositAction } from "@/app/actions/adminOrders";

export default function DepositModal({
  orderId,
  remainingBalance,
  onClose,
}: {
  orderId: string;
  remainingBalance: number;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    startTransition(async () => {
      const res = await addDepositAction(orderId, n);
      if (!res.success) setError(res.error);
      else onClose();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-gray-900">New Deposit Amount</h2>

        <div className="mt-4 flex items-center rounded-md border border-gray-300 px-3 focus-within:border-gray-900">
          <span className="text-sm text-gray-500">¥</span>
          <input
            type="number"
            step="0.01"
            min="0"
            max={remainingBalance}
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-2 py-2 text-sm outline-none"
          />
        </div>

        <p className="mt-1.5 text-xs text-gray-500">
          Remaining Balance: ¥{remainingBalance.toLocaleString()}
        </p>

        {error && <p className="mt-2 text-sm text-red-700">{error}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={pending}
            className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={pending}
            className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-green-700 disabled:opacity-60"
          >
            {pending && (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            Save Deposit
          </button>
        </div>
      </div>
    </div>
  );
}
