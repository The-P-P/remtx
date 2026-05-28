"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = useMemo(
    () => `${pathname}?${searchParams.toString()}`,
    [pathname, searchParams]
  );
  const [progressVisible, setProgressVisible] = useState(false);

  useEffect(() => {
    setProgressVisible(true);
    const timer = window.setTimeout(() => setProgressVisible(false), 760);
    return () => window.clearTimeout(timer);
  }, [routeKey]);

  return (
    <>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none fixed left-0 right-0 top-0 z-[70] h-[3px] origin-left bg-gradient-to-r from-primary/35 via-primary to-primary/35 transition-opacity duration-250",
          progressVisible
            ? "animate-route-progress opacity-100"
            : "opacity-0"
        )}
      />
      <div key={routeKey} className="animate-route-enter will-change-transform">
        {children}
      </div>
    </>
  );
}

