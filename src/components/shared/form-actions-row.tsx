import { cn } from "@/lib/utils";

export function FormActionsRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:items-center",
        className
      )}
    >
      {children}
    </div>
  );
}
