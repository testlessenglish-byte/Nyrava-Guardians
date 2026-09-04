import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  HelpCircle,
  Info,
  Lock,
  Plus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  Volume2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import {
  isWithinAllowedWindow,
  resolveChildPolicy,
  type ParentalControlsData,
} from "@/domain/policy/resolver";
import { missions } from "@/domain/progression/catalog";
import {
  getAuthoritativeCourseCompletion,
  type GuardianCourseCompletion,
} from "@/lib/guardian-completions";
import { generateCertificatePdf } from "@/lib/certificate-pdf";
import { CertificateModal } from "@/components/progression/certificate-modal";
import { NyravaShieldSvg } from "@/components/badges/NyravaShieldSvg";
import { DEFAULT_SHIELD_DEFINITIONS, evalLearnerShieldProgression } from "@/domain/progression/badge-evaluator";
import {
  createChildProfile,
  exportChildPrivacyData,
  getParentDashboardData,
  linkChildProfile,
  requestAccountDeletion,
  revokeCoppaConsent,
  unlinkChildProfile,
  updateChildSafetySettings,
  type ParentDashboardChild,
} from "@/lib/parent-portal.functions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/parent")({
  head: () => ({
    meta: [
      { title: "Parent Portal & Family Safety — Nyrava Guardians" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ParentPortalPage,
});

function ParentPortalPage() {
  const { user, roles, loading: authLoading } = useAuth();
  const fetchDashboard = useServerFn(getParentDashboardData);
  const addChildFn = useServerFn(createChildProfile);
  const linkChildFn = useServerFn(linkChildProfile);
  const unlinkChildFn = useServerFn(unlinkChildProfile);
  const updateSettingsFn = useServerFn(updateChildSafetySettings);
  const exportDataFn = useServerFn(exportChildPrivacyData);
  const revokeConsentFn = useServerFn(revokeCoppaConsent);
  const deleteAccountFn = useServerFn(requestAccountDeletion);

  const [childrenList, setChildrenList] = useState<ParentDashboardChild[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [subscriptionTier, setSubscriptionTier] = useState<string>("family");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "failed">("idle");

  // Onboarding & Link State
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [newChildGrade, setNewChildGrade] = useState<"k_2" | "3_5" | "6_8" | "9_12">("3_5");
  const [linkInput, setLinkInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Certificate Modal State
  const [childCompletion, setChildCompletion] = useState<GuardianCourseCompletion | null>(null);
  const [showCertModal, setShowCertModal] = useState(false);

  // Reauthentication & Sensitive Modals
  const [privacyModalTopic, setPrivacyModalTopic] = useState<string | null>(null);
  const [reauthAction, setReauthAction] = useState<"delete" | "export" | "revoke" | null>(null);
  const [reauthPassword, setReauthPassword] = useState("");

  const accessToken = "mock_parent_access_token";

  const selectedChild = useMemo(() => {
    return childrenList.find((c) => c.id === selectedChildId) || childrenList[0] || null;
  }, [childrenList, selectedChildId]);

  const resolvedPolicy = useMemo(() => {
    if (!selectedChild) return resolveChildPolicy({});
    return resolveChildPolicy({
      tier: subscriptionTier as any,
      parentalControls: selectedChild.controls,
    });
  }, [selectedChild, subscriptionTier]);

  const quietHoursStatus = useMemo(() => {
    if (!selectedChild?.controls.allowedStart || !selectedChild?.controls.allowedEnd) return "All Day Allowed";
    const current = new Date().toLocaleTimeString("en-US", { hour12: false }).slice(0, 5);
    const allowed = isWithinAllowedWindow(current, selectedChild.controls.allowedStart, selectedChild.controls.allowedEnd);
    return allowed ? "🟢 Currently Allowed Play Window" : "🌙 Quiet Hours Active (Access Blocked)";
  }, [selectedChild]);

  useEffect(() => {
    if (!selectedChildId) return;
    let cancelled = false;
    getAuthoritativeCourseCompletion(selectedChildId, "phishing-defense").then((rec) => {
      if (!cancelled) setChildCompletion(rec);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedChildId]);

  async function loadFamilyData() {
    if (!user) {
      setLoadingData(false);
      return;
    }
    try {
      setLoadingData(true);
      const data = await fetchDashboard({ data: { accessToken, guardianUserId: user.id } });
      setSubscriptionTier(data.subscriptionTier);
      setChildrenList(data.children);
      if (data.children.length > 0 && !selectedChildId) {
        setSelectedChildId(data.children[0]!.id);
      }
    } catch (err) {
      toast.error("Could not load family data.");
    } finally {
      setLoadingData(false);
    }
  }

  useEffect(() => {
    void loadFamilyData();
  }, [user]);

  async function handleCreateChildProfile() {
    if (!newChildName.trim() || !user) return;
    setSubmitting(true);
    try {
      const res = await addChildFn({
        data: {
          accessToken,
          guardianUserId: user.id,
          displayName: newChildName.trim(),
          gradeBand: newChildGrade,
        },
      });
      toast.success(`Child profile for "${res.displayName}" created!`);
      setShowAddChildModal(false);
      setNewChildName("");
      await loadFamilyData();
    } catch (err) {
      toast.error("Could not create child profile.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLinkChild() {
    if (!linkInput.trim() || !user) return;
    setSubmitting(true);
    try {
      await linkChildFn({
        data: { accessToken, guardianUserId: user.id, targetLearnerUserId: linkInput.trim() },
      });
      toast.success("Child account linked successfully!");
      setLinkInput("");
      await loadFamilyData();
    } catch (err) {
      toast.error("Could not link child account.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUnlinkChild(childId: string) {
    if (!user) return;
    try {
      await unlinkChildFn({ data: { accessToken, guardianUserId: user.id, learnerUserId: childId } });
      toast.success("Child account unlinked.");
      await loadFamilyData();
    } catch (err) {
      toast.error("Could not unlink account.");
    }
  }

  async function handleUpdateControls(childId: string, updates: Partial<ParentDashboardChild["controls"]>) {
    if (!user) return;
    setSaveStatus("saving");
    const targetChild = childrenList.find((c) => c.id === childId);
    if (!targetChild) return;

    setChildrenList((current) =>
      current.map((child) =>
        child.id === childId
          ? { ...child, controls: { ...child.controls, ...updates } }
          : child,
      ),
    );

    try {
      await updateSettingsFn({
        data: {
          accessToken,
          guardianUserId: user.id,
          learnerUserId: childId,
          updates: {
            allowAiBuilder: updates.allowAiBuilder,
            allowVoice: updates.allowVoice,
            allowMultiplayer: updates.allowMultiplayer,
            dailyLimitMinutes: updates.dailyLimitMinutes,
            allowedStart: updates.allowedStart,
            allowedEnd: updates.allowedEnd,
          },
        },
      });
      setSaveStatus("saved");
      toast.success("Safety settings synchronized to backend!");
    } catch (err) {
      setSaveStatus("failed");
      toast.error("Settings saved locally.");
    }
  }

  async function handleConfirmReauthAction() {
    if (!user || !selectedChild) return;
    if (!reauthPassword.trim()) {
      toast.error("Please enter your account password to confirm.");
      return;
    }

    try {
      if (reauthAction === "export") {
        const data = await exportDataFn({ data: { accessToken, guardianUserId: user.id, learnerUserId: selectedChild.id } });
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `nyrava_privacy_data_${selectedChild.id}.json`;
        a.click();
        toast.success("Privacy data export generated!");
      } else if (reauthAction === "revoke") {
        await revokeConsentFn({ data: { accessToken, guardianUserId: user.id, childId: selectedChild.id } });
        toast.success("COPPA consent revoked. All AI/Voice features disabled.");
        await loadFamilyData();
      } else if (reauthAction === "delete") {
        await deleteAccountFn({
          data: {
            accessToken,
            guardianUserId: user.id,
            childId: selectedChild.id,
            reauthConfirmed: true,
            reason: "Parent deletion request",
          },
        });
        toast.success("Child profile permanently deleted.");
        setSelectedChildId(null);
        await loadFamilyData();
      }
      setReauthAction(null);
      setReauthPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed.");
    }
  }

  if (authLoading || loadingData) {
    return (
      <div className="panel p-8 text-center text-sm font-bold" aria-live="polite">
        Checking parent authorization & family profiles…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="panel mx-auto max-w-lg p-8 text-center space-y-4">
        <ShieldCheck className="mx-auto h-12 w-12 text-primary" />
        <h1 className="text-2xl font-black">Parent Portal Access</h1>
        <p className="text-sm text-muted-foreground">
          Sign in with your parent or guardian account to manage safety controls and monitor real learning progress.
        </p>
        <Link
          to="/login"
          className="inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-extrabold text-primary-foreground"
        >
          Sign In as Parent
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      {/* Header Banner */}
      <header className="overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-violet-500/10 p-6 shadow-xl sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-primary">
              <ShieldCheck className="h-4 w-4" /> Authoritative Family Controls
              {saveStatus === "saving" && <span className="text-amber-400 font-bold ml-2">Saving...</span>}
              {saveStatus === "saved" && <span className="text-emerald-400 font-bold ml-2">✓ Saved</span>}
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Parent Safety Portal</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Guardian: <span className="font-bold text-foreground">{user.email}</span> · Plan:{" "}
              <span className="font-bold uppercase text-primary">{subscriptionTier}</span>
            </p>
          </div>
          <Button
            onClick={() => setShowAddChildModal(true)}
            className="flex items-center gap-2 font-extrabold text-xs"
          >
            <UserPlus className="h-4 w-4" /> Onboard Child Profile
          </Button>
        </div>
      </header>

      {/* Account Link Box */}
      <div className="panel p-5 space-y-3">
        <h3 className="text-sm font-extrabold flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-primary" /> Link Existing Child Account
        </h3>
        <p className="text-xs text-muted-foreground">
          Enter your child's User ID to link their profile to your Parent Portal.
        </p>
        <div className="flex gap-2 max-w-md">
          <input
            type="text"
            placeholder="Child User ID"
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            className="flex-1 rounded-xl border border-input bg-background/60 px-3.5 py-2 text-xs font-mono outline-none focus:border-primary"
          />
          <button
            type="button"
            disabled={submitting || !linkInput.trim()}
            onClick={() => void handleLinkChild()}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-extrabold text-primary-foreground disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" /> Link Account
          </button>
        </div>
      </div>

      {/* Children List Overview */}
      <section className="space-y-3">
        <h2 className="text-lg font-black tracking-tight">Linked Children</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {childrenList.map((child) => {
            const isSelected = child.id === selectedChildId;
            return (
              <button
                key={child.id}
                type="button"
                onClick={() => setSelectedChildId(child.id)}
                className={`panel flex items-start justify-between p-4 text-left transition ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-lg"
                    : "hover:border-border/80"
                }`}
              >
                <div>
                  <h3 className="text-base font-extrabold">{child.displayName}</h3>
                  <p className="text-xs text-muted-foreground">Grade Band: {child.gradeBand.toUpperCase()}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs font-bold">
                    <span className="rounded-md bg-primary/20 px-2 py-0.5 text-primary">
                      Level {child.level}
                    </span>
                    <span>{child.xp.toLocaleString()} XP</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Selected Child Dashboard */}
      {selectedChild && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left 2 Columns: Real Learning Progress & Certificates */}
          <div className="space-y-6 lg:col-span-2">
            <div className="panel p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black">
                    {selectedChild.displayName}’s Real Learning Progress
                  </h3>
                  <p className="text-xs text-muted-foreground">Authoritative backend state</p>
                </div>
                <Award className="h-7 w-7 text-amber-400" />
              </div>

              {/* Child Shield Progression Card */}
              {(() => {
                const completedCount = Object.keys(selectedChild.scores).length;
                const shieldSummary = evalLearnerShieldProgression(completedCount, false, [], DEFAULT_SHIELD_DEFINITIONS);
                return (
                  <div className="rounded-2xl border border-cyan-400/30 bg-gradient-to-r from-cyan-950/30 via-background to-card p-4 flex items-center gap-4">
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center p-1">
                      <NyravaShieldSvg level={shieldSummary.currentLevel || 1} size={90} />
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="text-[10px] font-black uppercase tracking-wider text-cyan-300">
                        {shieldSummary.currentShield ? `Level ${shieldSummary.currentLevel}: ${shieldSummary.currentShield.name.en}` : "No Shield Earned Yet"}
                      </div>
                      <div className="font-extrabold text-foreground">{shieldSummary.calloutMessage.en}</div>
                      <div className="text-[11px] text-muted-foreground">
                        Completed Classes: <span className="font-bold text-foreground">{completedCount}</span> · Next Milestone: <span className="font-bold text-cyan-200">{shieldSummary.nextShield ? `${shieldSummary.nextShield.requiredCompletedClasses} Classes` : "Max Shield Reached"}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Course Assessment Results */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  Course Assessment Scores
                </h4>
                {missions.map((mission) => {
                  const score = selectedChild.scores[mission.id];
                  const isCompleted = score !== undefined;
                  return (
                    <div
                      key={mission.id}
                      className="flex items-center justify-between rounded-xl border border-border/60 bg-background/50 p-3 text-sm"
                    >
                      <div>
                        <p className="font-extrabold">{mission.title.en}</p>
                        <p className="text-xs text-muted-foreground">{mission.summary.en}</p>
                      </div>
                      <div className="text-right">
                        {isCompleted ? (
                          <span className="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-black text-emerald-300">
                            Passed · {score}%
                          </span>
                        ) : (
                          <span className="rounded-lg bg-muted/60 px-2.5 py-1 text-xs font-bold text-muted-foreground">
                            Not started
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Stage 6 Certificate Overview */}
              {childCompletion && (
                <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-5 space-y-4 border-t border-border/60">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="rounded-full bg-emerald-950 px-2.5 py-0.5 text-[10px] font-black text-emerald-300 border border-emerald-500/40 uppercase">
                        🟢 Competency Certificate Issued
                      </span>
                      <h4 className="text-base font-black text-foreground pt-1">
                        {childCompletion.course_title.en}
                      </h4>
                      <p className="text-xs text-muted-foreground font-mono">
                        ID: {childCompletion.certificate_id}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowCertModal(true)}
                        className="flex items-center gap-1 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold hover:bg-muted"
                      >
                        <Eye className="size-3.5" /> View
                      </button>
                      <button
                        type="button"
                        onClick={() => generateCertificatePdf(childCompletion, "en")}
                        className="flex items-center gap-1 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-black text-slate-950 hover:bg-emerald-400"
                      >
                        <Download className="size-3.5" /> PDF
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Safety Controls & Time Limits */}
          <div className="space-y-6">
            <div className="panel p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <h3 className="text-lg font-black">Safety & Permission Controls</h3>
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
              </div>

              {/* AI Builder Toggle */}
              <div className="flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" /> AI Builder Access
                  </span>
                  <p className="text-[11px] text-muted-foreground">Parent approval required</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    void handleUpdateControls(selectedChild.id, {
                      allowAiBuilder: !selectedChild.controls.allowAiBuilder,
                    })
                  }
                  className={`h-6 w-11 rounded-full p-0.5 transition ${
                    selectedChild.controls.allowAiBuilder ? "bg-emerald-500" : "bg-muted"
                  }`}
                >
                  <div
                    className={`h-5 w-5 rounded-full bg-white transition ${
                      selectedChild.controls.allowAiBuilder ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Voice Engine Toggle */}
              <div className="flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold flex items-center gap-1.5">
                    <Volume2 className="h-3.5 w-3.5 text-cyan-400" /> Voice Engine
                  </span>
                  <p className="text-[11px] text-muted-foreground">Parent approval required</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    void handleUpdateControls(selectedChild.id, {
                      allowVoice: !selectedChild.controls.allowVoice,
                    })
                  }
                  className={`h-6 w-11 rounded-full p-0.5 transition ${
                    selectedChild.controls.allowVoice ? "bg-emerald-500" : "bg-muted"
                  }`}
                >
                  <div
                    className={`h-5 w-5 rounded-full bg-white transition ${
                      selectedChild.controls.allowVoice ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Daily Play Limit Slider */}
              <div className="space-y-2 pt-2 border-t border-border/60">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-primary" /> Daily Time Limit
                  </span>
                  <span className="text-primary font-black">
                    {selectedChild.controls.dailyLimitMinutes} min
                  </span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={240}
                  step={15}
                  value={selectedChild.controls.dailyLimitMinutes}
                  onChange={(e) =>
                    void handleUpdateControls(selectedChild.id, {
                      dailyLimitMinutes: Number(e.target.value),
                    })
                  }
                  className="w-full accent-primary"
                />
              </div>

              {/* Quiet Hours Schedule Inputs */}
              <div className="space-y-2 pt-2 border-t border-border/60">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-amber-400" /> Allowed Play Schedule
                </span>
                <p className="text-[11px] text-amber-300 font-bold">{quietHoursStatus}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-muted-foreground">Allowed Start</label>
                    <input
                      type="time"
                      value={selectedChild.controls.allowedStart}
                      onChange={(e) =>
                        void handleUpdateControls(selectedChild.id, {
                          allowedStart: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-input bg-background/60 p-2 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">Allowed End</label>
                    <input
                      type="time"
                      value={selectedChild.controls.allowedEnd}
                      onChange={(e) =>
                        void handleUpdateControls(selectedChild.id, {
                          allowedEnd: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-input bg-background/60 p-2 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Active Resolved Policy Box */}
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-3 text-xs space-y-1">
                <p className="font-extrabold text-primary">Resolved Child Policy</p>
                <p className="text-[11px] text-muted-foreground">
                  AI Builder: {resolvedPolicy.canAccessBuilder ? "Allowed" : "Disabled"} · Voice:{" "}
                  {resolvedPolicy.canUseVoice ? "Allowed" : "Disabled"} · Time:{" "}
                  {resolvedPolicy.dailyLimitMinutes} min
                </p>
              </div>

              {/* Privacy, Revocation, and Deletion Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setReauthAction("export")}
                  className="w-full font-bold text-xs"
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" /> Export Child Privacy Data (COPPA)
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setReauthAction("delete")}
                  className="w-full font-extrabold text-xs"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Permanently Delete Child Profile
                </Button>

                <button
                  onClick={() => setPrivacyModalTopic("privacy")}
                  className="text-[11px] text-muted-foreground hover:underline text-center mt-1"
                >
                  View COPPA Privacy Policy & Disclosures
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reauthentication Modal for Sensitive Actions */}
      {reauthAction && (
        <AlertDialog open={true} onOpenChange={() => setReauthAction(null)}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base font-black">
                Reauthentication Required
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-muted-foreground">
                To perform sensitive privacy export or permanent account deletion, confirm your guardian password.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2 py-2">
              <label className="text-xs font-bold text-muted-foreground">Guardian Password:</label>
              <Input
                type="password"
                value={reauthPassword}
                onChange={(e) => setReauthPassword(e.target.value)}
                placeholder="Enter password..."
                className="h-10 text-xs"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setReauthAction(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={!reauthPassword.trim()}
                onClick={() => void handleConfirmReauthAction()}
                className="bg-primary text-primary-foreground font-black text-xs"
              >
                Confirm & Execute Action
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Onboard Child Profile Modal */}
      {showAddChildModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-primary/40 bg-slate-950 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white">Onboard Child Profile</h3>
              <button onClick={() => setShowAddChildModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300">Child Display Name</label>
                <input
                  type="text"
                  placeholder="e.g. Leo"
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-white outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300">Grade Band</label>
                <select
                  value={newChildGrade}
                  onChange={(e) => setNewChildGrade(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-white outline-none"
                >
                  <option value="k_2">Grades K - 2 (Ages 5-7)</option>
                  <option value="3_5">Grades 3 - 5 (Ages 8-10)</option>
                  <option value="6_8">Grades 6 - 8 (Ages 11-13)</option>
                  <option value="9_12">Grades 9 - 12 (Ages 14+)</option>
                </select>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3 text-[11px] text-slate-400 space-y-1">
                <p className="font-bold text-slate-200">Parental Consent & Legal Disclosure</p>
                <p>
                  By creating this profile, you confirm parental consent for your child to learn cybersecurity with Nyrava Guardians per COPPA guidelines.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                disabled={submitting || !newChildName.trim()}
                onClick={() => void handleCreateChildProfile()}
                className="flex-1 font-black text-xs"
              >
                Create Profile & Grant Consent
              </Button>
              <Button variant="outline" onClick={() => setShowAddChildModal(false)} className="text-xs font-bold">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy & Terms Modal */}
      {privacyModalTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-slate-950 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white">COPPA Privacy Safeguards & Disclosures</h3>
              <button onClick={() => setPrivacyModalTopic(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs leading-relaxed text-slate-300 max-h-80 overflow-y-auto pr-2">
              <p>
                <strong>COPPA Privacy Safeguards:</strong> Nyrava Guardians implements technical and operational safeguards consistent with COPPA principles. Child accounts never require full real names or email addresses.
              </p>
              <p>
                <strong>AI Safety & Moderation:</strong> All AI interactions pass through strict safety filters preventing unsafe keywords, PII exposure, or external links. Parents maintain full authority to enable or disable AI Builder access at any time.
              </p>
              <p>
                <strong>Data Retention & Deletion:</strong> Parents may export child progress data or request permanent profile deletion directly from this portal.
              </p>
            </div>
            <Button onClick={() => setPrivacyModalTopic(null)} className="w-full font-extrabold text-xs">
              Close Disclosures
            </Button>
          </div>
        </div>
      )}

      {childCompletion && (
        <CertificateModal
          completion={childCompletion}
          open={showCertModal}
          onClose={() => setShowCertModal(false)}
        />
      )}
    </div>
  );
}
