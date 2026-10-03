"use client";

import {
  FormEvent,
  useState,
} from "react";

export default function ContactForm() {
  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [subject, setSubject] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState("");

  const [error, setError] =
    useState("");


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSuccess("");
    setError("");

    const cleanName =
      name.trim();

    const cleanEmail =
      email.trim();

    const cleanSubject =
      subject.trim();

    const cleanMessage =
      message.trim();


    if (
      !cleanName ||
      !cleanEmail ||
      !cleanSubject ||
      !cleanMessage
    ) {
      setError(
        "Please complete all fields."
      );

      return;
    }


    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailPattern.test(cleanEmail)
    ) {
      setError(
        "Please enter a valid email address."
      );

      return;
    }


    setLoading(true);


    try {
      const response =
        await fetch("/api/contact", {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name: cleanName,
            email: cleanEmail,
            subject: cleanSubject,
            message: cleanMessage,
          }),
        });


      const data =
        await response.json();


      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to send your message."
        );
      }


      setSuccess(
        "Your message has been sent successfully. Thank you for contacting LifeSeos."
      );


      setName("");
      setEmail("");
      setSubject("");
      setMessage("");

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send your message."
      );

    } finally {
      setLoading(false);
    }
  }


  return (
    <form
      onSubmit={handleSubmit}
      className="mt-7 space-y-5"
    >

      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-medium text-slate-300"
        >
          Name
        </label>

        <input
          id="name"
          name="name"
          type="text"
          value={name}
          onChange={(event) =>
            setName(
              event.target.value
            )
          }
          placeholder="Your name"
          autoComplete="name"
          disabled={loading}
          className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/50 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>


      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-slate-300"
        >
          Email
        </label>

        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(
              event.target.value
            )
          }
          placeholder="you@example.com"
          autoComplete="email"
          disabled={loading}
          className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/50 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>


      <div>
        <label
          htmlFor="subject"
          className="mb-2 block text-sm font-medium text-slate-300"
        >
          Subject
        </label>

        <select
          id="subject"
          name="subject"
          value={subject}
          onChange={(event) =>
            setSubject(
              event.target.value
            )
          }
          disabled={loading}
          className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3.5 text-sm text-white outline-none transition focus:border-violet-400/50 disabled:cursor-not-allowed disabled:opacity-60"
        >

          <option
            value=""
            disabled
          >
            Select a topic
          </option>

          <option value="general">
            General Question
          </option>

          <option value="support">
            Technical Support
          </option>

          <option value="privacy">
            Privacy Request
          </option>

          <option value="feedback">
            Feedback
          </option>

        </select>
      </div>


      <div>
        <label
          htmlFor="message"
          className="mb-2 block text-sm font-medium text-slate-300"
        >
          Message
        </label>

        <textarea
          id="message"
          name="message"
          rows={7}
          value={message}
          onChange={(event) =>
            setMessage(
              event.target.value
            )
          }
          placeholder="Tell us how we can help..."
          disabled={loading}
          className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/50 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>


      {error && (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm leading-6 text-rose-300">
          {error}
        </div>
      )}


      {success && (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm leading-6 text-emerald-300">
          <div className="flex items-start gap-3">

            <span className="mt-0.5 font-bold">
              ✓
            </span>

            <span>
              {success}
            </span>

          </div>
        </div>
      )}


      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 via-violet-500 to-fuchsia-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
      >

        <span>
          {loading
            ? "Sending..."
            : "Send Message"}
        </span>

        <span>
          {loading
            ? "◌"
            : "→"}
        </span>

      </button>


      <p className="text-center text-xs leading-5 text-slate-600">
        Your message will be securely
        submitted to LifeSeos.
      </p>

    </form>
  );
}
