"use client";

import { useTranslations } from "next-intl";
import { FormEvent, useState } from "react";

import { Link } from "@/i18n/navigation";

export default function ContactForm() {
  const t = useTranslations("Contact.form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSuccess("");
    setError("");

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();

    if (!cleanName || !cleanEmail || !cleanSubject || !cleanMessage) {
      setError(t("errorRequired"));
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      setError(t("errorEmail"));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          subject: cleanSubject,
          message: cleanMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("errorSend"));
      }

      setSuccess(t("success"));
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorSend"));
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/50 disabled:cursor-not-allowed disabled:opacity-60";
  const labelClass = "mb-2 block text-sm font-medium text-slate-300";

  return (
    <form onSubmit={handleSubmit} className="mt-7 space-y-5">
      <div>
        <label htmlFor="name" className={labelClass}>
          {t("name")}
        </label>

        <input
          id="name"
          name="name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={t("namePlaceholder")}
          autoComplete="name"
          required
          disabled={loading}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          {t("email")}
        </label>

        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={t("emailPlaceholder")}
          autoComplete="email"
          required
          disabled={loading}
          dir="ltr"
          className={inputClass + " text-start"}
        />
      </div>

      <div>
        <label htmlFor="subject" className={labelClass}>
          {t("subject")}
        </label>

        <select
          id="subject"
          name="subject"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          required
          disabled={loading}
          className={inputClass}
        >
          <option value="" disabled>
            {t("subjectPlaceholder")}
          </option>
          <option value="general">{t("subjectGeneral")}</option>
          <option value="support">{t("subjectSupport")}</option>
          <option value="privacy">{t("subjectPrivacy")}</option>
          <option value="feedback">{t("subjectFeedback")}</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          {t("message")}
        </label>

        <textarea
          id="message"
          name="message"
          rows={7}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={t("messagePlaceholder")}
          required
          disabled={loading}
          className={inputClass + " resize-none"}
        />
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm leading-6 text-rose-300"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm leading-6 text-emerald-300"
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 font-bold" aria-hidden="true">
              ✓
            </span>
            <span>{success}</span>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 via-violet-500 to-fuchsia-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
      >
        <span>{loading ? t("sending") : t("submit")}</span>
        <span aria-hidden="true">
          {loading ? "◌" : <span className="inline-block rtl:rotate-180">→</span>}
        </span>
      </button>

      <p className="text-center text-xs leading-5 text-slate-500">
        {t.rich("consent", {
          link: (chunks) => (
            <Link
              href="/privacy"
              className="font-semibold text-violet-300 transition hover:text-violet-200"
            >
              {chunks}
            </Link>
          ),
        })}
      </p>
    </form>
  );
}