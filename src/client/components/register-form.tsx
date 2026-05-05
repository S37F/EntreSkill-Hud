"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const intent = fd.get("intent") === "mentor" ? "mentor" : "learn";
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: fd.get("email"),
        password: fd.get("password"),
        name: fd.get("name"),
        intent,
      }),
    });
    setPending(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Registration failed.");
      return;
    }
    router.push("/login?registered=1");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Create your account</h1>
        <p className="mt-1 text-sm text-slate-600">Join EntreSkill Hub — free to start.</p>
      </div>
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}
      <label className="block text-sm font-medium text-slate-700">
        Name (optional)
        <input
          name="name"
          type="text"
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-inner outline-none focus:border-emerald-600"
        />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-inner outline-none focus:border-emerald-600"
        />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Password (at least 8 characters)
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-inner outline-none focus:border-emerald-600"
        />
      </label>
      <fieldset className="space-y-2 text-sm">
        <legend className="font-medium text-slate-700">I want to join as:</legend>
        <label className="flex cursor-pointer gap-2">
          <input type="radio" name="intent" value="learn" defaultChecked />
          Learner building a micro-business
        </label>
        <label className="flex cursor-pointer gap-2">
          <input type="radio" name="intent" value="mentor" />
          Mentor / trainer offering guidance (pending verification)
        </label>
      </fieldset>
      <button
        disabled={pending}
        type="submit"
        className="w-full rounded-lg bg-emerald-700 py-2 font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Register"}
      </button>
      <p className="text-center text-sm text-slate-600">
        Already registered?{" "}
        <Link className="font-medium text-emerald-800 underline" href="/login">
          Log in
        </Link>
      </p>
    </form>
  );
}
