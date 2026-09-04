export interface InteractiveTarget {
  id: string;
  type: "door" | "seat" | "guardian" | "terminal" | "lesson" | "portal" | "object";
  position: [number, number, number];
  range: number;
  priority: number;
  label: { en: string; es: string };
  action: () => void;
  enabled?: boolean;
}

export class InteractionManager {
  getBestInteraction(
    playerPos: [number, number, number],
    targets: InteractiveTarget[],
  ): InteractiveTarget | null {
    let best: InteractiveTarget | null = null;
    let bestPriority = -Infinity;
    let bestDistance = Infinity;

    for (const t of targets) {
      if (t.enabled === false) continue;
      const dist = Math.hypot(playerPos[0] - t.position[0], playerPos[2] - t.position[2]);
      if (dist <= t.range) {
        if (t.priority > bestPriority || (t.priority === bestPriority && dist < bestDistance)) {
          bestPriority = t.priority;
          bestDistance = dist;
          best = t;
        }
      }
    }

    return best;
  }
}
