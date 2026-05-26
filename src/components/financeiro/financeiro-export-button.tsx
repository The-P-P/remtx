"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FinanceiroExportButton({
  queryString,
}: {
  queryString: string;
}) {
  const href = `/api/financeiro/export?${queryString}`;

  return (
    <Button variant="outline" className="w-full sm:w-auto" render={<a href={href} download />}>
      <Download className="size-4" />
      Exportar CSV
    </Button>
  );
}
