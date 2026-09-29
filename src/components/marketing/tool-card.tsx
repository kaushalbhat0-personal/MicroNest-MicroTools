import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getProfession } from "@/content/microtools";
import type { Tool } from "@/content/microtools";

export function ToolCard({ tool }: { tool: Tool }) {
  const profession = getProfession(tool.profession);
  return (
    <Link href={tool.href} className="rounded-md border p-6 hover:bg-accent">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">{tool.name}</h3>
        <Badge variant={tool.status === "available" ? "default" : "outline"}>{tool.status === "available" ? "Available" : "Coming soon"}</Badge>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{tool.description}</p>
      <p className="mt-2 text-xs text-muted-foreground">{profession ? `${profession.name} → ${tool.name}` : tool.name}</p>
    </Link>
  );
}
