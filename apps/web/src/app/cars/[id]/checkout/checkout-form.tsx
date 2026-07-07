"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Tesseract from "tesseract.js";
import { createClient } from "@/utils/supabase/client";
import { reserveCarAction } from "@/app/actions/reserve";

type Car = {
  id: string;
  make: string;
  model: string;
  year: number;
  price_cny: number | null;
};

const STEPS = ["Personal Information", "Logistics & Details", "Document Upload"] as const;
const ACCEPTED_FILE_TYPES = ".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg";

function formatPrice(price: number | null) {
  if (price == null) return "Price on request";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function CheckoutForm({ car, userEmail }: { car: Car; userEmail: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [contactPlatform, setContactPlatform] = useState<"WhatsApp" | "Telegram">("WhatsApp");
  const [contactHandle, setContactHandle] = useState("");

  const [destinationCountryPort, setDestinationCountryPort] = useState("");
  const [depositDate, setDepositDate] = useState("");
  const [salesRepCode, setSalesRepCode] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Client-side KYC gate: OCR the uploaded image and only accept it if it looks
  // like a passport/national ID. Keeps obvious garbage (blank/random photos) out
  // before we ever upload to Supabase. PDFs can't be OCR'd in-browser without a
  // renderer, so they pass through unscanned.
  async function onDocSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setDocError(null);
    if (!f) {
      setFile(null);
      return;
    }
    if (f.type === "application/pdf") {
      setFile(f);
      return;
    }

    setFile(null);
    setScanning(true);
    try {
      const {
        data: { text },
      } = await Tesseract.recognize(f, "eng");
      const t = text.toLowerCase();
      const keywords = ["passport", "passeport", "id", "identity", "national", "republique"];
      const hasKeyword = keywords.some((w) => new RegExp(`\\b${w}\\b`).test(t));
      const hasMrz = t.includes("<<<") || t.includes("p<");

      if (hasKeyword || hasMrz) {
        setFile(f);
      } else {
        setDocError(
          "Invalid document detected. Please upload a clear photo of your Passport or National ID.",
        );
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch {
      setDocError("Could not scan the document. Please try again with a clearer image.");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setScanning(false);
    }
  }

  const step1Valid = fullName.trim() !== "" && phoneNumber.trim() !== "" && contactHandle.trim() !== "";
  const step2Valid = destinationCountryPort.trim() !== "" && depositDate.trim() !== "";
  const step3Valid = file !== null && agreed;

  function next() {
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function back() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setError(null);
    setPending(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/login?next=/cars/${car.id}/checkout`);
        return;
      }

      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("passports")
        .upload(path, file, { contentType: file.type });
      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      const result = await reserveCarAction(car.id, {
        fullName,
        phoneNumber,
        whatsappTelegram: `${contactPlatform}: ${contactHandle}`,
        destinationCountryPort,
        depositDate,
        salesRepCode: salesRepCode.trim() || undefined,
        passportUrl: path,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push(`/orders/confirmation?id=${result.orderId}`);
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-gray-900">Reserve your vehicle</h1>
      <p className="mt-1 text-gray-600">
        {car.year} {car.make} {car.model} — {formatPrice(car.price_cny)}
      </p>

      <ol className="mt-8 flex items-center gap-2 text-sm">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                i <= step ? "bg-amber-500 text-black" : "bg-gray-200 text-gray-500"
              }`}
            >
              {i + 1}
            </span>
            <span className={i === step ? "font-medium text-gray-900" : "text-gray-400"}>
              {label}
            </span>
            {i < STEPS.length - 1 && <span className="ml-2 h-px flex-1 bg-gray-200" />}
          </li>
        ))}
      </ol>

      <form onSubmit={onSubmit} className="mt-10 rounded-2xl border border-gray-200 p-8">
        {step === 0 && (
          <div className="flex flex-col gap-4">
            <Field label="Full Name">
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClass}
                placeholder="Jane Doe"
              />
            </Field>
            <Field label="Email">
              <input value={userEmail} disabled className={`${inputClass} bg-gray-50 text-gray-500`} />
            </Field>
            <Field label="Phone Number">
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className={inputClass}
                placeholder="+1234567890"
              />
            </Field>
            <Field label="Alternative Contact">
              <div className="flex gap-2">
                <select
                  value={contactPlatform}
                  onChange={(e) => setContactPlatform(e.target.value as "WhatsApp" | "Telegram")}
                  className={`${inputClass} w-36`}
                >
                  <option>WhatsApp</option>
                  <option>Telegram</option>
                </select>
                <input
                  required
                  value={contactHandle}
                  onChange={(e) => setContactHandle(e.target.value)}
                  className={inputClass}
                  placeholder="Number or @handle"
                />
              </div>
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <Field label="Destination Country & Port">
              <input
                required
                value={destinationCountryPort}
                onChange={(e) => setDestinationCountryPort(e.target.value)}
                className={inputClass}
                placeholder="e.g. Nigeria — Lagos Port"
              />
            </Field>
            <Field label="Intended Deposit Date">
              <input
                type="date"
                required
                min={new Date().toISOString().slice(0, 10)}
                value={depositDate}
                onChange={(e) => setDepositDate(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Sales Rep / Promo Code (optional)">
              <input
                value={salesRepCode}
                onChange={(e) => setSalesRepCode(e.target.value)}
                className={inputClass}
                placeholder="Optional"
              />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <Field label="Passport / ID Document (PDF, PNG, or JPEG)">
              <input
                ref={fileInputRef}
                type="file"
                required
                accept={ACCEPTED_FILE_TYPES}
                onChange={onDocSelect}
                disabled={scanning}
                className={inputClass}
              />
            </Field>
            {scanning && (
              <p className="text-sm text-amber-600">Scanning document for validity…</p>
            )}
            {file && !scanning && (
              <p className="text-sm text-emerald-600">Document verified ✓</p>
            )}
            {docError && (
              <div
                role="alert"
                className="rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700"
              >
                {docError}
              </div>
            )}
            <label className="flex items-start gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5"
              />
              I agree to the policy, service conditions, and rules of the auto brokerage
              platform.
            </label>
          </div>
        )}

        {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

        <div className="mt-8 flex justify-between">
          {step > 0 ? (
            <button
              type="button"
              onClick={back}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
          ) : (
            <span />
          )}

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={next}
              disabled={step === 0 ? !step1Valid : !step2Valid}
              className="rounded-md bg-amber-500 px-6 py-2 text-sm font-bold text-black hover:bg-amber-400 disabled:opacity-50"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={!step3Valid || pending}
              className="rounded-md bg-amber-500 px-6 py-2 text-sm font-bold text-black hover:bg-amber-400 disabled:opacity-50"
            >
              {pending ? "Securing your car…" : "Reserve Car"}
            </button>
          )}
        </div>
      </form>
    </main>
  );
}

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}
