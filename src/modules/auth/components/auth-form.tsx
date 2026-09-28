"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";

type FormState = { error?: string; fieldErrors?: Record<string, string[]> };
type AuthAction = (prev: FormState, fd: FormData) => Promise<FormState>;

export function AuthForm({ action, mode }: { action: AuthAction; mode: "signin" | "signup" }) {
  const [state, formAction, pending] = useActionState(action, {} as FormState);

  return (
    <form action={formAction} className="space-y-4">
      {mode === "signup" && (
        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <input id="name" name="name" className="w-full rounded-md border px-3 py-2 text-sm" placeholder="CA Firm" />
          {state?.fieldErrors?.name && <p className="text-sm text-red-600">{state.fieldErrors.name[0]}</p>}
        </div>
      )}
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input id="email" name="email" type="email" className="w-full rounded-md border px-3 py-2 text-sm" placeholder="ca@example.com" />
        {state?.fieldErrors?.email && <p className="text-sm text-red-600">{state.fieldErrors.email[0]}</p>}
      </div>
      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input id="password" name="password" type="password" className="w-full rounded-md border px-3 py-2 text-sm" />
        {state?.fieldErrors?.password && <p className="text-sm text-red-600">{state.fieldErrors.password[0]}</p>}
      </div>
      {state?.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} aria-busy={pending} className="w-full">
        {pending ? "Please wait..." : mode === "signup" ? "Create account" : "Sign in"}
      </Button>
    </form>
  );
}
