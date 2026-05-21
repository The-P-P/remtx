import { KeyRound, ExternalLink, FileCode } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SetupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <Card className="max-w-xl w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <KeyRound className="size-6 text-primary" />
            Configurar autenticação (Clerk)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p className="text-muted-foreground">
            O REMTX usa o Clerk para login. As chaves no arquivo{" "}
            <code className="rounded bg-muted px-1">.env</code> ainda estão como
            placeholder — por isso aparece &quot;Publishable key not valid&quot;.
          </p>

          <ol className="list-decimal space-y-3 pl-5">
            <li>
              Crie uma conta em{" "}
              <a
                href="https://dashboard.clerk.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary underline"
              >
                dashboard.clerk.com
                <ExternalLink className="size-3" />
              </a>
            </li>
            <li>Crie uma aplicação (Application) nova</li>
            <li>
              Em <strong>API Keys</strong>, copie:
              <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                <li>Publishable key → <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code></li>
                <li>Secret key → <code>CLERK_SECRET_KEY</code></li>
              </ul>
            </li>
            <li>
              Cole no arquivo <code>.env</code> na raiz do projeto (substitua os
              valores placeholder)
            </li>
            <li>
              No Clerk, em <strong>User → Metadata</strong>, defina o role:
              <pre className="mt-2 rounded-lg bg-muted p-3 text-xs">
                {`{ "role": "ADMIN" }`}
              </pre>
              Valores: <code>ADMIN</code>, <code>ATENDENTE</code>,{" "}
              <code>FINANCEIRO</code>, <code>MECANICO</code>
            </li>
            <li>Reinicie o servidor: <code>npm run dev</code></li>
          </ol>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900">
            <p className="font-medium text-sm">Telefone do Brasil não aceito?</p>
            <p className="mt-1 text-xs">
              No Clerk: <strong>Configure</strong> → <strong>SMS</strong> → aba{" "}
              <strong>Settings</strong> → habilite <strong>Brazil</strong> na lista
              de países. Ou use só e-mail:{" "}
              <strong>User &amp; Authentication</strong> → desative telefone
              obrigatório no cadastro.
            </p>
          </div>

          <div className="flex items-start gap-2 rounded-lg border bg-muted/50 p-3">
            <FileCode className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Exemplo no <code>.env</code>: chaves reais começam com{" "}
              <code>pk_test_</code> e <code>sk_test_</code> (ambiente de
              desenvolvimento).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
