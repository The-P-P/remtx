import { Badge } from "@/components/ui/badge";
import { STATUS_VEICULO_LABEL, STATUS_VEICULO_STYLE } from "@/lib/constants/enums";
import type { StatusVeiculo } from "@/types/prisma";

export function StatusVeiculoBadge({ status }: { status: StatusVeiculo }) {
  return (
    <Badge className={STATUS_VEICULO_STYLE[status]}>
      {STATUS_VEICULO_LABEL[status]}
    </Badge>
  );
}
