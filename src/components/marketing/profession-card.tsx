import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Profession } from "@/content/microtools";
import { Reveal } from "@/components/marketing/reveal";

export function ProfessionCard({ profession, delayMs }: { profession: Profession; delayMs?: number }) {
  return (
    <Link href={`/profession/${profession.slug}`} className="mn-card rounded-md border bg-background hover:bg-muted hover:border-foreground/30">
      <Reveal delayMs={delayMs} className="p-6">
        <h3 className="text-lg font-semibold">{profession.name}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{profession.description}</p>
        <div className="mt-3 flex items-center gap-2">
          <Badge variant="outline">{profession.tools.length} tools</Badge>
          <span className="text-sm text-muted-foreground">→ View tools</span>
        </div>
      </Reveal>
    </Link>
  );
}
