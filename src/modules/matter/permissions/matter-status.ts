import type { MatterStatus } from "../constants/matter-constants";

export function canTransitionMatter(from: MatterStatus, to: MatterStatus): boolean {
  if (from === "open" && to === "ready") return true;
  if (from === "ready" && to === "archived") return true;
  if (from === "open" && to === "archived") return true;
  return false;
}
