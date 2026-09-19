import { apiRequest } from "@/lib/api";
import type { MonthlyPlanning } from "@/planning/planning.types";

export function getMonthlyPlanning(token: string, competence: string): Promise<MonthlyPlanning> {
  const params = new URLSearchParams({
    competence
  });

  return apiRequest<MonthlyPlanning>(`/planning?${params.toString()}`, {
    token
  });
}
