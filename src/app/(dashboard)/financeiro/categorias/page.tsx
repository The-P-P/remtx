import Link from "next/link";
import { Plus } from "lucide-react";
import { getCategoriasFinanceiras } from "@/lib/actions/financeiro";
import { FinanceiroSection } from "@/components/financeiro/financeiro-section";
import { CategoriasList } from "@/components/financeiro/categorias-list";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageActions } from "@/components/shared/page-actions";

export default async function CategoriasFinanceirasPage() {
  const categorias = await getCategoriasFinanceiras();

  return (
    <FinanceiroSection showNovaTransacao={false}>
      <div className="flex justify-end">
        <PageActions>
          <Button
            className="w-full sm:w-auto"
            render={<Link href="/financeiro/categorias/nova" />}
          >
            <Plus className="size-4" />
            Nova categoria
          </Button>
        </PageActions>
      </div>

      <Card>
        <CardContent className="p-0">
          <CategoriasList categorias={categorias} />
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Dezenas de categorias padrão são criadas automaticamente ao abrir o
        financeiro. Desative as que não usar; exclua só se não houver
        lançamentos vinculados.
      </p>
    </FinanceiroSection>
  );
}
