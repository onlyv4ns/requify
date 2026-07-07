import { useLocalStorage } from "@/lib/useLocalStorage";

export function useModel() {
  return useLocalStorage<string>("nexa-model", "Nexa 1.0");
}
