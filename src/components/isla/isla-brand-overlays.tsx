import { WorldLogoMark } from "@/components/brand/world-logo-mark";
import { WORLD_SCALE as S, terrainHeight } from "@/lib/isla-terrain";

const JOURNEY_X = 7;
const JOURNEY_Z = 20;

export function IslaBrandOverlays() {
  const commandBaseY = 2.26 * S * 0.8;
  const journeyY = terrainHeight(JOURNEY_X, JOURNEY_Z);

  return (
    <>
      {/* Covers the temporary single-letter N on the command-center portal with the real brand mark. */}
      <WorldLogoMark position={[0, commandBaseY + 3.6, 6.74]} size={3.05} />

      {/* Covers the temporary N on the Guardian Journey board with the real brand mark. */}
      <WorldLogoMark
        position={[JOURNEY_X + 0.06, journeyY + 2.8, JOURNEY_Z + 0.24]}
        rotation={[0, -0.25, 0]}
        size={1.35}
      />
    </>
  );
}
