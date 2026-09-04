-- Nyrava Guardians — Shield & Badge Progression Schema V2
-- PostgreSQL Table Definitions, Unique Idempotency Constraints, and Award Lifecycle History

BEGIN;

-- 1. Badge Definitions Table
CREATE TABLE IF NOT EXISTS public.badge_definitions (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    level INTEGER NOT NULL CHECK (level >= 1 AND level <= 7),
    name_en TEXT NOT NULL,
    name_es TEXT NOT NULL,
    description_en TEXT NOT NULL,
    description_es TEXT NOT NULL,
    unlock_type TEXT NOT NULL CHECK (unlock_type IN ('class_milestone', 'capstone')),
    required_completed_classes INTEGER NOT NULL DEFAULT 1,
    stats_json JSONB NOT NULL DEFAULT '{"defense": 5, "safety": 5, "threat": 5, "courage": 5}'::jsonb,
    perk_label_en TEXT NOT NULL,
    perk_label_es TEXT NOT NULL,
    perk_type TEXT NOT NULL CHECK (perk_type IN ('real_xp_multiplier', 'cosmetic')),
    display_order INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Learner Badges Table (Award Lifecycle: earned -> revoked -> restored)
CREATE TABLE IF NOT EXISTS public.learner_badges (
    id TEXT PRIMARY KEY,
    learner_user_id TEXT NOT NULL,
    badge_id TEXT NOT NULL REFERENCES public.badge_definitions(id) ON DELETE RESTRICT,
    qualifying_completion_id TEXT,
    status TEXT NOT NULL DEFAULT 'earned' CHECK (status IN ('earned', 'revoked', 'restored')),
    earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ,
    restored_at TIMESTAMPTZ,
    revocation_reason TEXT,
    restoration_reason TEXT,
    actor_id TEXT,
    rule_version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partial Unique Index enforcing single active earned badge per learner, permitting audited restorations
CREATE UNIQUE INDEX IF NOT EXISTS idx_active_learner_badge 
ON public.learner_badges (learner_user_id, badge_id) 
WHERE status IN ('earned', 'restored');

-- 3. Seed Standard 7 Shield Definitions (Configurable Milestones)
INSERT INTO public.badge_definitions (
    id, code, level, name_en, name_es, description_en, description_es, unlock_type, required_completed_classes, stats_json, perk_label_en, perk_label_es, perk_type, display_order, status, version
) VALUES
('basic-shield', 'BASIC_SHIELD', 1, 'Basic Shield', 'Escudo Básico', 'The first shield awarded upon completing your 1st class.', 'El primer escudo otorgado al completar tu primera clase.', 'class_milestone', 1, '{"defense": 5, "safety": 5, "threat": 5, "courage": 5}', 'Access to New Areas (Cosmetic)', 'Acceso a nuevas áreas (Cosmético)', 'cosmetic', 1, 'active', 1),
('protector-shield', 'PROTECTOR_SHIELD', 2, 'Protector Shield', 'Escudo Protector', 'Awarded after completing 3 classes.', 'Otorgado tras completar 3 clases.', 'class_milestone', 3, '{"defense": 15, "safety": 15, "threat": 10, "courage": 10}', 'Stronger Defense (Cosmetic)', 'Mayor Defensa (Cosmético)', 'cosmetic', 2, 'active', 1),
('guardian-shield', 'GUARDIAN_SHIELD', 3, 'Guardian Shield', 'Escudo Guardián', 'Awarded after completing 6 classes.', 'Otorgado tras completar 6 clases.', 'class_milestone', 6, '{"defense": 30, "safety": 25, "threat": 20, "courage": 20}', '1.15x Bonus XP Multiplier (Real Perk)', 'Multiplicador 1.15x XP (Beneficio Real)', 'real_xp_multiplier', 3, 'active', 1),
('defender-shield', 'DEFENDER_SHIELD', 4, 'Defender Shield', 'Escudo Defensor', 'Awarded after completing 10 classes.', 'Otorgado tras completar 10 clases.', 'class_milestone', 10, '{"defense": 50, "safety": 40, "threat": 35, "courage": 30}', 'Special Guardian Emotes (Cosmetic)', 'Emoticonos Especiales (Cosmético)', 'cosmetic', 4, 'active', 1),
('champion-shield', 'CHAMPION_SHIELD', 5, 'Champion Shield', 'Escudo Campeón', 'Awarded after completing 15 classes.', 'Otorgado tras completar 15 clases.', 'class_milestone', 15, '{"defense": 75, "safety": 60, "threat": 55, "courage": 50}', '1.25x Bonus XP Multiplier (Real Perk)', 'Multiplicador 1.25x XP (Beneficio Real)', 'real_xp_multiplier', 5, 'active', 1),
('elite-shield', 'ELITE_SHIELD', 6, 'Elite Shield', 'Escudo de Élite', 'Awarded after completing 20 classes.', 'Otorgado tras completar 20 clases.', 'class_milestone', 20, '{"defense": 100, "safety": 80, "threat": 70, "courage": 70}', 'Home & World Upgrades (Cosmetic)', 'Mejoras de Hogar y Mundo (Cosmético)', 'cosmetic', 6, 'active', 1),
('legendary-shield', 'LEGENDARY_SHIELD', 7, 'Legendary Shield', 'Escudo Legendario', 'Awarded after passing the Capstone Challenge & all published paths.', 'Otorgado tras aprobar el Reto Capstone y todas las rutas.', 'capstone', 25, '{"defense": 150, "safety": 120, "threat": 110, "courage": 100}', '1.50x Bonus XP Multiplier (Real Perk)', 'Multiplicador 1.50x XP (Beneficio Real)', 'real_xp_multiplier', 7, 'active', 1)
ON CONFLICT (id) DO UPDATE SET 
    name_en = EXCLUDED.name_en,
    required_completed_classes = EXCLUDED.required_completed_classes,
    updated_at = NOW();

-- Row-Level Security Policies
ALTER TABLE public.badge_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Badge Definitions" ON public.badge_definitions FOR SELECT USING (true);
CREATE POLICY "Learner Read Own Badges" ON public.learner_badges FOR SELECT USING (auth.uid()::text = learner_user_id OR public.is_admin_user());

COMMIT;
