import { supabase } from "../integrations/supabase/client.ts";
import { walletService } from "./wallet-service.ts";

export interface BuilderItem {
  id: string;
  name: string;
  description: string;
  category: "nature" | "buildings" | "decorations" | "creatures" | "technology" | "world_effects";
  point_cost: number;
  level_required: number;
  required_achievement: string | null;
  item_type: "UNLOCKABLE" | "QUANTITY_ITEM" | "UPGRADE" | "CONSUMABLE";
  asset_reference: string;
  thumbnail?: string;
  active: boolean;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export interface LearnerInventoryItem {
  id: string;
  learner_id: string;
  item_id: string;
  quantity: number;
  level: number;
  unlocked_at: string;
  item?: BuilderItem;
}

export interface PurchaseItemResult {
  success: boolean;
  error?: string;
  message: string;
  item_id?: string;
  item_name?: string;
  points_spent?: number;
  new_balance?: number;
  required_points?: number;
  current_balance?: number;
}

export const STARTER_BUILDER_ITEMS: BuilderItem[] = [
  // NATURE
  { id: "grass-patch", name: "Grass Patch", description: "Lush green grass for your Guardian island.", category: "nature", point_cost: 10, level_required: 1, required_achievement: null, item_type: "QUANTITY_ITEM", asset_reference: "grass_patch", active: true, rarity: "common" },
  { id: "flower-pack", name: "Flower Pack", description: "Vibrant wildflowers that attract butterflies.", category: "nature", point_cost: 15, level_required: 1, required_achievement: null, item_type: "QUANTITY_ITEM", asset_reference: "flower_pack", active: true, rarity: "common" },
  { id: "bush", name: "Bush", description: "A healthy green shrubbery for garden landscaping.", category: "nature", point_cost: 20, level_required: 1, required_achievement: null, item_type: "QUANTITY_ITEM", asset_reference: "bush", active: true, rarity: "common" },
  { id: "small-tree", name: "Small Tree", description: "A young oak tree providing shade.", category: "nature", point_cost: 25, level_required: 1, required_achievement: null, item_type: "QUANTITY_ITEM", asset_reference: "small_tree", active: true, rarity: "common" },
  { id: "large-tree", name: "Large Tree", description: "A majestic ancient tree with deep roots.", category: "nature", point_cost: 40, level_required: 2, required_achievement: null, item_type: "QUANTITY_ITEM", asset_reference: "large_tree", active: true, rarity: "common" },
  { id: "fruit-tree", name: "Fruit Tree", description: "Sweet fruit tree loved by forest creatures.", category: "nature", point_cost: 50, level_required: 2, required_achievement: null, item_type: "QUANTITY_ITEM", asset_reference: "fruit_tree", active: true, rarity: "rare" },
  { id: "rock-collection", name: "Rock Collection", description: "Decorative mossy boulders.", category: "nature", point_cost: 20, level_required: 1, required_achievement: null, item_type: "QUANTITY_ITEM", asset_reference: "rock_collection", active: true, rarity: "common" },
  { id: "pond", name: "Pond", description: "A tranquil water pond with lily pads.", category: "nature", point_cost: 75, level_required: 2, required_achievement: null, item_type: "QUANTITY_ITEM", asset_reference: "pond", active: true, rarity: "rare" },
  { id: "waterfall", name: "Waterfall", description: "A cascading mountain waterfall feature.", category: "nature", point_cost: 150, level_required: 3, required_achievement: null, item_type: "QUANTITY_ITEM", asset_reference: "waterfall", active: true, rarity: "epic" },
  { id: "river-feature", name: "River Feature", description: "Winding stream connecting your zones.", category: "nature", point_cost: 200, level_required: 4, required_achievement: null, item_type: "QUANTITY_ITEM", asset_reference: "river_feature", active: true, rarity: "epic" },
  { id: "rainbow", name: "Rainbow", description: "A glowing prismatic arch across your sky.", category: "nature", point_cost: 250, level_required: 5, required_achievement: null, item_type: "UNLOCKABLE", asset_reference: "rainbow", active: true, rarity: "legendary" },

  // BUILDINGS
  { id: "small-hut", name: "Small Hut", description: "Cozy shelter for young explorers.", category: "buildings", point_cost: 50, level_required: 1, required_achievement: null, item_type: "QUANTITY_ITEM", asset_reference: "small_hut", active: true, rarity: "common" },
  { id: "tree-house", name: "Tree House", description: "Elevated lookout post built into high branches.", category: "buildings", point_cost: 100, level_required: 2, required_achievement: null, item_type: "UPGRADE", asset_reference: "tree_house", active: true, rarity: "rare" },
  { id: "workshop", name: "Workshop", description: "Crafting station for building Guardian gear.", category: "buildings", point_cost: 125, level_required: 2, required_achievement: null, item_type: "QUANTITY_ITEM", asset_reference: "workshop", active: true, rarity: "rare" },
  { id: "learning-lab", name: "Learning Lab", description: "Interactive computer station for cybersecurity studies.", category: "buildings", point_cost: 175, level_required: 3, required_achievement: null, item_type: "QUANTITY_ITEM", asset_reference: "learning_lab", active: true, rarity: "rare" },
  { id: "ai-research-lab", name: "AI Research Lab", description: "Advanced research hub for studying AI models.", category: "buildings", point_cost: 250, level_required: 4, required_achievement: "builder-lab", item_type: "UPGRADE", asset_reference: "ai_research_lab", active: true, rarity: "epic" },
  { id: "castle", name: "Castle", description: "Fortified stronghold with high towers.", category: "buildings", point_cost: 400, level_required: 5, required_achievement: null, item_type: "QUANTITY_ITEM", asset_reference: "castle", active: true, rarity: "legendary" },
  { id: "guardian-hq", name: "Guardian Headquarters", description: "The grand citadel of Nyrava Guardians.", category: "buildings", point_cost: 500, level_required: 6, required_achievement: "truth-lab", item_type: "UNLOCKABLE", asset_reference: "guardian_hq", active: true, rarity: "legendary" },

  // DECORATIONS
  { id: "bench", name: "Bench", description: "Wooden bench for resting.", category: "decorations", point_cost: 15, level_required: 1, required_achievement: null, item_type: "QUANTITY_ITEM", asset_reference: "bench", active: true, rarity: "common" },
  { id: "lamp", name: "Lamp", description: "Warm streetlight for night safety.", category: "decorations", point_cost: 20, level_required: 1, required_achievement: null, item_type: "QUANTITY_ITEM", asset_reference: "lamp", active: true, rarity: "common" },
  { id: "path-section", name: "Path Section", description: "Cobblestone walkway.", category: "decorations", point_cost: 10, level_required: 1, required_achievement: null, item_type: "QUANTITY_ITEM", asset_reference: "path_section", active: true, rarity: "common" },
  { id: "fence-pack", name: "Fence Pack", description: "Wooden boundary fences.", category: "decorations", point_cost: 20, level_required: 1, required_achievement: null, item_type: "QUANTITY_ITEM", asset_reference: "fence_pack", active: true, rarity: "common" },
  { id: "bridge", name: "Bridge", description: "Wooden arch bridge across rivers.", category: "decorations", point_cost: 75, level_required: 2, required_achievement: null, item_type: "QUANTITY_ITEM", asset_reference: "bridge", active: true, rarity: "rare" },
  { id: "fountain", name: "Fountain", description: "Gleaming stone water fountain.", category: "decorations", point_cost: 100, level_required: 3, required_achievement: null, item_type: "QUANTITY_ITEM", asset_reference: "fountain", active: true, rarity: "rare" },
  { id: "statue", name: "Statue", description: "Carved statue of Guardian Nyrava.", category: "decorations", point_cost: 125, level_required: 3, required_achievement: null, item_type: "QUANTITY_ITEM", asset_reference: "statue", active: true, rarity: "epic" },
  { id: "portal", name: "Portal", description: "Glowing dimensional archway.", category: "decorations", point_cost: 300, level_required: 5, required_achievement: null, item_type: "UNLOCKABLE", asset_reference: "portal", active: true, rarity: "legendary" },

  // ANIMALS / CREATURES
  { id: "butterfly", name: "Butterfly", description: "Colorful fluttering butterflies.", category: "creatures", point_cost: 20, level_required: 1, required_achievement: null, item_type: "QUANTITY_ITEM", asset_reference: "butterfly", active: true, rarity: "common" },
  { id: "bird", name: "Bird", description: "Chirping songbirds for your trees.", category: "creatures", point_cost: 25, level_required: 1, required_achievement: null, item_type: "QUANTITY_ITEM", asset_reference: "bird", active: true, rarity: "common" },
  { id: "rabbit", name: "Rabbit", description: "Playful woodland bunnies.", category: "creatures", point_cost: 35, level_required: 1, required_achievement: null, item_type: "QUANTITY_ITEM", asset_reference: "rabbit", active: true, rarity: "common" },
  { id: "fox", name: "Fox", description: "Clever orange forest fox.", category: "creatures", point_cost: 60, level_required: 2, required_achievement: null, item_type: "QUANTITY_ITEM", asset_reference: "fox", active: true, rarity: "rare" },
  { id: "deer", name: "Deer", description: "Gentle woodland stag.", category: "creatures", point_cost: 75, level_required: 2, required_achievement: null, item_type: "QUANTITY_ITEM", asset_reference: "deer", active: true, rarity: "rare" },
  { id: "owl", name: "Owl", description: "Wise nocturnal guardian owl.", category: "creatures", point_cost: 80, level_required: 3, required_achievement: null, item_type: "QUANTITY_ITEM", asset_reference: "owl", active: true, rarity: "rare" },
  { id: "friendly-robot", name: "Friendly Robot", description: "Automated companion that greets visitors.", category: "creatures", point_cost: 100, level_required: 3, required_achievement: null, item_type: "UPGRADE", asset_reference: "friendly_robot", active: true, rarity: "rare" },
  { id: "guardian-creature", name: "Guardian Creature", description: "Mystical creature that guards your realm.", category: "creatures", point_cost: 200, level_required: 4, required_achievement: "personal-information", item_type: "UNLOCKABLE", asset_reference: "guardian_creature", active: true, rarity: "epic" },
  { id: "rare-nyrava-creature", name: "Rare Nyrava Creature", description: "Legendary glowing spirit animal.", category: "creatures", point_cost: 400, level_required: 6, required_achievement: "truth-lab", item_type: "UNLOCKABLE", asset_reference: "nyrava_creature", active: true, rarity: "legendary" },

  // TECHNOLOGY
  { id: "solar-panel", name: "Solar Panel", description: "Clean energy generator.", category: "technology", point_cost: 50, level_required: 1, required_achievement: null, item_type: "QUANTITY_ITEM", asset_reference: "solar_panel", active: true, rarity: "common" },
  { id: "computer-station", name: "Computer Station", description: "Cyber defense terminal.", category: "technology", point_cost: 75, level_required: 2, required_achievement: null, item_type: "QUANTITY_ITEM", asset_reference: "computer_station", active: true, rarity: "common" },
  { id: "robot-helper", name: "Robot Helper", description: "Autonomous repair and building drone.", category: "technology", point_cost: 100, level_required: 2, required_achievement: null, item_type: "UPGRADE", asset_reference: "robot_helper", active: true, rarity: "rare" },
  { id: "drone", name: "Drone", description: "Aerial scanning drone.", category: "technology", point_cost: 125, level_required: 3, required_achievement: null, item_type: "QUANTITY_ITEM", asset_reference: "drone", active: true, rarity: "rare" },
  { id: "ai-learning-station", name: "AI Learning Station", description: "Interactive terminal for AI fundamentals.", category: "technology", point_cost: 150, level_required: 3, required_achievement: "password-safety", item_type: "QUANTITY_ITEM", asset_reference: "ai_learning_station", active: true, rarity: "rare" },
  { id: "hologram-projector", name: "Hologram Projector", description: "3D tactical holographic display.", category: "technology", point_cost: 200, level_required: 4, required_achievement: null, item_type: "QUANTITY_ITEM", asset_reference: "hologram_projector", active: true, rarity: "epic" },
  { id: "ai-safety-scanner", name: "AI Safety Scanner", description: "Scans incoming data for phishing and threats.", category: "technology", point_cost: 250, level_required: 4, required_achievement: "phishing-defense", item_type: "UNLOCKABLE", asset_reference: "ai_safety_scanner", active: true, rarity: "epic" },
  { id: "guardian-defense-system", name: "Guardian Defense System", description: "Perimeter energy shield grid.", category: "technology", point_cost: 350, level_required: 5, required_achievement: "phishing-defense", item_type: "UNLOCKABLE", asset_reference: "defense_system", active: true, rarity: "legendary" },

  // WORLD EFFECTS
  { id: "sunset-sky", name: "Sunset Sky", description: "Warm amber evening atmosphere.", category: "world_effects", point_cost: 75, level_required: 2, required_achievement: null, item_type: "UNLOCKABLE", asset_reference: "sky_sunset", active: true, rarity: "rare" },
  { id: "night-sky", name: "Night Sky", description: "Deep blue midnight sky with moon.", category: "world_effects", point_cost: 100, level_required: 2, required_achievement: null, item_type: "UNLOCKABLE", asset_reference: "sky_night", active: true, rarity: "rare" },
  { id: "stars", name: "Stars", description: "Twinkling starlight canopy.", category: "world_effects", point_cost: 100, level_required: 2, required_achievement: null, item_type: "UNLOCKABLE", asset_reference: "sky_stars", active: true, rarity: "rare" },
  { id: "snow", name: "Snow", description: "Gentle falling snowflakes effect.", category: "world_effects", point_cost: 125, level_required: 3, required_achievement: null, item_type: "UNLOCKABLE", asset_reference: "weather_snow", active: true, rarity: "rare" },
  { id: "aurora", name: "Aurora", description: "Shimmering Northern Lights above your world.", category: "world_effects", point_cost: 175, level_required: 4, required_achievement: null, item_type: "UNLOCKABLE", asset_reference: "weather_aurora", active: true, rarity: "epic" },
  { id: "magic-clouds", name: "Magic Clouds", description: "Floating pastel clouds.", category: "world_effects", point_cost: 200, level_required: 4, required_achievement: null, item_type: "UNLOCKABLE", asset_reference: "weather_clouds", active: true, rarity: "epic" },
  { id: "galaxy-sky", name: "Galaxy Sky", description: "Cosmic galaxy panorama with nebula clouds.", category: "world_effects", point_cost: 300, level_required: 5, required_achievement: "truth-lab", item_type: "UNLOCKABLE", asset_reference: "sky_galaxy", active: true, rarity: "legendary" },
];

const LOCAL_INVENTORY_KEY = "nyrava_learner_inventory";
const MEMORY_INVENTORIES = new Map<string, LearnerInventoryItem[]>();

export class BuilderStoreService {
  /**
   * Fetches full item catalog.
   */
  async getCatalog(): Promise<BuilderItem[]> {
    try {
      const { data } = await supabase
        .from("builder_items" as any)
        .select("*")
        .eq("active", true);

      if (data && data.length > 0) {
        return data as unknown as BuilderItem[];
      }
    } catch {}
    return STARTER_BUILDER_ITEMS;
  }

