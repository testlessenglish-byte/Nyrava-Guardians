export type SubscriptionTier = "free" | "starter" | "family" | "premium" | "admin" | "super_admin";

export type Entitlements = {
  maxChildProfiles: number;
  academyAccess: boolean;
  worldAccess: boolean;
  missionAccess: boolean;
  builderAccess: boolean;
  advancedAiAccess: boolean;
  premiumCourses: boolean;
  premiumWorlds: boolean;
  parentReports: boolean;
  familyFeatures: boolean;
  adminUnlimitedPoints: boolean;
};

export const TIER_ENTITLEMENTS: Record<SubscriptionTier, Entitlements> = {
  free: {
    maxChildProfiles: 1,
    academyAccess: true,
    worldAccess: true,
    missionAccess: true,
    builderAccess: false,
    advancedAiAccess: false,
    premiumCourses: false,
    premiumWorlds: false,
    parentReports: true,
    familyFeatures: false,
    adminUnlimitedPoints: false,
  },
  starter: {
    maxChildProfiles: 1,
    academyAccess: true,
    worldAccess: true,
    missionAccess: true,
    builderAccess: true,
    advancedAiAccess: false,
    premiumCourses: true,
    premiumWorlds: false,
    parentReports: true,
    familyFeatures: false,
    adminUnlimitedPoints: false,
  },
  family: {
    maxChildProfiles: 3,
    academyAccess: true,
    worldAccess: true,
    missionAccess: true,
    builderAccess: true,
    advancedAiAccess: true,
    premiumCourses: true,
    premiumWorlds: true,
    parentReports: true,
    familyFeatures: true,
    adminUnlimitedPoints: false,
  },
  premium: {
    maxChildProfiles: 5,
    academyAccess: true,
    worldAccess: true,
    missionAccess: true,
    builderAccess: true,
    advancedAiAccess: true,
    premiumCourses: true,
    premiumWorlds: true,
    parentReports: true,
    familyFeatures: true,
    adminUnlimitedPoints: false,
  },
  admin: {
    maxChildProfiles: 999,
    academyAccess: true,
    worldAccess: true,
    missionAccess: true,
    builderAccess: true,
    advancedAiAccess: true,
    premiumCourses: true,
    premiumWorlds: true,
    parentReports: true,
    familyFeatures: true,
    adminUnlimitedPoints: true,
  },
  super_admin: {
    maxChildProfiles: 999,
    academyAccess: true,
    worldAccess: true,
    missionAccess: true,
    builderAccess: true,
    advancedAiAccess: true,
    premiumCourses: true,
    premiumWorlds: true,
    parentReports: true,
    familyFeatures: true,
    adminUnlimitedPoints: true,
  },
};

export type ParentalControlsData = {
  allowAcademy: boolean;
  allowWorld: boolean;
  allowMissions: boolean;
  allowAiBuilder: boolean;
  allowVoice: boolean;
  allowMicrophone: boolean;
  allowExternalLinks: boolean;
  allowMultiplayer: boolean;
  dailyLimitMinutes: number;
  allowedStart: string | null;
  allowedEnd: string | null;
};

export const DEFAULT_PARENTAL_CONTROLS: ParentalControlsData = {
  allowAcademy: true,
  allowWorld: true,
  allowMissions: true,
  allowAiBuilder: false,
  allowVoice: false,
  allowMicrophone: false,
  allowExternalLinks: false,
  allowMultiplayer: false,
  dailyLimitMinutes: 120,
  allowedStart: "07:00",
  allowedEnd: "21:00",
};

export type SystemSafetyPolicy = {
  systemVoiceSupported: boolean;
  systemAiApproved: boolean;
  systemExternalLinksSafe: boolean;
  systemMultiplayerSafe: boolean;
};

export const SYSTEM_SAFETY_POLICY: SystemSafetyPolicy = {
  systemVoiceSupported: true,
  systemAiApproved: true,
  systemExternalLinksSafe: false,
  systemMultiplayerSafe: false,
};

