import Link from "next/link";
import { Eye, Pencil, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { getClientes } from "@/lib/actions/clientes";
import { formatCpfDisplay, formatTelefoneDisplay } from "@/lib/format/br";

type ClienteItem = Awaited<ReturnType<typeof getClientes>>[number];

export function ClientesList({ clientes }: { clientes: ClienteItem[] }) {
  if (clientes.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhum cliente encontrado.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {clientes.map((c) => (
        <Card key={c.id}>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold truncate">{c.nome}</p>
                <p className="text-sm text-muted-foreground">
                  {formatCpfDisplay(c.cpf)}
                </p>
              </div>
              <div className="flex shrink-0 gap-0.5">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  render={<Link href={`/clientes/${c.id}`} />}
                >
                  <Eye className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  render={<Link href={`/clientes/${c.id}/editar`} />}
                >
                  <Pencil className="size-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm">{formatTelefoneDisplay(c.telefone)}</p>
            <p className="text-xs text-muted-foreground">
              {c._count.locacoes} locação(ões)
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              render={
                <Link href={`/clientes/${c.id}/locacoes/nova`} />
              }
            >
              <Calendar className="size-4" />
              Nova locação
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
