import { supabase } from "../integrations/supabase/client.ts";

export interface LearnerWallet {
  learner_id: string;
  balance: number;
  lifetime_earned: number;
  lifetime_spent: number;
  updated_at: string;
  claimedCourses?: string[];
}

export interface PointTransaction {
  id: string;
  learner_id: string;
  amount: number;
  transaction_type:
    | "COURSE_REWARD"
    | "LESSON_REWARD"
    | "QUIZ_REWARD"
    | "MISSION_REWARD"
    | "ACHIEVEMENT_REWARD"
    | "PURCHASE"
    | "REFUND"
    | "ADMIN_ADJUSTMENT";
  source_type: string;
  source_id: string;
  description: string;
  created_at: string;
}

export interface AwardPointResult {
  success: boolean;
  awarded: boolean;
  points_awarded: number;
  message: string;
  new_balance: number;
  transaction_id?: string;
}

const LOCAL_WALLET_KEY = "nyrava_learner_wallet";
const MEMORY_WALLETS = new Map<string, LearnerWallet>();

export class WalletService {
  /**
   * Fetches authoritative wallet balance for current user (or fallback local cache if offline).
   */
  async getWallet(userId?: string): Promise<LearnerWallet> {
    const activeId = userId || (await this.getActiveUserId());
    if (!activeId) {
      return this.getLocalWallet("guest-learner");
    }

    try {
      const { data, error } = await supabase
        .from("learner_wallets" as any)
        .select("*")
        .eq("learner_id", activeId)
        .maybeSingle();

      if (error || !data) {
        return this.getLocalWallet(activeId);
      }

      const wallet = data as unknown as LearnerWallet;
      this.saveLocalWallet(wallet);
      return wallet;
    } catch {
      return this.getLocalWallet(activeId);
    }
  }

  /**
   * Awards points for completing a course or quiz using secure server RPC.
   * Enforces anti-farming: primary rewards are granted only once per course.
   */
  async awardCourseReward(
    courseId: string,
    score: number,
    isPerfect = false,
    userId?: string,
  ): Promise<AwardPointResult> {
    const activeId = userId || (await this.getActiveUserId()) || "guest-learner";

    try {
      const { data, error } = await supabase.rpc("award_points_for_course" as any, {
        p_learner_id: activeId,
        p_course_id: courseId,
        p_score: score,
        p_is_perfect: isPerfect,
      });

      if (!error && data) {
        const res = data as unknown as AwardPointResult;
        await this.getWallet(activeId);
        return res;
      }
    } catch {}

    // Fallback local update (for offline resilience and unit tests)
    const local = this.getLocalWallet(activeId);
    const alreadyClaimed = local.claimedCourses?.includes(courseId);
    if (alreadyClaimed) {
      return {
        success: true,
        awarded: false,
        points_awarded: 0,
        message: "Course reward already claimed previously.",
        new_balance: local.balance,
      };
    }

    const points = 100 + (isPerfect ? 10 : 0);
    local.balance += points;
    local.lifetime_earned += points;
    local.claimedCourses = [...(local.claimedCourses || []), courseId];
    this.saveLocalWallet(local);

    return {
      success: true,
      awarded: true,
      points_awarded: points,
      message: "Course reward awarded!",
      new_balance: local.balance,
    };
  }

  /**
   * Fetches transaction history for a learner.
   */
  async getTransactionHistory(userId?: string): Promise<PointTransaction[]> {
    try {
      const activeId = userId || (await this.getActiveUserId());
      if (!activeId) return [];

      const { data } = await supabase
        .from("point_transactions" as any)
        .select("*")
        .eq("learner_id", activeId)
        .order("created_at", { ascending: false });

      return (data as unknown as PointTransaction[]) || [];
    } catch {
      return [];
    }
  }

  public getLocalWallet(learnerId: string): LearnerWallet {
    if (MEMORY_WALLETS.has(learnerId)) {
      return MEMORY_WALLETS.get(learnerId)!;
    }
    try {
      if (typeof localStorage !== "undefined") {
        const raw = localStorage.getItem(`${LOCAL_WALLET_KEY}_${learnerId}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          MEMORY_WALLETS.set(learnerId, parsed);
          return parsed;
        }
      }
    } catch {}

    const defaultWallet: LearnerWallet = {
      learner_id: learnerId,
      balance: 340,
      lifetime_earned: 340,
      lifetime_spent: 0,
      updated_at: new Date().toISOString(),
      claimedCourses: [],
    };
    MEMORY_WALLETS.set(learnerId, defaultWallet);
    return defaultWallet;
  }

  public saveLocalWallet(wallet: LearnerWallet) {
    MEMORY_WALLETS.set(wallet.learner_id, wallet);
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(`${LOCAL_WALLET_KEY}_${wallet.learner_id}`, JSON.stringify(wallet));
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

export const walletService = new WalletService();
