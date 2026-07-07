"use client";

import { useState } from "react";
import { updateProfileAction } from "@/app/actions/account";

export default function ProfileForm({
  email,
  phoneWhatsapp,
}: {
  email: string;
  phoneWhatsapp: string;
}) {
  const [value, setValue] = useState(phoneWhatsapp);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setPending(true);

    const formData = new FormData();
    formData.set("phone_whatsapp", value);
    const result = await updateProfileAction(formData);
    setPending(false);

    if (!result.success) {
      setError(result.error);
      return;
    }
    setSaved(true);
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-slate-700">Email</span>
        <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
          {email}
        </p>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-slate-700">Phone / WhatsApp</span>
        <input
          type="tel"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setSaved(false);
          }}
          placeholder="+213 555 123 456"
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-amber-500"
        />
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="press-scale rounded-md bg-amber-500 px-5 py-2 text-sm font-bold text-black transition-colors duration-150 hover:bg-amber-400 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        {saved && <span className="text-sm text-emerald-600">Saved ✓</span>}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </form>
  );
}
