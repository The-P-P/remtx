# REMTX

Sistema web de gestão para locadora de veículos.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + Shadcn/ui
- Prisma 7 + PostgreSQL
- Clerk (autenticação)
- Zod, date-fns, Lucide React

## Setup rápido

### 1. Banco de dados

```bash
docker compose up -d
cp .env.example .env
```

Edite `.env` com suas chaves reais do [Clerk Dashboard](https://dashboard.clerk.com) (API Keys).  
Se aparecer **"Publishable key not valid"**, as chaves ainda estão como placeholder — acesse `/setup` no navegador para o passo a passo.

### 2. Dependências e Prisma

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
```

### 3. Clerk — roles de usuário

No Clerk Dashboard, configure `publicMetadata` do usuário:

```json
{ "role": "ADMIN" }
```

Valores: `ADMIN`, `ATENDENTE`, `FINANCEIRO`, `MECANICO`.

### 4. Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Módulos (fases)

| Fase | Módulos |
|------|---------|
| 0 ✅ | Estrutura, schema, auth, dashboard |
| 1 | Veículos + Manutenção |
| 2 | Clientes + Locações |
| 3 | Financeiro |
| 4 | Relatórios |

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run db:migrate` | Aplicar migrations |
| `npm run db:seed` | Popular dados de demonstração |
| `npm run db:studio` | Prisma Studio |
