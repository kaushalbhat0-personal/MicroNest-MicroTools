import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 p-8 text-center">
      <Badge>Phase 0 — Bootstrap</Badge>
      <h1 className="text-4xl font-bold tracking-tight">NoticeFlow</h1>
      <p className="max-w-xl text-balance text-muted-foreground">
        Notice workflow management for CA firms. Receive → track → collect
        documents → draft → submit → close — without the spreadsheet chaos.
      </p>
      <p className="text-sm text-muted-foreground">
        Infrastructure bootstrap complete. Auth, tenancy, and workflow arrive in
        upcoming phases.
      </p>
      <Button>
        <a href="https://github.com" target="_blank" rel="noreferrer">
          Documentation
        </a>
      </Button>
    </main>
  );
}
