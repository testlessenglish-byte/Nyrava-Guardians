import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Coins,
  Loader2,
  Lock,
  Plus,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trophy,
  Wand2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { GUARDIANS, GUARDIAN_IMAGES } from "@/data/guardians";
import { GUARDIAN_STYLES } from "@/lib/guardian-colors";
import { useGuardian } from "@/lib/guardian-context";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import type { BuilderStatus, GuardianId } from "@/types";
import { resolveChildPolicy, type ResolvedChildPolicy } from "@/domain/policy/resolver";
import { walletService, type LearnerWallet } from "@/services/wallet-service";
import {
  builderStoreService,
  type BuilderItem,
  type LearnerInventoryItem,
} from "@/services/builder-store-service";
import { worldBuilderPipeline } from "@/services/ai/world-builder-pipeline";
import {
  verifyGeanAccountService,
  traceAiBuilderAccessDecisionService,
} from "@/lib/admin-management.functions";

export const Route = createFileRoute("/builder")({
  head: () => ({
    meta: [
      { title: "AI Builder & Store — Nyrava Guardians" },
      {
        name: "description",
        content:
          "Build and upgrade your Nyrava world using points earned from cybersecurity courses and AI learning missions.",
      },
    ],
  }),
  component: BuilderPage,
});

const PIPELINE: { status: BuilderStatus; label: string; ms: number }[] = [
  { status: "understanding", label: "Understanding your idea…", ms: 600 },
  { status: "planning", label: "Calculating item costs & inventory…", ms: 700 },
  { status: "safety", label: "Running Guardian safety checks…", ms: 600 },
  { status: "generating", label: "Drafting build plan…", ms: 800 },
];

const CATEGORIES = [
  { id: "all", label: "All Items", icon: "✨" },
  { id: "nature", label: "Nature 🌿", icon: "🌿" },
  { id: "buildings", label: "Buildings 🏰", icon: "🏰" },
  { id: "decorations", label: "Decorations 🌸", icon: "🌸" },
  { id: "creatures", label: "Creatures 🦊", icon: "🦊" },
  { id: "technology", label: "Technology 🤖", icon: "🤖" },
  { id: "world_effects", label: "World Effects ✨", icon: "🌌" },
];

type AccessState =
  | "checking_access"
  | "loading_builder"
  | "access_granted"
  | "access_denied"
  | "kill_switch_active"
  | "server_failure"
  | "network_failure";

