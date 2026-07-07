"use client";

import { useState, useTransition } from "react";
import {
  updateOrderStatusAction,
  verifyOfflinePaymentAction,
  transferFundsAction,
} from "@/app/actions/adminOrders";
import DepositModal from "./deposit-modal";

function Spinner() {
  return (
    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
  );
}

export default function OrderActions({
  orderId,
  status,
  totalPrice,
  depositAmount,
  isFundsTransferred,
}: {
  orderId: string;
  status: string;
  totalPrice?: number | null;
  depositAmount?: number | null;
  isFundsTransferred?: boolean;
}) {
  const remainingBalance = Number(totalPrice ?? 0) - Number(depositAmount ?? 0);
  const [showDeposit, setShowDeposit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(fn: () => Promise<{ success: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.success) setError(res.error ?? "Action failed.");
    });
  }

  if (status === "pending_payment") {
    return (
      <div className="flex flex-col items-start gap-1.5">
        <button
          onClick={() => setShowDeposit(true)}
          className="w-full rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
        >
          Add Deposit
        </button>
        <button
          onClick={() => run(() => verifyOfflinePaymentAction(orderId))}
          disabled={pending}
          className="flex w-full items-center justify-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60"
        >
          {pending ? <Spinner /> : "Verify Offline Payment"}
        </button>
        {error && <p className="text-xs text-red-700">{error}</p>}

        {showDeposit && (
          <DepositModal
            orderId={orderId}
            remainingBalance={remainingBalance}
            onClose={() => setShowDeposit(false)}
          />
        )}
      </div>
    );
  }

  if (status === "paid_processing") {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex gap-2">
          <button
            onClick={() => run(() => updateOrderStatusAction(orderId, "exporting"))}
            disabled={pending}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60"
          >
            {pending ? <Spinner /> : "Mark as Exporting"}
          </button>
          <button
            onClick={() => run(() => updateOrderStatusAction(orderId, "completed"))}
            disabled={pending}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60"
          >
            Mark as Completed
          </button>
        </div>
        {isFundsTransferred ? (
          <button
            disabled
            className="cursor-default rounded-md border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-400"
          >
            Funds Transferred ✅
          </button>
        ) : (
          <button
            onClick={() => run(() => transferFundsAction(orderId))}
            disabled={pending}
            className="flex items-center justify-center gap-1 rounded-md border border-blue-600 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-60"
          >
            {pending ? <Spinner /> : "Transfer Total Amount to China"}
          </button>
        )}
        {error && <p className="text-xs text-red-700">{error}</p>}
      </div>
    );
  }

  if (status === "exporting") {
    return (
      <div>
        <button
          onClick={() => run(() => updateOrderStatusAction(orderId, "completed"))}
          disabled={pending}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60"
        >
          {pending ? <Spinner /> : "Mark as Completed"}
        </button>
        {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
      </div>
    );
  }

  return <span className="text-gray-400">—</span>;
}
