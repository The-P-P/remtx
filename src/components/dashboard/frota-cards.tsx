import { Car, CheckCircle2, KeyRound, Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FrotaCardsProps {
  total: number;
  disponiveis: number;
  alugados: number;
  emManutencao: number;
}

const cards = [
  {
    key: "total",
    label: "Total de veículos",
    icon: Car,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    key: "disponiveis",
    label: "Disponíveis",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    key: "alugados",
    label: "Alugados",
    icon: KeyRound,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    key: "emManutencao",
    label: "Em manutenção",
    icon: Wrench,
    color: "text-red-600",
    bg: "bg-red-50",
  },
] as const;

export function FrotaCards({
  total,
  disponiveis,
  alugados,
  emManutencao,
}: FrotaCardsProps) {
  const values = { total, disponiveis, alugados, emManutencao };

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ key, label, icon: Icon, color, bg }) => (
        <Card key={key}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {label}
            </CardTitle>
            <div className={`rounded-lg p-2 ${bg}`}>
              <Icon className={`size-4 ${color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{values[key]}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
