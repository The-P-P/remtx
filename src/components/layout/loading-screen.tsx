import { Car } from "lucide-react";

export function LoadingScreen({
  message = "Carregando...",
}: {
  message?: string;
}) {
  return (
    <div className="flex min-h-[72vh] items-center justify-center">
      <div className="relative flex flex-col items-center gap-6">
        <div className="relative flex size-28 items-center justify-center">
          <span className="absolute inline-flex size-28 animate-ping rounded-full bg-primary/15" />
          <span className="absolute inline-flex size-20 animate-pulse rounded-full bg-primary/20" />
          <span className="relative inline-flex size-16 items-center justify-center rounded-full border border-primary/25 bg-card shadow-xl shadow-primary/20">
            <Car className="size-8 text-primary" />
          </span>
        </div>
        <p className="text-lg font-semibold tracking-tight text-muted-foreground">
          {message}
        </p>
      </div>
    </div>
  );
}

