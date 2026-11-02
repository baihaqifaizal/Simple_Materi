export const PALET_TEMA = ["biru", "hijau", "ungu", "merah", "jingga"] as const;

export function temaValid(input: string): string {
  return (PALET_TEMA as readonly string[]).includes(input) ? input : "biru";
}
