import { useQuery } from "@tanstack/react-query";
import { Inspection } from "@shared/schema";

export function useInspections() {
  return useQuery<Inspection[]>({
    queryKey: ["/api/inspections"],
  });
}

export function useInspection(id: string) {
  return useQuery<Inspection>({
    queryKey: ["/api/inspections", id],
    enabled: !!id,
  });
}
