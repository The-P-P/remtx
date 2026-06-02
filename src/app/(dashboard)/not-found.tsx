import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardNotFound() {
  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileQuestion className="size-5 shrink-0 text-muted-foreground" />
          Página não encontrada
        </CardTitle>
        <CardDescription className="text-base text-foreground/90">
          O endereço que você acessou não existe ou foi movido.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button render={<Link href="/" />}>Voltar ao início</Button>
      </CardContent>
    </Card>
  );
}
