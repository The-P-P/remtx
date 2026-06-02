import Link from "next/link";
import { FileText, Download } from "lucide-react";
import { ClientesSection } from "@/components/clientes/clientes-section";
import { ContratosNav } from "@/components/clientes/contratos-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MODELOS = [
  {
    id: "padrao",
    titulo: "Contrato Padrão",
    descricao:
      "Locação semanal com caução, uso em apps (UBER/99) e cláusulas de multa, km e devolução.",
    href: "/contratos/modelos/contrato-padrao.docx",
    tipo: "DOCX",
  },
  {
    id: "conquista",
    titulo: "Contrato de Plano Conquista",
    descricao:
      "Locação mensal com meta de transferência do veículo ao final do prazo. Adesão, multas e manutenção conforme modelo.",
    href: "/contratos/modelos/contrato-plano-conquista.pdf",
    tipo: "PDF",
  },
] as const;

export default function ContratosModelosPage() {
  return (
    <ClientesSection description="Modelos de referência — o PDF gerado pelo sistema usa os dados da sua locadora e da locação">
      <ContratosNav />
      <div className="grid gap-4 md:grid-cols-2">
        {MODELOS.map((m) => (
          <Card key={m.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="size-4" />
                {m.titulo}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{m.descricao}</p>
              <p className="text-xs text-muted-foreground">
                Arquivo de referência: {m.tipo}
              </p>
              <Button
                variant="outline"
                size="sm"
                render={
                  <Link href={m.href} target="_blank" download />
                }
              >
                <Download className="size-4" />
                Baixar modelo de referência
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Ao criar uma nova locação, o sistema gera automaticamente o PDF preenchido
        com dados do cliente, veículo e do perfil do locador (aba Perfil locador).
      </p>
    </ClientesSection>
  );
}
