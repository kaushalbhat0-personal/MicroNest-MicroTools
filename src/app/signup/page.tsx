import Link from "next/link";
import { signUpAction } from "@/modules/auth/actions/sign-up";
import { AuthForm } from "@/modules/auth/components/auth-form";

export default function SignUpPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <p className="text-sm text-muted-foreground">Start your firm workspace.</p>
      </div>
      <AuthForm action={signUpAction} mode="signup" />
      <p className="text-center text-sm">
        Have an account? <Link href="/login" className="underline">Sign in</Link>
      </p>
    </main>
  );
}
