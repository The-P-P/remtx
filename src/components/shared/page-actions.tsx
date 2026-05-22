import { cn } from "@/lib/utils";

export function PageActions({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap",
        className
      )}
    >
      {children}
    </div>
  );
}
