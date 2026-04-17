import { SIZE_THRESHOLDS } from "@/lib/constants";

export type GroupSize = "BIG" | "STD" | "MINI" | "—";

/**
 * Classify group size based on member count
 * BIG ≥ 12, STD 7-11, MINI 1-6, — 0
 */
export function classifySize(count: number): GroupSize {
  if (count >= SIZE_THRESHOLDS.BIG) return "BIG";
  if (count >= SIZE_THRESHOLDS.STD) return "STD";
  if (count >= SIZE_THRESHOLDS.MINI) return "MINI";
  return "—";
}
