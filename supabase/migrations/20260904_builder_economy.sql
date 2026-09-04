-- Nyrava Guardians — Course Points & AI Builder Economy Schema & RPC Functions

-- 1. Learner Wallets Table
CREATE TABLE IF NOT EXISTS public.learner_wallets (
  learner_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  lifetime_earned INTEGER NOT NULL DEFAULT 0 CHECK (lifetime_earned >= 0),
  lifetime_spent INTEGER NOT NULL DEFAULT 0 CHECK (lifetime_spent >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Point Transactions Table
CREATE TABLE IF NOT EXISTS public.point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id UUID NOT NULL REFERENCES public.learner_wallets(learner_id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (
    transaction_type IN (
      'COURSE_REWARD', 'LESSON_REWARD', 'QUIZ_REWARD', 
      'MISSION_REWARD', 'ACHIEVEMENT_REWARD', 'PURCHASE', 
      'REFUND', 'ADMIN_ADJUSTMENT'
    )
  ),
  source_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique index to prevent duplicate course reward transactions (anti-farming constraint)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_course_reward 
ON public.point_transactions (learner_id, source_type, source_id, transaction_type) 
WHERE transaction_type IN ('COURSE_REWARD', 'LESSON_REWARD', 'QUIZ_REWARD', 'MISSION_REWARD');

-- 3. Reward Rules Config Table
CREATE TABLE IF NOT EXISTS public.reward_rules (
  reward_type TEXT PRIMARY KEY,
  points INTEGER NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  minimum_score INTEGER NOT NULL DEFAULT 75,
  metadata JSONB DEFAULT '{}'::jsonb
);

INSERT INTO public.reward_rules (reward_type, points, active, minimum_score, metadata) VALUES
  ('LESSON_COMPLETED', 10, true, 75, '{"label": "Lesson Completed"}'::jsonb),
  ('QUIZ_COMPLETED', 20, true, 75, '{"label": "Quiz Completed"}'::jsonb),
  ('PERFECT_QUIZ_BONUS', 10, true, 100, '{"label": "Perfect Quiz Bonus"}'::jsonb),
  ('SAFETY_MISSION_COMPLETED', 25, true, 75, '{"label": "AI Safety Mission Completed"}'::jsonb),
  ('COURSE_COMPLETED', 100, true, 75, '{"label": "Major Course Completed"}'::jsonb)
ON CONFLICT (reward_type) DO UPDATE SET points = EXCLUDED.points;

-- 4. Builder Items Catalog Table
CREATE TABLE IF NOT EXISTS public.builder_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (
    category IN ('nature', 'buildings', 'decorations', 'creatures', 'technology', 'world_effects')
  ),
  point_cost INTEGER NOT NULL CHECK (point_cost >= 0),
  level_required INTEGER NOT NULL DEFAULT 1,
  required_achievement TEXT,
  item_type TEXT NOT NULL DEFAULT 'UNLOCKABLE' CHECK (
    item_type IN ('UNLOCKABLE', 'QUANTITY_ITEM', 'UPGRADE', 'CONSUMABLE')
  ),
  asset_reference TEXT NOT NULL,
  thumbnail TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  rarity TEXT NOT NULL DEFAULT 'common' CHECK (
    rarity IN ('common', 'rare', 'epic', 'legendary')
  ),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Seed Starter Catalog (40+ items across all categories)
INSERT INTO public.builder_items (id, name, description, category, point_cost, level_required, required_achievement, item_type, asset_reference, rarity) VALUES
  -- NATURE
  ('grass-patch', 'Grass Patch', 'Lush green grass for your Guardian island.', 'nature', 10, 1, NULL, 'QUANTITY_ITEM', 'grass_patch', 'common'),
  ('flower-pack', 'Flower Pack', 'Vibrant wildflowers that attract butterflies.', 'nature', 15, 1, NULL, 'QUANTITY_ITEM', 'flower_pack', 'common'),
  ('bush', 'Bush', 'A healthy green shrubbery for garden landscaping.', 'nature', 20, 1, NULL, 'QUANTITY_ITEM', 'bush', 'common'),
  ('small-tree', 'Small Tree', 'A young oak tree providing shade.', 'nature', 25, 1, NULL, 'QUANTITY_ITEM', 'small_tree', 'common'),
  ('large-tree', 'Large Tree', 'A majestic ancient tree with deep roots.', 'nature', 40, 2, NULL, 'QUANTITY_ITEM', 'large_tree', 'common'),
  ('fruit-tree', 'Fruit Tree', 'Sweet fruit tree loved by forest creatures.', 'nature', 50, 2, NULL, 'QUANTITY_ITEM', 'fruit_tree', 'rare'),
  ('rock-collection', 'Rock Collection', 'Decorative mossy boulders.', 'nature', 20, 1, NULL, 'QUANTITY_ITEM', 'rock_collection', 'common'),
  ('pond', 'Pond', 'A tranquil water pond with lily pads.', 'nature', 75, 2, NULL, 'QUANTITY_ITEM', 'pond', 'rare'),
  ('waterfall', 'Waterfall', 'A cascading mountain waterfall feature.', 'nature', 150, 3, NULL, 'QUANTITY_ITEM', 'waterfall', 'epic'),
  ('river-feature', 'River Feature', 'Winding stream connecting your zones.', 'nature', 200, 4, NULL, 'QUANTITY_ITEM', 'river_feature', 'epic'),
  ('rainbow', 'Rainbow', 'A glowing prismatic arch across your sky.', 'nature', 250, 5, NULL, 'UNLOCKABLE', 'rainbow', 'legendary'),

  -- BUILDINGS
  ('small-hut', 'Small Hut', 'Cozy shelter for young explorers.', 'buildings', 50, 1, NULL, 'QUANTITY_ITEM', 'small_hut', 'common'),
  ('tree-house', 'Tree House', 'Elevated lookout post built into high branches.', 'buildings', 100, 2, NULL, 'UPGRADE', 'tree_house', 'rare'),
  ('workshop', 'Workshop', 'Crafting station for building Guardian gear.', 'buildings', 125, 2, NULL, 'QUANTITY_ITEM', 'workshop', 'rare'),
  ('learning-lab', 'Learning Lab', 'Interactive computer station for cybersecurity studies.', 'buildings', 175, 3, NULL, 'QUANTITY_ITEM', 'learning_lab', 'rare'),
  ('ai-research-lab', 'AI Research Lab', 'Advanced research hub for studying AI models.', 'buildings', 250, 4, 'builder-lab', 'UPGRADE', 'ai_research_lab', 'epic'),
  ('castle', 'Castle', 'Fortified stronghold with high towers.', 'buildings', 400, 5, NULL, 'QUANTITY_ITEM', 'castle', 'legendary'),
  ('guardian-hq', 'Guardian Headquarters', 'The grand citadel of Nyrava Guardians.', 'buildings', 500, 6, 'truth-lab', 'UNLOCKABLE', 'guardian_hq', 'legendary'),

  -- DECORATIONS
  ('bench', 'Bench', 'Wooden bench for resting.', 'decorations', 15, 1, NULL, 'QUANTITY_ITEM', 'bench', 'common'),
  ('lamp', 'Lamp', 'Warm streetlight for night safety.', 'decorations', 20, 1, NULL, 'QUANTITY_ITEM', 'lamp', 'common'),
  ('path-section', 'Path Section', 'Cobblestone walkway.', 'decorations', 10, 1, NULL, 'QUANTITY_ITEM', 'path_section', 'common'),
  ('fence-pack', 'Fence Pack', 'Wooden boundary fences.', 'decorations', 20, 1, NULL, 'QUANTITY_ITEM', 'fence_pack', 'common'),
  ('bridge', 'Bridge', 'Wooden arch bridge across rivers.', 'decorations', 75, 2, NULL, 'QUANTITY_ITEM', 'bridge', 'rare'),
  ('fountain', 'Fountain', 'Gleaming stone water fountain.', 'decorations', 100, 3, NULL, 'QUANTITY_ITEM', 'fountain', 'rare'),
  ('statue', 'Statue', 'Carved statue of Guardian Nyrava.', 'decorations', 125, 3, NULL, 'QUANTITY_ITEM', 'statue', 'epic'),
  ('portal', 'Portal', 'Glowing dimensional archway.', 'decorations', 300, 5, NULL, 'UNLOCKABLE', 'portal', 'legendary'),

  -- ANIMALS / CREATURES
  ('butterfly', 'Butterfly', 'Colorful fluttering butterflies.', 'creatures', 20, 1, NULL, 'QUANTITY_ITEM', 'butterfly', 'common'),
  ('bird', 'Bird', 'Chirping songbirds for your trees.', 'creatures', 25, 1, NULL, 'QUANTITY_ITEM', 'bird', 'common'),
  ('rabbit', 'Rabbit', 'Playful woodland bunnies.', 'creatures', 35, 1, NULL, 'QUANTITY_ITEM', 'rabbit', 'common'),
  ('fox', 'Fox', 'Clever orange forest fox.', 'creatures', 60, 2, NULL, 'QUANTITY_ITEM', 'fox', 'rare'),
  ('deer', 'Deer', 'Gentle woodland stag.', 'creatures', 75, 2, NULL, 'QUANTITY_ITEM', 'deer', 'rare'),
  ('owl', 'Owl', 'Wise nocturnal guardian owl.', 'creatures', 80, 3, NULL, 'QUANTITY_ITEM', 'owl', 'rare'),
  ('friendly-robot', 'Friendly Robot', 'Automated companion that greets visitors.', 'creatures', 100, 3, NULL, 'UPGRADE', 'friendly_robot', 'rare'),
  ('guardian-creature', 'Guardian Creature', 'Mystical creature that guards your realm.', 'creatures', 200, 4, 'personal-information', 'UNLOCKABLE', 'guardian_creature', 'epic'),
  ('rare-nyrava-creature', 'Rare Nyrava Creature', 'Legendary glowing spirit animal.', 'creatures', 400, 6, 'truth-lab', 'UNLOCKABLE', 'nyrava_creature', 'legendary'),

  -- TECHNOLOGY
  ('solar-panel', 'Solar Panel', 'Clean energy generator.', 'technology', 50, 1, NULL, 'QUANTITY_ITEM', 'solar_panel', 'common'),
  ('computer-station', 'Computer Station', 'Cyber defense terminal.', 'technology', 75, 2, NULL, 'QUANTITY_ITEM', 'computer_station', 'common'),
  ('robot-helper', 'Robot Helper', 'Autonomous repair and building drone.', 'technology', 100, 2, NULL, 'UPGRADE', 'robot_helper', 'rare'),
  ('drone', 'Drone', 'Aerial scanning drone.', 'technology', 125, 3, NULL, 'QUANTITY_ITEM', 'drone', 'rare'),
  ('ai-learning-station', 'AI Learning Station', 'Interactive terminal for AI fundamentals.', 'technology', 150, 3, 'password-safety', 'QUANTITY_ITEM', 'ai_learning_station', 'rare'),
  ('hologram-projector', 'Hologram Projector', '3D tactical holographic display.', 'technology', 200, 4, NULL, 'QUANTITY_ITEM', 'hologram_projector', 'epic'),
  ('ai-safety-scanner', 'AI Safety Scanner', 'Scans incoming data for phishing and threats.', 'technology', 250, 4, 'phishing-defense', 'UNLOCKABLE', 'ai_safety_scanner', 'epic'),
  ('guardian-defense-system', 'Guardian Defense System', 'Perimeter energy shield grid.', 'technology', 350, 5, 'phishing-defense', 'UNLOCKABLE', 'defense_system', 'legendary'),

  -- WORLD EFFECTS
  ('sunset-sky', 'Sunset Sky', 'Warm amber evening atmosphere.', 'world_effects', 75, 2, NULL, 'UNLOCKABLE', 'sky_sunset', 'rare'),
  ('night-sky', 'Night Sky', 'Deep blue midnight sky with moon.', 'world_effects', 100, 2, NULL, 'UNLOCKABLE', 'sky_night', 'rare'),
  ('stars', 'Stars', 'Twinkling starlight canopy.', 'world_effects', 100, 2, NULL, 'UNLOCKABLE', 'sky_stars', 'rare'),
  ('snow', 'Snow', 'Gentle falling snowflakes effect.', 'world_effects', 125, 3, NULL, 'UNLOCKABLE', 'weather_snow', 'rare'),
  ('aurora', 'Aurora', 'Shimmering Northern Lights above your world.', 'world_effects', 175, 4, NULL, 'UNLOCKABLE', 'weather_aurora', 'epic'),
  ('magic-clouds', 'Magic Clouds', 'Floating pastel clouds.', 'world_effects', 200, 4, NULL, 'UNLOCKABLE', 'weather_clouds', 'epic'),
  ('galaxy-sky', 'Galaxy Sky', 'Cosmic galaxy panorama with nebula clouds.', 'world_effects', 300, 5, 'truth-lab', 'UNLOCKABLE', 'sky_galaxy', 'legendary')
ON CONFLICT (id) DO UPDATE SET 
  point_cost = EXCLUDED.point_cost,
  level_required = EXCLUDED.level_required,
  required_achievement = EXCLUDED.required_achievement;

-- 5. Learner Inventory Table
CREATE TABLE IF NOT EXISTS public.learner_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id UUID NOT NULL REFERENCES public.learner_wallets(learner_id) ON DELETE CASCADE,
  item_id TEXT NOT NULL REFERENCES public.builder_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  purchase_transaction_id UUID REFERENCES public.point_transactions(id) ON DELETE SET NULL,
  UNIQUE(learner_id, item_id)
);

-- RLS POLICIES
ALTER TABLE public.learner_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_inventory ENABLE ROW LEVEL SECURITY;

-- Allow public read of catalog & rules
CREATE POLICY "Public read builder_items" ON public.builder_items FOR SELECT USING (true);
CREATE POLICY "Public read reward_rules" ON public.reward_rules FOR SELECT USING (true);

-- Learners access their own wallet/transactions/inventory
CREATE POLICY "Learner read wallet" ON public.learner_wallets 
  FOR SELECT USING (auth.uid() = learner_id OR is_approved_guardian(auth.uid(), learner_id::text));

CREATE POLICY "Learner read transactions" ON public.point_transactions 
  FOR SELECT USING (auth.uid() = learner_id OR is_approved_guardian(auth.uid(), learner_id::text));

CREATE POLICY "Learner read inventory" ON public.learner_inventory 
  FOR SELECT USING (auth.uid() = learner_id OR is_approved_guardian(auth.uid(), learner_id::text));

-- RPC FUNCTIONS (Server-Side Atomic Operations)

-- 1. Award Points for Course Completion (Anti-Farming & Idempotent)
CREATE OR REPLACE FUNCTION public.award_points_for_course(
  p_learner_id UUID,
  p_course_id TEXT,
  p_score INTEGER,
  p_is_perfect BOOLEAN DEFAULT false
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_already_awarded BOOLEAN;
  v_points INTEGER := 100; -- Base major course reward
  v_bonus INTEGER := 0;
  v_total INTEGER;
  v_wallet_balance INTEGER;
  v_tx_id UUID;
BEGIN
  -- Ensure learner wallet exists
  INSERT INTO public.learner_wallets (learner_id, balance, lifetime_earned, lifetime_spent, updated_at)
  VALUES (p_learner_id, 0, 0, 0, now())
  ON CONFLICT (learner_id) DO NOTHING;

  -- Check anti-farming condition: has this course reward already been claimed?
  SELECT EXISTS (
    SELECT 1 FROM public.point_transactions
    WHERE learner_id = p_learner_id
      AND source_type = 'course'
      AND source_id = p_course_id
      AND transaction_type = 'COURSE_REWARD'
  ) INTO v_already_awarded;

  IF v_already_awarded THEN
    SELECT balance INTO v_wallet_balance FROM public.learner_wallets WHERE learner_id = p_learner_id;
    RETURN jsonb_build_object(
      'success', true,
      'awarded', false,
      'points_awarded', 0,
      'message', 'Course reward already claimed previously.',
      'new_balance', v_wallet_balance
    );
  END IF;

  -- Calculate points
  IF p_is_perfect THEN
    v_bonus := 10;
  END IF;
  v_total := v_points + v_bonus;

  -- Atomic update of wallet
  UPDATE public.learner_wallets
  SET balance = balance + v_total,
      lifetime_earned = lifetime_earned + v_total,
      updated_at = now()
  WHERE learner_id = p_learner_id
  RETURNING balance INTO v_wallet_balance;

  -- Record transaction
  INSERT INTO public.point_transactions (
    learner_id, amount, transaction_type, source_type, source_id, description
  ) VALUES (
    p_learner_id, v_total, 'COURSE_REWARD', 'course', p_course_id, 
    'Completed course: ' || p_course_id || (CASE WHEN p_is_perfect THEN ' (Perfect Quiz Bonus!)' ELSE '' END)
  ) RETURNING id INTO v_tx_id;

  RETURN jsonb_build_object(
    'success', true,
    'awarded', true,
    'points_awarded', v_total,
    'message', 'Course reward awarded successfully!',
    'new_balance', v_wallet_balance,
    'transaction_id', v_tx_id
  );
END;
$$;

-- 2. Purchase Builder Item (Server-Side Price Lookup & Anti-Tampering)
CREATE OR REPLACE FUNCTION public.purchase_builder_item(
  p_learner_id UUID,
  p_item_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item public.builder_items%ROWTYPE;
  v_wallet public.learner_wallets%ROWTYPE;
  v_tx_id UUID;
  v_new_balance INTEGER;
BEGIN
  -- Lookup item from authoritative server catalog
  SELECT * INTO v_item FROM public.builder_items WHERE id = p_item_id AND active = true;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'ITEM_NOT_FOUND', 'message', 'Item does not exist in store.');
  END IF;

  -- Fetch learner wallet
  SELECT * INTO v_wallet FROM public.learner_wallets WHERE learner_id = p_learner_id;
  IF NOT FOUND OR v_wallet.balance < v_item.point_cost THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'INSUFFICIENT_FUNDS', 
      'message', 'Not enough points.',
      'required_points', v_item.point_cost,
      'current_balance', COALESCE(v_wallet.balance, 0)
    );
  END IF;

  -- Atomic Deduction
  UPDATE public.learner_wallets
  SET balance = balance - v_item.point_cost,
      lifetime_spent = lifetime_spent + v_item.point_cost,
      updated_at = now()
  WHERE learner_id = p_learner_id
  RETURNING balance INTO v_new_balance;

  -- Create Purchase Transaction
  INSERT INTO public.point_transactions (
    learner_id, amount, transaction_type, source_type, source_id, description
  ) VALUES (
    p_learner_id, -v_item.point_cost, 'PURCHASE', 'item', p_item_id, 'Purchased item: ' || v_item.name
  ) RETURNING id INTO v_tx_id;

  -- Add/Update Learner Inventory
  INSERT INTO public.learner_inventory (
    learner_id, item_id, quantity, level, purchase_transaction_id
  ) VALUES (
    p_learner_id, p_item_id, 1, 1, v_tx_id
  )
  ON CONFLICT (learner_id, item_id) DO UPDATE SET
    quantity = public.learner_inventory.quantity + (CASE WHEN v_item.item_type = 'QUANTITY_ITEM' THEN 1 ELSE 0 END);

  RETURN jsonb_build_object(
    'success', true,
    'item_id', p_item_id,
    'item_name', v_item.name,
    'points_spent', v_item.point_cost,
    'new_balance', v_new_balance,
    'transaction_id', v_tx_id
  );
END;
$$;
