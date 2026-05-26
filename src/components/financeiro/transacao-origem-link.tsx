import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { TransacaoListItem } from "@/lib/actions/financeiro";

export function TransacaoOrigemLink({ t }: { t: TransacaoListItem }) {
  if (t.parcela?.locacao) {
    return (
      <Badge variant="outline" className="text-xs font-normal">
        <Link
          href={`/locacoes/${t.parcela.locacao.id}`}
          className="hover:underline"
        >
          Locação · {t.parcela.locacao.veiculo.placa}
        </Link>
      </Badge>
    );
  }
  if (t.manutencao) {
    return (
      <Badge variant="outline" className="text-xs font-normal">
        <Link href={`/manutencoes/${t.manutencao.id}/editar`} className="hover:underline">
          Manutenção · {t.manutencao.veiculo.placa}
        </Link>
      </Badge>
    );
  }
  if (t.locacao) {
    return (
      <Badge variant="outline" className="text-xs font-normal">
        <Link href={`/locacoes/${t.locacao.id}`} className="hover:underline">
          Contrato · {t.locacao.veiculo.placa}
        </Link>
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
      Manual
    </Badge>
  );
}
