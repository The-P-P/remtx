import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  action?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  backHref,
  action,
}: PageHeaderProps) {
  return (
    <div className="mb-1 min-w-0 max-w-full rounded-2xl border border-border/60 bg-card/75 p-4 shadow-sm backdrop-blur sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        {backHref && (
          <Button
            variant="outline"
            size="icon"
            render={<Link href={backHref} />}
            className="shrink-0"
          >
            <ArrowLeft className="size-4" />
          </Button>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold tracking-tight break-words sm:text-2xl">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground break-words">
              {description}
            </p>
          )}
        </div>
      </div>
      {action && <div className="w-full shrink-0 sm:w-auto">{action}</div>}
      </div>
    </div>
  );
}
