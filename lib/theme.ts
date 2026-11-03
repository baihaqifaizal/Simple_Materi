export const PALET_TEMA = ["biru", "merah", "kuning", "hijau", "ungu", "jingga"] as const;

export type TemaWarna = (typeof PALET_TEMA)[number];

export function temaValid(input: string): string {
  return (PALET_TEMA as readonly string[]).includes(input) ? input : "biru";
}

