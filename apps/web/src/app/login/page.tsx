"use client";

import { Suspense, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { sendOtpAction, verifyOtpAction } from "@/app/actions/auth";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

const OTP_LENGTH = 6;

const inputClass =
  "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-amber-500";
const buttonClass =
  "press-scale rounded-md bg-amber-500 px-4 py-2 text-sm font-bold text-black transition-colors duration-150 hover:bg-amber-400 disabled:opacity-50";

// Six single-digit boxes that behave like the native OTP inputs users expect:
// auto-advance on type, backspace to the previous box, and full-code paste.
function OtpInput({
  value,
  onChange,
  onComplete,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onComplete: (v: string) => void;
  disabled?: boolean;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  function commit(next: string) {
    onChange(next);
    if (next.length === OTP_LENGTH) onComplete(next);
  }

  function onDigit(i: number, raw: string) {
    const digit = raw.replace(/\D/g, "").slice(-1);
    if (!digit) return;
    const arr = value.split("");
    arr[i] = digit;
    const next = arr.join("").slice(0, OTP_LENGTH);
    commit(next);
    if (i < OTP_LENGTH - 1) refs.current[i + 1]?.focus();
  }

  function onKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      const arr = value.split("");
      if (arr[i]) {
        arr[i] = "";
        onChange(arr.join(""));
      } else if (i > 0) {
        arr[i - 1] = "";
        onChange(arr.join(""));
        refs.current[i - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < OTP_LENGTH - 1) {
      refs.current[i + 1]?.focus();
    }
  }

  function onPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!digits) return;
    commit(digits);
    refs.current[Math.min(digits.length, OTP_LENGTH - 1)]?.focus();
  }

  return (
    <div className="flex justify-between gap-2" onPaste={onPaste}>
      {Array.from({ length: OTP_LENGTH }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          disabled={disabled}
          autoFocus={i === 0}
          value={value[i] ?? ""}
          onChange={(e) => onDigit(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          className="h-12 w-full rounded-md border border-slate-300 bg-white text-center text-lg font-semibold text-slate-900 outline-none focus:border-amber-500 disabled:opacity-50"
        />
      ))}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700"
    >
      {message}
    </div>
  );
}

function LoginForm() {
  const router = useRouter();

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData();
    formData.set("email", email);
    const result = await sendOtpAction(formData);
    setPending(false);

    if (!result.success) {
      setError(result.error);
      return;
    }
    setStep("code");
  }

  async function verify(token: string) {
    if (token.length !== 6 || pending) return;
    setError(null);
    setPending(true);

    const formData = new FormData();
    formData.set("email", email);
    formData.set("token", token);
    const result = await verifyOtpAction(formData);

    if (!result.success) {
      setPending(false);
      setError("Invalid or expired code. Please check the code and try again.");
      setCode("");
      return;
    }
    router.push("/account");
    router.refresh();
  }

  function onVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    verify(code);
  }

  return (
    <main className="mx-auto flex max-w-sm flex-col px-6 py-24">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          {step === "email" ? "Sign in or create an account" : "Enter verification code"}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {step === "email"
            ? "We'll email you a 6-digit code to verify it's you."
            : `We sent a 6-digit code to ${email}.`}
        </p>

        {step === "email" ? (
          <form onSubmit={onSendOtp} className="mt-6 flex flex-col gap-3">
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputClass}
            />
            <button type="submit" disabled={pending} className={buttonClass}>
              {pending ? "Sending…" : "Send code"}
            </button>
            {error && <ErrorBanner message={error} />}
          </form>
        ) : (
          <form onSubmit={onVerifyOtp} className="mt-6 flex flex-col gap-4">
            <OtpInput
              value={code}
              onChange={setCode}
              onComplete={verify}
              disabled={pending}
            />
            <button type="submit" disabled={pending || code.length !== 6} className={buttonClass}>
              {pending ? "Verifying…" : "Verify"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setCode("");
                setError(null);
              }}
              className="text-sm text-slate-500 underline hover:text-slate-700"
            >
              Use a different email
            </button>
            {error && <ErrorBanner message={error} />}
          </form>
        )}
      </div>
    </main>
  );
}
