import Link from "next/link";
import { signInAction } from "@/modules/auth/actions/sign-in";
import { AuthForm } from "@/modules/auth/components/auth-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold">Sign in to NoticeFlow</h1>
        <p className="text-sm text-muted-foreground">Indian CA notice workflow.</p>
      </div>
      <AuthForm action={signInAction} mode="signin" />
      <p className="text-center text-sm">
        No account? <Link href="/signup" className="underline">Sign up</Link>
      </p>
    </main>
  );
}
