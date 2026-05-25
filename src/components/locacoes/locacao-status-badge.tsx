import { Badge } from "@/components/ui/badge";
import {
  STATUS_LOCACAO_LABEL,
  STATUS_LOCACAO_STYLE,
} from "@/lib/constants/enums";
import type { StatusLocacao } from "@/types/prisma";

export function LocacaoStatusBadge({ status }: { status: StatusLocacao }) {
  return (
    <Badge variant="outline" className={STATUS_LOCACAO_STYLE[status]}>
      {STATUS_LOCACAO_LABEL[status]}
    </Badge>
  );
}
