import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Settings } from "lucide-react";
import { getManutencoes, getTiposManutencao } from "@/lib/actions/manutencoes";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ALERTA_LABEL } from "@/lib/constants/enums";
import { ALERTA_CORES } from "@/lib/manutencao-alerts";
import { formatKm, formatCurrency } from "@/lib/utils";
import type { AlertaManutencao } from "@/types/prisma";

export default async function ManutencoesPage() {
  const [manutencoes, tipos] = await Promise.all([
    getManutencoes(),
    getTiposManutencao(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manutenções"
        description="Registro de manutenções, peças por revisão e alertas automáticos"
        action={
          <div className="flex flex-wrap gap-2">
            <Button render={<Link href="/manutencoes/nova" />}>
              <Plus className="size-4" />
              Nova manutenção
            </Button>
            <Button variant="outline" render={<Link href="/manutencoes/tipos/nova" />}>
              <Settings className="size-4" />
              Novo tipo
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="historico">
        <TabsList>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="tipos">Tipos e peças padrão</TabsTrigger>
        </TabsList>

        <TabsContent value="historico" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Veículo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Km</TableHead>
                    <TableHead>Próxima</TableHead>
                    <TableHead>Peças</TableHead>
                    <TableHead>Alerta</TableHead>
                    <TableHead>Custo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {manutencoes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                        Nenhuma manutenção registrada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    manutencoes.map((m) => {
                      const estilo = ALERTA_CORES[m.alerta as AlertaManutencao];
                      return (
                        <TableRow key={m.id}>
                          <TableCell>
                            {format(m.dataRealizada, "dd/MM/yyyy", { locale: ptBR })}
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/veiculos/${m.veiculoId}`}
                              className="font-medium hover:underline"
                            >
                              {m.veiculo.placa}
                            </Link>
                            <span className="block text-xs text-muted-foreground">
                              {m.veiculo.marca} {m.veiculo.modelo}
                            </span>
                          </TableCell>
                          <TableCell>{m.tipoManutencao.nome}</TableCell>
                          <TableCell>{formatKm(m.kmRealizada)}</TableCell>
                          <TableCell>{formatKm(m.kmProxima)}</TableCell>
                          <TableCell>
                            <ul className="text-xs">
                              {m.pecas.map((p) => (
                                <li key={p.id}>
                                  {p.quantidade}x {p.nome}
                                </li>
                              ))}
                            </ul>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${estilo.bg} ${estilo.text} border ${estilo.border}`}>
                              {ALERTA_LABEL[m.alerta as AlertaManutencao]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {m.custo ? formatCurrency(Number(m.custo)) : "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tipos" className="mt-4">
          <p className="mb-4 text-sm text-muted-foreground">
            Catálogo com {tipos.length} tipos de manutenção preventiva para hatch, sedan e
            compactos populares no Brasil (Onix, Gol, Argo, HB20, Polo, Kwid, Corolla, etc.).
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {tipos.length === 0 ? (
              <p className="text-muted-foreground">
                Nenhum tipo cadastrado. Execute{" "}
                <code className="text-xs">npm run db:seed:tipos</code>.
              </p>
            ) : (
              tipos.map((t) => (
                <Card key={t.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{t.nome}</CardTitle>
                    {t.descricao && (
                      <p className="text-sm text-muted-foreground">{t.descricao}</p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm">
                      Intervalo:{" "}
                      <strong>{t.intervaloKm.toLocaleString("pt-BR")} km</strong>
                    </p>
                    <div>
                      <p className="mb-2 text-xs font-medium text-muted-foreground">
                        Peças padrão:
                      </p>
                      {t.pecasPadrao.length === 0 ? (
                        <p className="text-xs text-muted-foreground">Nenhuma peça definida</p>
                      ) : (
                        <ul className="space-y-1 text-sm">
                          {t.pecasPadrao.map((p) => (
                            <li key={p.id} className="flex justify-between">
                              <span>{p.nome}</span>
                              <span className="text-muted-foreground">x{p.quantidade}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
