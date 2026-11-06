"use client";

import { useEffect, useRef } from "react";

/**
 * Individual-digit code input.
 *
 * Behaviour is what makes this feel premium, not the styling:
 *   - typing advances, backspace retreats, arrows move without editing;
 *   - a pasted code fills every box at once (the common case: copy from mail);
 *   - the group is a single tab stop, so keyboard users are not forced through
 *     six identical fields;
 *   - `dir` is inherited, so Arabic reads right-to-left like the rest of the UI.
 *
 * `length` is a prop, never a constant — it comes from the deployment's Supabase
 * configuration, not from the reference video.
 */

type Props = {
  value: string;
  onChange: (next: string) => void;
  onComplete?: (code: string) => void;
  length?: number;
  disabled?: boolean;
  invalid?: boolean;
  label: string;
  autoFocus?: boolean;
};

export function CodeInput({
  value,
  onChange,
  onComplete,
  length = 6,
  disabled = false,
  invalid = false,
  label,
  autoFocus = false,
}: Props) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (autoFocus && !disabled) refs.current[0]?.focus();
  }, [autoFocus, disabled]);

  /** Dense string: digits always pack from the start, no internal gaps. */
  const commit = (next: string) => {
    const clean = next.replace(/\D/g, "").slice(0, length);
    onChange(clean);
    if (clean.length === length) onComplete?.(clean);
  };

  const focusAt = (index: number) => {
    const clamped = Math.max(0, Math.min(length - 1, index));
    refs.current[clamped]?.focus();
  };

  const handleChange = (index: number, raw: string) => {
    const typed = raw.replace(/\D/g, "");
    if (!typed) return;

    if (typed.length > 1) {
      commit(typed);
      focusAt(typed.length);
      return;
    }

    const chars = value.split("");
    chars[index] = typed;
    // Fill any hole left by a mid-string edit so the display stays dense.
    commit(chars.join("").replace(/\s/g, ""));
    focusAt(index + 1);
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      const chars = value.split("");
      if (chars[index]) {
        // Clear this position, keep the rest where they are.
        chars.splice(index, 1);
        commit(chars.join(""));
        focusAt(index);
      } else {
        chars.splice(Math.max(0, index - 1), 1);
        commit(chars.join(""));
        focusAt(index - 1);
      }
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusAt(index - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusAt(index + 1);
    }
  };

  const handlePaste = (event: React.ClipboardEvent) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text");
    commit(pasted);
    focusAt(pasted.replace(/\D/g, "").length);
  };

  const chars = value.split("");

  return (
    <div
      role="group"
      aria-label={label}
      data-invalid={invalid ? "" : undefined}
      className={`code-input ${invalid ? "is-invalid" : ""}`}
    >
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(node) => {
            refs.current[index] = node;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          tabIndex={index === 0 ? 0 : -1}
          maxLength={1}
          aria-label={`${label} ${index + 1}`}
          aria-invalid={invalid || undefined}
          disabled={disabled}
          value={chars[index] ?? ""}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          className="code-cell"
          style={{ animationDelay: `${index * 42}ms` }}
        />
      ))}
    </div>
  );
}
