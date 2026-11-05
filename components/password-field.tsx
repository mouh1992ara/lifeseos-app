"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

/**
 * Shared password field: one input plus a show/hide control.
 *
 * The toggle is a real button with `aria-pressed`, so a screen-reader user
 * hears the current state rather than just "eye icon". The input keeps
 * `autoComplete` from the caller — revealing the text must not change what the
 * browser will fill.
 */
export default function PasswordField({
  id,
  value,
  onChange,
  label,
  placeholder,
  autoComplete,
  invalid = false,
  describedBy,
  children,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  autoComplete?: string;
  invalid?: boolean;
  describedBy?: string;
  /** Extra content rendered under the input (strength meter, hints). */
  children?: React.ReactNode;
}) {
  const t = useTranslations("Auth.common");
  const [shown, setShown] = useState(false);

  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-[13px] font-medium text-slate-300">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={shown ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          dir="ltr"
          required
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className="field pe-11 text-start"
        />

        <button
          type="button"
          onClick={() => setShown((s) => !s)}
          aria-pressed={shown}
          aria-label={t(shown ? "hidePassword" : "showPassword")}
          className="absolute end-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-200"
        >
          {shown ? (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8" />
              <path d="M6.7 6.7C4.6 8.1 3 10 2 12c2 4 5.6 7 10 7 1.6 0 3.1-.4 4.4-1.1M17.3 17.3C19.4 15.9 21 14 22 12c-2-4-5.6-7-10-7-.7 0-1.4.1-2 .2" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>

      {children}
    </div>
  );
}