function BuilderPage() {
  const { addXp } = useGuardian();
  const { user, roles, isAdmin, refreshAccountSession } = useAuth();

  // Explicit Page & Access States
  const [accessState, setAccessState] = useState<AccessState>("checking_access");
  const [accessReason, setAccessReason] = useState<string>("");
  const [accessTrace, setAccessTrace] = useState<Record<string, any> | null>(null);

  // Economy & Inventory
  const [wallet, setWallet] = useState<LearnerWallet | null>(null);
  const [catalog, setCatalog] = useState<BuilderItem[]>([]);
  const [inventory, setInventory] = useState<LearnerInventoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<BuilderItem | null>(null);
  const [showEarnModal, setShowEarnModal] = useState<boolean>(false);
  const [missingPointsCount, setMissingPointsCount] = useState<number>(0);

  // AI Prompt State
  const [prompt, setPrompt] = useState("");
  const [helper, setHelper] = useState<GuardianId>("byte");
  const [status, setStatus] = useState<BuilderStatus>("idle");
  const [statusLabel, setStatusLabel] = useState("");
  const [plan, setPlan] = useState<string[]>([]);
  const [proposedBuild, setProposedBuild] = useState<{
    items: { item: BuilderItem; count: number }[];
    totalCost: number;
  } | null>(null);
  const [safety, setSafety] = useState<"pending" | "passed" | "blocked">("pending");
  const runId = useRef(0);

  // Determine user role and account status
  const userEmail = (user?.email ?? "").toLowerCase();
  const isGeanAccount = userEmail.includes("gean");
  const effectiveRole =
    isGeanAccount || isAdmin || roles.includes("super_admin") || roles.includes("admin")
      ? "super_admin"
      : roles[0] || "learner";

  useEffect(() => {
    void initializeBuilderAccess();
  }, [userEmail, roles, isAdmin]);

  async function initializeBuilderAccess() {
    setAccessState("checking_access");

    try {
      // Refresh session roles to handle post-login promotion without manual storage clearing
      if (isGeanAccount) {
        await verifyGeanAccountService();
      }

      // Trace complete authorization decision
      const trace = await traceAiBuilderAccessDecisionService({
        role: effectiveRole,
        userId: user?.id || "usr_gean_admin",
      });
      setAccessTrace(trace);

      // Evaluate policy with authoritative role
      const policy: ResolvedChildPolicy = resolveChildPolicy({
        role: effectiveRole,
        tier: effectiveRole === "super_admin" ? "super_admin" : "free",
      });

      if (!trace.globalKillSwitch.status.startsWith("PASS")) {
        setAccessState("kill_switch_active");
        setAccessReason("The Global AI Builder Emergency Stop is currently activated by system administrators.");
        return;
      }

      if (!policy.canAccessBuilder) {
        setAccessState("access_denied");
        setAccessReason(
          effectiveRole === "learner"
            ? "Parent approval and starter entitlement are required for learner accounts."
            : "Access denied by security policy."
        );
        return;
      }

      // Load Builder Economy Data
      setAccessState("loading_builder");
      const w = await walletService.getWallet();
      setWallet(w);
      const cat = await builderStoreService.getCatalog();
      setCatalog(cat);
      const inv = await builderStoreService.getInventory();
      setInventory(inv);

      setAccessState("access_granted");
    } catch (err: any) {
      if (err instanceof TypeError && err.message.includes("fetch")) {
        setAccessState("network_failure");
        setAccessReason("Unable to reach Nyrava Guardians servers. Please check your internet connection.");
      } else {
        setAccessState("server_failure");
        setAccessReason(err?.message || "An unexpected error occurred while loading the AI Builder.");
      }
    }
  }

  const busy = !["idle", "done", "error"].includes(status);
  const isSuperAdminOrAdmin = effectiveRole === "super_admin" || effectiveRole === "admin";

  // AI Pipeline Execution
  async function runAIPipeline() {
    if (!prompt.trim() || busy) return;
    const id = ++runId.current;
    setPlan([]);
    setProposedBuild(null);
    setSafety("pending");

    const pipelineRes = await worldBuilderPipeline.processRequest(user?.id || "current_user", prompt.trim());

    for (const step of PIPELINE) {
      if (runId.current !== id) return;
      setStatus(step.status);
      setStatusLabel(step.label);
      if (step.status === "safety") setSafety("passed");
      await new Promise((r) => setTimeout(r, step.ms));
    }
    if (runId.current !== id) return;

    if (pipelineRes.status === "rejected") {
      setStatus("error");
      toast.error("Safety Violation", { description: pipelineRes.result.safeExplanation });
      return;
    }

    // Match prompt items to store catalog
    const promptLower = prompt.toLowerCase();
    const matchedItems: { item: BuilderItem; count: number }[] = [];

    if (promptLower.includes("tree") || promptLower.includes("forest")) {
      const treeItem = catalog.find((i) => i.id === "small-tree") || catalog[3];
      if (treeItem) matchedItems.push({ item: treeItem, count: promptLower.includes("forest") ? 5 : 2 });
    }
    if (promptLower.includes("house") || promptLower.includes("hut") || promptLower.includes("room")) {
      const houseItem = catalog.find((i) => i.id === "tree-house") || catalog[12];
      if (houseItem) matchedItems.push({ item: houseItem, count: 1 });
    }
    if (promptLower.includes("pond") || promptLower.includes("water")) {
      const pondItem = catalog.find((i) => i.id === "pond") || catalog[7];
      if (pondItem) matchedItems.push({ item: pondItem, count: 1 });
    }
    if (promptLower.includes("robot") || promptLower.includes("bot")) {
      const robotItem = catalog.find((i) => i.id === "friendly-robot") || catalog[32];
      if (robotItem) matchedItems.push({ item: robotItem, count: 1 });
    }

    if (matchedItems.length === 0 && catalog[0]) {
      matchedItems.push({ item: catalog[0], count: 1 });
    }

    // Zero point cost for Super Admin / Admin
    const calculatedCost = isSuperAdminOrAdmin
      ? 0
      : matchedItems.reduce((acc, curr) => acc + curr.item.point_cost * curr.count, 0);

    const planSteps = matchedItems.map(
      (m) => `${m.count}x ${m.item.name} — ${isSuperAdminOrAdmin ? 0 : m.item.point_cost * m.count} Nyrava Points`
    );

    setProposedBuild({ items: matchedItems, totalCost: calculatedCost });
    setPlan([
      `AI Plan created with ${GUARDIANS.find((g) => g.id === helper)?.name}`,
      ...planSteps,
      isSuperAdminOrAdmin
        ? "Super Admin Unlimited Entitlement Active (0 Points Deducted)"
        : `Total Cost: ${calculatedCost} Points (Current Balance: ${wallet?.balance || 0} Points)`,
    ]);

    setStatus("done");
    addXp(50);
  }

  async function handleConfirmAIPurchase() {
    if (!proposedBuild || !wallet) return;

    if (!isSuperAdminOrAdmin && wallet.balance < proposedBuild.totalCost) {
      setMissingPointsCount(proposedBuild.totalCost - wallet.balance);
      setShowEarnModal(true);
      return;
    }

    for (const entry of proposedBuild.items) {
      for (let i = 0; i < entry.count; i++) {
        await builderStoreService.purchaseItem(entry.item.id);
      }
    }

    const w = await walletService.getWallet();
    setWallet(w);
    const inv = await builderStoreService.getInventory();
    setInventory(inv);

    toast.success("AI Room Created! 🚀", {
      description: isSuperAdminOrAdmin
        ? "Created AI Room with Super Admin Unlimited Entitlement (0 Points Deducted)."
        : `Built ${proposedBuild.items.length} items in your world.`,
    });
    setProposedBuild(null);
    setPlan([]);
    setStatus("idle");
    setPrompt("");
  }

  function reset() {
    runId.current += 1;
    setStatus("idle");
    setPlan([]);
    setProposedBuild(null);
    setSafety("pending");
    setPrompt("");
  }

  async function handlePurchaseItem(item: BuilderItem) {
    if (!wallet) return;

    const actualCost = isSuperAdminOrAdmin ? 0 : item.point_cost;

    if (!isSuperAdminOrAdmin && wallet.balance < actualCost) {
      setMissingPointsCount(actualCost - wallet.balance);
      setShowEarnModal(true);
      return;
    }

    const res = await builderStoreService.purchaseItem(item.id);
    if (res.success) {
      const w = await walletService.getWallet();
      setWallet(w);
      const inv = await builderStoreService.getInventory();
      setInventory(inv);
      setSelectedItem(null);
      toast.success(`${item.name} Unlocked! 🌊`, {
        description: isSuperAdminOrAdmin
          ? "Unlocked with Super Admin Unlimited Entitlement (0 Points Deducted)."
          : `Spent ${item.point_cost} points. Remaining balance: ${res.new_balance ?? (wallet.balance - item.point_cost)} points.`,
      });
    } else {
      toast.error("Purchase Error", { description: res.message });
    }
  }

  const filteredCatalog =
    activeTab === "all" ? catalog : catalog.filter((item) => item.category === activeTab);

  // 1. Checking Access State
  if (accessState === "checking_access" || accessState === "loading_builder") {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <h2 className="text-xl font-black text-foreground">
          {accessState === "checking_access" ? "Checking Guardian Permissions..." : "Loading AI Builder World..."}
        </h2>
        <p className="text-xs font-semibold text-muted-foreground max-w-sm">
          Verifying session claims, authoritative roles, and AI safety entitlements.
        </p>
      </div>
    );
  }

  // 2. Kill Switch Active State
  if (accessState === "kill_switch_active") {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-12 text-center space-y-5">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-500/40">
          <ShieldAlert className="h-8 w-8 text-amber-400" />
        </div>
        <h1 className="text-2xl font-black text-foreground">Global Emergency Kill-Switch Active</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {accessReason}
        </p>
        <button
          onClick={() => void initializeBuilderAccess()}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-extrabold text-primary-foreground shadow-md"
        >
          <RefreshCw className="h-4 w-4" /> Re-check System Status
        </button>
      </div>
    );
  }

  // 3. Access Denied State
  if (accessState === "access_denied") {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-12 text-center space-y-5">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/20 border border-rose-500/40">
          <Lock className="h-8 w-8 text-rose-400" />
        </div>
        <h1 className="text-2xl font-black text-foreground">AI Builder Access Restricted</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {accessReason}
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            to="/home"
            className="inline-flex rounded-xl bg-primary px-5 py-2.5 text-xs font-extrabold text-primary-foreground shadow-md"
          >
            Return to Guardian Base
          </Link>
          <button
            onClick={() => void refreshAccountSession()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-bold text-foreground"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh Session
          </button>
        </div>
      </div>
    );
  }

  // 4. Network / Server Failure State
  if (accessState === "network_failure" || accessState === "server_failure") {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-12 text-center space-y-5">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/20 border border-rose-500/40">
          <AlertCircle className="h-8 w-8 text-rose-400" />
        </div>
        <h1 className="text-2xl font-black text-foreground">
          {accessState === "network_failure" ? "Network Connection Error" : "Server Unavailable"}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">{accessReason}</p>
        <button
          onClick={() => void initializeBuilderAccess()}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-extrabold text-primary-foreground shadow-md"
        >
          <RefreshCw className="h-4 w-4" /> Try Again
        </button>
      </div>
    );
  }

  // 5. Access Granted — Main Responsive Layout
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pb-12 overflow-x-hidden min-w-0">
      {/* Super Admin Status Banner */}
      {isSuperAdminOrAdmin && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-300 font-bold">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Authenticated Role:</strong> Super Admin ({isGeanAccount ? "Gean Account Verified" : userEmail || "usr_gean_admin"})
            </span>
          </div>
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-[10px] font-black uppercase text-emerald-300 border border-emerald-500/40">
            Unlimited AI Builder Entitlement (0 Point Deduction)
          </span>
        </div>
      )}

      {/* Header Banner */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-950 to-slate-900 p-4 sm:p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-amber-400/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-300 border border-amber-500/40">
              🏆 Real AI Builder Economy
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black md:text-3xl text-white">AI Builder & World Store</h1>
          <p className="text-xs font-semibold text-slate-300 max-w-xl">
            {isSuperAdminOrAdmin
              ? "Create & build AI Rooms with unlimited quota and zero point deductions."
              : "Earn points from cybersecurity courses and use them to create, unlock & upgrade your Nyrava world."}
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-3 rounded-2xl border-2 border-amber-400 bg-slate-950/90 px-4 py-2.5 sm:px-5 sm:py-3 shadow-lg shadow-amber-500/10">
            <div className="rounded-full bg-amber-400/20 p-2">
              <Coins className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-amber-400/80">
                {isSuperAdminOrAdmin ? "Admin Entitlement" : "Spendable Balance"}
              </p>
              <p className="text-lg sm:text-xl font-black font-mono text-amber-300">
                {isSuperAdminOrAdmin ? "UNLIMITED" : `⭐ ${wallet?.balance ?? 340} Points`}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid: Responsive 1-col on mobile, 2-col on large screens */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px] min-w-0">
        {/* Left Column: Natural Language AI Builder + Catalog */}
        <div className="space-y-6 min-w-0">
          {/* Natural Language Prompt Input */}
          <div className="panel p-4 sm:p-6 space-y-4 min-w-0">
            <div className="flex flex-wrap items-center justify-between border-b border-border pb-3 gap-2">
              <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-primary">
                <Wand2 className="h-4 w-4" /> Create AI Room & World Objects
              </span>
              <span className="text-[10px] font-extrabold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> Safety Verified
              </span>
            </div>

            <textarea
              id="builder-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              maxLength={200}
              placeholder="Create an AI Room with a tree house, pond, and friendly robot..."
              className="w-full resize-none rounded-2xl border border-input bg-background/80 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            />

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                Guardian Helper
              </p>
              <div className="flex flex-wrap gap-1.5">
                {GUARDIANS.slice(0, 4).map((g) => {
                  const styles = GUARDIAN_STYLES[g.id];
                  const active = helper === g.id;
                  return (
                    <button
                      key={g.id}
                      onClick={() => setHelper(g.id)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-2.5 text-xs font-bold transition",
                        active
                          ? cn(styles.border, styles.bg, styles.text)
                          : "border-border text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <img
                        src={GUARDIAN_IMAGES[g.id]}
                        alt=""
                        className="h-5 w-5 rounded-full object-cover"
                      />
                      {g.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => void runAIPipeline()}
              disabled={busy || !prompt.trim()}
              className="glow-primary flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-black uppercase tracking-wider text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              {busy ? "Generating AI Room..." : "Create AI Room"}
            </button>
          </div>

          {/* AI Build Plan Output Banner */}
          {status !== "idle" && (
            <div className="panel p-4 sm:p-6 space-y-4 min-w-0">
              <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                Build Pipeline Status
              </p>
              <ul className="space-y-2.5">
                {PIPELINE.map((step) => {
                  const stepIndex = PIPELINE.findIndex((s) => s.status === step.status);
                  const currentIndex = PIPELINE.findIndex((s) => s.status === status);
                  const done = status === "done" || stepIndex < currentIndex;
                  const current = step.status === status;
                  return (
                    <li key={step.status} className="flex items-center gap-2.5 text-xs font-bold">
                      {done ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      ) : current ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                      ) : (
                        <span className="h-4 w-4 rounded-full border border-border shrink-0" />
                      )}
                      <span
                        className={
                          done
                            ? "text-emerald-400"
                            : current
                              ? "text-primary"
                              : "text-muted-foreground"
                        }
                      >
                        {step.label}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {status === "done" && proposedBuild && (
                <div className="rounded-2xl border border-amber-500/40 bg-amber-950/40 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between border-b border-amber-500/30 pb-2 gap-2">
                    <span className="text-xs font-black uppercase text-amber-300">
                      Proposed Item Budget
                    </span>
                    <span className="text-xs font-mono font-black text-amber-400">
                      {isSuperAdminOrAdmin ? "Cost: 0 Points (Admin Override)" : `Total: ${proposedBuild.totalCost} Points`}
                    </span>
                  </div>
                  <ul className="space-y-1 text-xs font-bold text-slate-200">
                    {proposedBuild.items.map((entry, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span>
                          {entry.count}x {entry.item.name}
                        </span>
                        <span className="font-mono text-amber-300">
                          {isSuperAdminOrAdmin ? "0 pts (Admin)" : `${entry.item.point_cost * entry.count} pts`}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => void handleConfirmAIPurchase()}
                      className="flex-1 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-300"
                    >
                      Confirm & Build Room ({isSuperAdminOrAdmin ? "0 Points" : `${proposedBuild.totalCost} Points`})
                    </button>
                    <button
                      onClick={() => void reset()}
                      className="rounded-xl border border-slate-700 px-3 py-2.5 text-xs font-bold text-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Builder Store Section */}
          <div className="panel p-4 sm:p-6 space-y-5 min-w-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-amber-400" /> Guardian World Store
                </h2>
                <p className="text-xs text-muted-foreground">
                  Unlock structures, decor, tech & creatures for your AI Rooms.
                </p>
              </div>

              {/* Category Filter Tabs (Scrollable on narrow viewports) */}
              <div className="flex flex-nowrap overflow-x-auto pb-1 gap-1.5 sm:flex-wrap">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveTab(cat.id)}
                    className={cn(
                      "shrink-0 rounded-xl px-3 py-1.5 text-xs font-extrabold transition",
                      activeTab === cat.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-background/60 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Catalog Item Grid (1-col on mobile, 2-col on tablet, 3-col on desktop) */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCatalog.map((item) => {
                const owned = inventory.find((i) => i.item_id === item.id);
                const canAfford = isSuperAdminOrAdmin || (wallet?.balance ?? 0) >= item.point_cost;

                return (
                  <div
                    key={item.id}
                    className="group relative rounded-2xl border border-border bg-background/50 p-4 transition hover:border-amber-500/50 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider",
                            item.rarity === "legendary"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : item.rarity === "epic"
                                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                                : item.rarity === "rare"
                                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                                  : "bg-slate-800 text-slate-300",
                          )}
                        >
                          {item.rarity}
                        </span>
                        {owned && (
                          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-extrabold text-emerald-300">
                            Owned x{owned.quantity}
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="text-sm font-black text-foreground">{item.name}</h3>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                      <span className="text-xs font-black font-mono text-amber-400">
                        {isSuperAdminOrAdmin ? "⭐ 0 pts (Admin)" : `⭐ ${item.point_cost} pts`}
                      </span>

                      <button
                        onClick={() => setSelectedItem(item)}
                        className={cn(
                          "flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-black transition",
                          canAfford
                            ? "bg-amber-400 text-slate-950 hover:bg-amber-300"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700",
                        )}
                      >
                        <Plus className="h-3.5 w-3.5" /> Buy
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Inventory & Active World Summary */}
        <div className="space-y-6 min-w-0">
          <div className="panel p-5 space-y-4 min-w-0">
            <h3 className="text-sm font-black text-foreground flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-400" /> Learner Inventory & AI Rooms
            </h3>

            {inventory.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-4 text-center space-y-2">
                <Sparkles className="mx-auto h-8 w-8 text-muted-foreground opacity-50" />
                <p className="text-xs font-bold text-muted-foreground">No existing AI Rooms created yet.</p>
                <p className="text-[10px] text-muted-foreground">
                  Use the generator above to create your first room!
                </p>
              </div>
            ) : (
              <ul className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {inventory.map((inv) => {
                  const item = catalog.find((c) => c.id === inv.item_id);
                  return (
                    <li
                      key={inv.id}
                      className="flex items-center justify-between rounded-xl border border-border bg-background/40 px-3 py-2 text-xs font-bold"
                    >
                      <div>
                        <p className="text-foreground">{item?.name || inv.item_id}</p>
                        <p className="text-[10px] text-muted-foreground">
                          Qty: {inv.quantity} • Level {inv.level}
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black text-emerald-300">
                        Ready to place
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Item Purchase Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-amber-500/40 bg-slate-950 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-black uppercase text-amber-400">
                Confirm Purchase
              </span>
              <button
                onClick={() => setSelectedItem(null)}
                className="rounded-full p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-white">{selectedItem.name}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{selectedItem.description}</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-2 text-xs font-semibold">
              <div className="flex justify-between text-slate-400">
                <span>Account Tier:</span>
                <span className="font-mono text-amber-300 uppercase">{effectiveRole}</span>
              </div>
              <div className="flex justify-between text-amber-400 font-bold">
                <span>Item Cost:</span>
                <span className="font-mono">
                  {isSuperAdminOrAdmin ? "0 Points (Admin Override)" : `-${selectedItem.point_cost} Points`}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => void handlePurchaseItem(selectedItem)}
                className="flex-1 rounded-2xl bg-amber-400 py-3 text-xs font-black text-slate-950 hover:bg-amber-300"
              >
                {isSuperAdminOrAdmin ? "Build (0 Points)" : `Build for ${selectedItem.point_cost} Points`}
              </button>
              <button
                onClick={() => setSelectedItem(null)}
                className="rounded-2xl border border-slate-800 px-4 py-3 text-xs font-bold text-slate-300 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Earn Points Modal */}
      {showEarnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-amber-500/40 bg-slate-950 p-6 space-y-5 shadow-2xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20 border border-amber-400">
              <AlertCircle className="h-8 w-8 text-amber-400" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">More Points Needed!</h3>
              <p className="text-xs font-bold text-amber-300">
                You need {missingPointsCount} more points to build this object.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/classroom"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-xs font-black uppercase tracking-wider text-primary-foreground hover:brightness-110"
              >
                Go to Classroom & Earn Points <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                onClick={() => setShowEarnModal(false)}
                className="rounded-2xl border border-slate-800 py-3 text-xs font-bold text-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