export type ResolvedChildPolicy = {
  canAccessAcademy: boolean;
  canAccessWorld: boolean;
  canAccessMissions: boolean;
  canAccessBuilder: boolean;
  canUseAI: boolean;
  canUseVoice: boolean;
  canUseMicrophone: boolean;
  canUseSocial: boolean;
  canUseMultiplayer: boolean;
  canOpenExternalLinks: boolean;
  timeAccessAllowed: boolean;
  dailyLimitMinutes: number;
  entitlements: Entitlements;
};

export function isWithinAllowedWindow(
  current: string,
  start: string | null,
  end: string | null
): boolean {
  if (!start || !end) return true;
  if (start <= end) {
    return current >= start && current <= end;
  }
  // Overnight window e.g. 21:00 to 07:00
  return current >= start || current <= end;
}

export function resolveChildPolicy({
  tier = "free",
  role,
  parentalControls = DEFAULT_PARENTAL_CONTROLS,
  systemPolicy = SYSTEM_SAFETY_POLICY,
  currentMinutesPlayed = 0,
  currentTimeString = "12:00",
}: {
  tier?: SubscriptionTier;
  role?: string;
  parentalControls?: Partial<ParentalControlsData>;
  systemPolicy?: SystemSafetyPolicy;
  currentMinutesPlayed?: number;
  currentTimeString?: string;
}): ResolvedChildPolicy {
  const isAdminRole = role === "super_admin" || role === "admin" || tier === "super_admin" || tier === "admin";
  const effectiveTier: SubscriptionTier = isAdminRole ? "super_admin" : tier;
  const entitlements = TIER_ENTITLEMENTS[effectiveTier] ?? TIER_ENTITLEMENTS.free;
  const controls = { ...DEFAULT_PARENTAL_CONTROLS, ...parentalControls };

  // Check quiet hours / daily limits (bypassed for Admins)
  let timeAccessAllowed = isAdminRole || currentMinutesPlayed < controls.dailyLimitMinutes;
  if (!isAdminRole && timeAccessAllowed && !isWithinAllowedWindow(currentTimeString, controls.allowedStart, controls.allowedEnd)) {
    timeAccessAllowed = false;
  }

  // Mandatory Hierarchy: Global Kill Switch > System Safety Policy > Parental Restriction > Subscription Entitlements
  const globalAiApproved = systemPolicy.systemAiApproved;

  // For Admin and Super Admin accounts: Parent approval & learner age restrictions must NOT be required.
  const canAccessBuilder = globalAiApproved && (isAdminRole || (controls.allowAiBuilder && entitlements.builderAccess));
  const canUseAI = globalAiApproved && (isAdminRole || (controls.allowAiBuilder && entitlements.builderAccess));

  return {
    canAccessAcademy: isAdminRole || (controls.allowAcademy && entitlements.academyAccess),
    canAccessWorld: isAdminRole || (controls.allowWorld && entitlements.worldAccess),
    canAccessMissions: isAdminRole || (controls.allowMissions && entitlements.missionAccess),
    canAccessBuilder,
    canUseAI,
    canUseVoice: systemPolicy.systemVoiceSupported && (isAdminRole || controls.allowVoice),
    canUseMicrophone:
      systemPolicy.systemVoiceSupported && (isAdminRole || (controls.allowVoice && controls.allowMicrophone)),
    canUseSocial: isAdminRole || (systemPolicy.systemMultiplayerSafe && controls.allowMultiplayer),
    canUseMultiplayer: isAdminRole || (systemPolicy.systemMultiplayerSafe && controls.allowMultiplayer),
    canOpenExternalLinks: isAdminRole || (systemPolicy.systemExternalLinksSafe && controls.allowExternalLinks),
    timeAccessAllowed,
    dailyLimitMinutes: controls.dailyLimitMinutes,
    entitlements,
  };
}