  /**
   * Fetches learner's owned inventory.
   */
  async getInventory(userId?: string): Promise<LearnerInventoryItem[]> {
    const activeId = userId || (await this.getActiveUserId()) || "guest-learner";
    try {
      const { data } = await supabase
        .from("learner_inventory" as any)
        .select("*")
        .eq("learner_id", activeId);

      if (data && data.length > 0) {
        return data as unknown as LearnerInventoryItem[];
      }
    } catch {}
    return this.getLocalInventory(activeId);
  }

  /**
   * Securely purchases an item using server RPC `purchase_builder_item(p_learner_id, p_item_id)`.
   */
  async purchaseItem(itemId: string, userId?: string): Promise<PurchaseItemResult> {
    const activeId = userId || (await this.getActiveUserId()) || "guest-learner";
    const item = STARTER_BUILDER_ITEMS.find((i) => i.id === itemId);

    if (!item) {
      return { success: false, error: "ITEM_NOT_FOUND", message: "Item not found in catalog." };
    }

    try {
      const { data, error } = await supabase.rpc("purchase_builder_item" as any, {
        p_learner_id: activeId,
        p_item_id: itemId,
      });

      if (!error && data) {
        const res = data as unknown as PurchaseItemResult;
        return res;
      }
    } catch {}

    // Fallback local update (for offline resilience and unit tests)
    const wallet = walletService.getLocalWallet(activeId);
    if (wallet.balance < item.point_cost) {
      return {
        success: false,
        error: "INSUFFICIENT_FUNDS",
        message: "Not enough points.",
        required_points: item.point_cost,
        current_balance: wallet.balance,
      };
    }

    wallet.balance -= item.point_cost;
    wallet.lifetime_spent += item.point_cost;
    walletService.saveLocalWallet(wallet);

    const inv = this.getLocalInventory(activeId);
    const existing = inv.find((i) => i.item_id === itemId);
    if (existing) {
      existing.quantity += 1;
    } else {
      inv.push({
        id: crypto.randomUUID(),
        learner_id: activeId,
        item_id: itemId,
        quantity: 1,
        level: 1,
        unlocked_at: new Date().toISOString(),
        item,
      });
    }
    this.saveLocalInventory(activeId, inv);

    return {
      success: true,
      item_id: itemId,
      item_name: item.name,
      points_spent: item.point_cost,
      new_balance: wallet.balance,
      message: `${item.name} unlocked!`,
    };
  }

