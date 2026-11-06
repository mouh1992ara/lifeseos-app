"use client";

/**
 * The success state from the reference video: the input group is replaced by a
 * single rounded square that scales in, a checkmark that draws itself, and a
 * soft emerald wash behind it — then the copy fades up in two beats.
 *
 * Rendering rule enforced by callers: this component is only mounted after
 * Supabase has confirmed the address. It never renders on optimism, a timer, or
 * a client-side flag, because a verification animation that lies is worse than
 * no animation at all.
 *
 * Motion is CSS-only (the project has no animation library and does not need
 * one for this), and `.verify-*` respects `prefers-reduced-motion`.
 */

export function VerifySuccess({
  title,
  body,
  footnote,
}: {
  title: string;
  body: string;
  footnote?: string;
}) {
  return (
    <div className="verify-success" role="status" aria-live="polite">
      <span aria-hidden="true" className="verify-wash" />

      <div className="verify-badge-wrap">
        <span aria-hidden="true" className="verify-ring" />
        <div className="verify-badge">
          <svg viewBox="0 0 52 52" className="verify-check" aria-hidden="true">
            <path d="M14 27.2 22.2 35.4 38.4 19.2" fill="none" />
          </svg>
        </div>
      </div>

      <h2 className="verify-title">{title}</h2>
      <p className="verify-body">{body}</p>
      {footnote ? <p className="verify-footnote">{footnote}</p> : null}
    </div>
  );
}
