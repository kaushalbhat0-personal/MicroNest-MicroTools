import Link from "next/link";
import * as React from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
};

export function PageHeader({ title, description, action, backHref, backLabel = "Back" }: PageHeaderProps) {
  return (
    <div className="space-y-2">
      {backHref && (
        <Link href={backHref} className="text-sm text-muted-foreground underline">
          ← {backLabel}
        </Link>
      )}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