  public getLocalInventory(learnerId: string): LearnerInventoryItem[] {
    if (MEMORY_INVENTORIES.has(learnerId)) {
      return MEMORY_INVENTORIES.get(learnerId)!;
    }
    try {
      if (typeof localStorage !== "undefined") {
        const raw = localStorage.getItem(`${LOCAL_INVENTORY_KEY}_${learnerId}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          MEMORY_INVENTORIES.set(learnerId, parsed);
          return parsed;
        }
      }
    } catch {}

    const starter: LearnerInventoryItem[] = [
      {
        id: "starter-1",
        learner_id: learnerId,
        item_id: "grass-patch",
        quantity: 5,
        level: 1,
        unlocked_at: "2026-09-04T00:00:00.000Z",
      },
    ];
    MEMORY_INVENTORIES.set(learnerId, starter);
    return starter;
  }

  public saveLocalInventory(learnerId: string, inventory: LearnerInventoryItem[]) {
    MEMORY_INVENTORIES.set(learnerId, inventory);
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(`${LOCAL_INVENTORY_KEY}_${learnerId}`, JSON.stringify(inventory));
      }
    } catch {}
  }

  private async getActiveUserId(): Promise<string | undefined> {
    try {
      const { data } = await supabase.auth.getUser();
      return data.user?.id;
    } catch {
      return undefined;
    }
  }
}

export const builderStoreService = new BuilderStoreService();
