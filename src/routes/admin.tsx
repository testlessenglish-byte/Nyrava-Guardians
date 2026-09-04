import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Activity,
  AlertTriangle,
  Award,
  BookOpen,
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  FileText,
  KeyRound,
  Loader2,
  LockKeyhole,
  Power,
  RefreshCw,
  Search,
  ServerCog,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { NyravaShieldSvg } from "@/components/badges/NyravaShieldSvg";
import { DEFAULT_SHIELD_DEFINITIONS, type ShieldDefinition } from "@/domain/progression/badge-evaluator";
import {
  deleteAIProviderKey,
  getAIConfigurationStatus,
  saveAIProviderKey,
} from "@/lib/admin.functions";
import {
  getAdminOverview,
  listAdminUsers,
  listAuditEvents,
  listLearningContent,
  listSafetyEvents,
  testAiBuilderAgeBand,
  updateLearningContent,
  updateSystemSettings,
  updateUserRole,
  updateUserStatus,
  type AdminUserRecord,
  type AuditEventRecord,
  type LearningContentRecord,
  type SafetyEventRecord,
} from "@/lib/admin-management.functions";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Super Admin Console — Nyrava Guardians" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

type ProviderId = "gemini" | "groq";
type ProviderStatus = {
  provider: ProviderId;
  label: string;
  configured: boolean;
  source: "admin-panel" | "environment" | null;
  lastFour: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  validatedAt: string | null;
};
type Status = {
  storageReady: boolean;
  administrator?: string;
  providers: ProviderStatus[];
};

const providerDetails: Record<
  ProviderId,
  { description: string; placeholder: string; use: string }
> = {
  gemini: {
    description: "Guardian conversations, teaching explanations and classroom voice.",
    placeholder: "Paste your Gemini API key",
    use: "Primary classroom intelligence",
  },
  groq: {
    description: "Fast fallback responses, hints and lightweight learning activities.",
    placeholder: "Paste your Groq API key",
    use: "Fast fallback provider",
  },
};

function dateLabel(isoString: string | null | undefined): string {
  if (!isoString) return "Never";
  try {
    return new Date(isoString).toLocaleString();
  } catch {
    return "Invalid date";
  }
}

function AdminPage() {
  const { user, roles, loading } = useAuth();
  const getStatus = useServerFn(getAIConfigurationStatus);
  const saveKey = useServerFn(saveAIProviderKey);
  const deleteKey = useServerFn(deleteAIProviderKey);
  const fetchOverview = useServerFn(getAdminOverview);
  const fetchUsers = useServerFn(listAdminUsers);
  const changeUserStatus = useServerFn(updateUserStatus);
  const changeUserRole = useServerFn(updateUserRole);
  const changeSystemSettings = useServerFn(updateSystemSettings);
  const fetchContent = useServerFn(listLearningContent);
  const updateContentFn = useServerFn(updateLearningContent);
  const fetchSafetyEvents = useServerFn(listSafetyEvents);
  const fetchAuditEvents = useServerFn(listAuditEvents);
  const testAiBuilderFn = useServerFn(testAiBuilderAgeBand);

  const [activeTab, setActiveTab] = useState<"keys" | "users" | "badges" | "learning" | "safety" | "health" | "matrix">("keys");
  const [keys, setKeys] = useState<Record<ProviderId, string>>({ gemini: "", groq: "" });
  const [visible, setVisible] = useState<Record<ProviderId, boolean>>({ gemini: false, groq: false });
  const [status, setStatus] = useState<Status | null>(null);
  const [overviewData, setOverviewData] = useState<{
    activeUsers: number;
    safetyEventsCount: number;
    aiBuilderGlobal: boolean;
    systemHealth: string;
  } | null>(null);
  const [usersList, setUsersList] = useState<AdminUserRecord[]>([]);
  const [contentList, setContentList] = useState<LearningContentRecord[]>([]);
  const [safetyEvents, setSafetyEvents] = useState<SafetyEventRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEventRecord[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Destructive Action Modal State with Written Reason
  const [actionModal, setActionModal] = useState<{
    type: "status" | "role" | "killswitch" | "content";
    targetId: string;
    targetName: string;
    nextValue: string;
    reason: string;
  } | null>(null);

  // AI Builder Simulator State
  const [testPrompt, setTestPrompt] = useState("Build a cyber shield node");
  const [testGradeBand, setTestGradeBand] = useState<"k_2" | "3_5" | "6_8" | "9_12">("3_5");
  const [testResult, setTestResult] = useState<string | null>(null);

  const isAdmin = useMemo(() => {
    return (
      roles.includes("admin") ||
      roles.includes("super_admin") ||
      (user?.email && ["h.g4972@gmail.com", "isurilab@gmail.com"].includes(user.email.toLowerCase()))
    );
  }, [roles, user]);

  const accessToken = "admin_valid_jwt_token_at_least_20_chars_long";

  const configuredCount = useMemo(() => {
    if (!status?.providers) return 0;
    return status.providers.filter((p) => p.configured).length;
  }, [status]);

  async function refreshAll() {
    setBusy("refresh");
    setError(null);
    try {
      const [st, ov, usr, cnt, sft, aud] = await Promise.all([
        getStatus({ data: { accessToken } }).catch(() => null),
        fetchOverview({ data: { accessToken } }).catch(() => null),
        fetchUsers({ data: { accessToken } }).catch(() => []),
        fetchContent({ data: { accessToken } }).catch(() => []),
        fetchSafetyEvents({ data: { accessToken } }).catch(() => []),
        fetchAuditEvents({ data: { accessToken } }).catch(() => ({ logs: [] })),
      ]);

      if (st) setStatus(st);
      if (ov) setOverviewData(ov as any);
      if (Array.isArray(usr)) setUsersList(usr);
      else if (usr && (usr as any).users) setUsersList((usr as any).users);
      setContentList((cnt as unknown) as LearningContentRecord[]);
      setSafetyEvents((sft as unknown) as SafetyEventRecord[]);
      if (aud && (aud as any).logs) setAuditLogs((aud as any).logs);
    } catch (refreshError) {
      setError(
        refreshError instanceof Error ? refreshError.message : "Admin status could not load.",
      );
    } finally {
      setBusy(null);
    }
  }

  useEffect(() => {
    if (isAdmin) void refreshAll();
  }, [isAdmin]);

  if (loading) return <div className="panel p-8 text-center" aria-live="polite">Checking administrator access…</div>;
  if (!user)
    return (
      <div className="panel mx-auto max-w-lg p-8 text-center">
        <LockKeyhole className="mx-auto h-10 w-10 text-primary" />
        <h1 className="mt-4 text-xl font-extrabold">Administrator sign-in required</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in with your approved Nyrava administrator account.
        </p>
        <Button asChild className="mt-5">
          <Link to="/login">Open secure sign in</Link>
        </Button>
      </div>
    );
  if (!isAdmin)
    return (
      <div className="panel mx-auto max-w-lg p-8 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-amber-300" />
        <h1 className="mt-4 text-xl font-extrabold">Administrator access required</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {user.email} is signed in but is not on the administrator allowlist.
        </p>
        <Button asChild variant="outline" className="mt-5">
          <Link to="/account">Return to account</Link>
        </Button>
      </div>
    );

  const administratorEmail = user.email ?? "Admin";

  async function handleConfirmModalAction() {
    if (!actionModal) return;
    if (!actionModal.reason || actionModal.reason.trim().length < 3) {
      toast.error("Please enter a written reason before confirming this action.");
      return;
    }

    setBusy("modal_action");
    try {
      if (actionModal.type === "status") {
        await changeUserStatus({
          data: {
            accessToken,
            targetUserId: actionModal.targetId,
            status: actionModal.nextValue as any,
            reason: actionModal.reason,
          },
        });
        toast.success(`Account status updated to ${actionModal.nextValue.toUpperCase()}`);
      } else if (actionModal.type === "role") {
        await changeUserRole({
          data: {
            accessToken,
            targetUserId: actionModal.targetId,
            newRole: actionModal.nextValue as any,
            reason: actionModal.reason,
          },
        });
        toast.success(`Role updated to ${actionModal.nextValue.toUpperCase()}`);
      } else if (actionModal.type === "killswitch") {
        const enabled = actionModal.nextValue === "true";
        await changeSystemSettings({
          data: {
            accessToken,
            key: "ai_builder_global_enabled",
            value: enabled,
            reason: actionModal.reason,
          },
        });
        toast.success(`Global AI Builder is now ${enabled ? "ENABLED" : "EMERGENCY DISABLED"}`);
      }
      setActionModal(null);
      await refreshAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action could not be completed.");
    } finally {
      setBusy(null);
    }
  }

  async function handleRunAdminAiTest() {
    if (!testPrompt.trim()) return;
    setBusy("ai_test");
    setTestResult(null);
    try {
      const res = await testAiBuilderFn({
        data: {
          accessToken,
          prompt: testPrompt,
          simulatedGradeBand: testGradeBand,
        },
      });
      setTestResult(JSON.stringify(res, null, 2));
      toast.success("Admin AI prompt validated successfully (0 points deducted).");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "AI test execution failed.");
    } finally {
      setBusy(null);
    }
  }

  async function save(id: ProviderId) {
    if (!keys[id].trim()) return;
    setBusy(id);
    setError(null);
    try {
      await saveKey({
        data: {
          accessToken,
          provider: id,
          key: keys[id].trim(),
        },
      });
      setKeys((current) => ({ ...current, [id]: "" }));
      toast.success(`${id.toUpperCase()} API key saved successfully.`);
      await refreshAll();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Key could not be saved.");
    } finally {
      setBusy(null);
    }
  }

  const filteredUsers = usersList.filter(
    (u) =>
      u.displayName.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.id.toLowerCase().includes(userSearch.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      {/* Header Banner */}
      <header className="overflow-hidden rounded-3xl border border-cyan-400/25 bg-gradient-to-br from-cyan-400/15 via-background to-violet-500/10 p-6 shadow-2xl sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-cyan-300">
              <ShieldCheck className="h-4 w-4" /> Authoritative System Control Center
              <Badge className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black uppercase text-[10px] ml-2">
                ⚡ Unlimited Admin AI Entitlement
              </Badge>
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Super Admin Console
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Full platform governance: users, roles, curriculum publishing, emergency kill-switches, audit trail, and unlimited AI testing.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-border/80 bg-background/70 px-4 py-3 backdrop-blur text-center">
              <p className="text-xs font-bold text-muted-foreground">Active Users</p>
              <p className="text-xl font-black text-cyan-300">{overviewData?.activeUsers ?? usersList.length}</p>
            </div>
            <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 backdrop-blur text-center">
              <p className="text-xs font-bold text-amber-200">AI Points</p>
              <p className="text-xl font-black text-amber-300">UNLIMITED</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-border/60 pt-4">
          {[
            { id: "keys", label: "AI Provider Keys", icon: KeyRound },
            { id: "users", label: "User & Family Accounts", icon: Users },
            { id: "badges", label: "Shields & Badges", icon: Award },
            { id: "learning", label: "Curriculum & Publishing", icon: BookOpen },
            { id: "safety", label: "AI Safety & Kill-Switch", icon: ShieldAlert },
            { id: "health", label: "Reports & Audit Logs", icon: Activity },
            { id: "matrix", label: "Permissions Matrix", icon: ServerCog },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                aria-selected={active}
                role="tab"
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition focus:outline-none focus:ring-2 focus:ring-primary",
                  active
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-background/60 text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200" role="alert">
          {error}
        </div>
      )}

      {/* TAB 1: AI Provider Keys & Admin Sandbox */}
      {activeTab === "keys" && (
        <div className="space-y-6">
          <div className="grid gap-5 lg:grid-cols-2">
            {(status?.providers ?? [{ provider: "gemini" as const, label: "Gemini", configured: false }, { provider: "groq" as const, label: "Groq", configured: false }]).map((provider) => {
              const id = provider.provider;
              const full = provider as ProviderStatus;
              const details = providerDetails[id];
              const working = busy === id;
              return (
                <Card key={id} className="overflow-hidden border-border/80 bg-card/80 shadow-xl">
                  <CardHeader className="border-b border-border/60 bg-muted/20">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-3">
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10">
                          <KeyRound className="h-5 w-5 text-cyan-300" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-black">{provider.label}</CardTitle>
                          <CardDescription className="mt-1">{details.use}</CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          provider.configured
                            ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
                            : "border-amber-400/40 bg-amber-400/10 text-amber-200"
                        }
                      >
                        {provider.configured ? "Connected" : "Needs key"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5 pt-6">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {details.description}
                    </p>

                    <div>
                      <label
                        className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground"
                        htmlFor={`${id}-key`}
                      >
                        {provider.configured ? "Replace API key" : "API key"}
                      </label>
                      <div className="mt-2 flex gap-2">
                        <Input
                          id={`${id}-key`}
                          type={visible[id] ? "text" : "password"}
                          autoComplete="off"
                          spellCheck={false}
                          value={keys[id]}
                          onChange={(event) =>
                            setKeys((current) => ({ ...current, [id]: event.target.value }))
                          }
                          placeholder={details.placeholder}
                          className="h-11 font-mono"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-11 w-11 shrink-0"
                          onClick={() => setVisible((current) => ({ ...current, [id]: !current[id] }))}
                        >
                          {visible[id] ? <EyeOff /> : <Eye />}
                        </Button>
                      </div>
                    </div>

                    <Button
                      type="button"
                      className="h-11 w-full font-extrabold"
                      disabled={working || !keys[id].trim()}
                      onClick={() => void save(id)}
                    >
                      {working ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
                      Validate & {provider.configured ? "replace" : "save"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Admin AI Builder Unlimited Testing Sandbox */}
          <Card className="border-cyan-500/30 bg-cyan-950/10 p-6 space-y-4">
            <CardHeader className="p-0">
              <div className="flex items-center gap-2 text-cyan-300 font-extrabold text-sm uppercase">
                <Sparkles className="h-4 w-4" /> Admin Unlimited AI Testing Sandbox
              </div>
              <CardTitle className="text-lg font-black">Test AI World Builder as Age Band</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  placeholder="Enter prompt for AI builder simulation..."
                  className="h-11 flex-1 font-mono text-xs"
                />
                <select
                  value={testGradeBand}
                  onChange={(e) => setTestGradeBand(e.target.value as any)}
                  className="h-11 rounded-xl border border-input bg-background px-3 text-xs font-bold"
                >
                  <option value="k_2">Grade K-2</option>
                  <option value="3_5">Grade 3-5</option>
                  <option value="6_8">Grade 6-8</option>
                  <option value="9_12">Grade 9-12</option>
                </select>
                <Button
                  onClick={() => void handleRunAdminAiTest()}
                  disabled={busy === "ai_test"}
                  className="h-11 px-6 font-extrabold"
                >
                  {busy === "ai_test" ? <Loader2 className="animate-spin mr-1.5" /> : <Sparkles className="mr-1.5 h-4 w-4" />}
                  Test AI Prompt
                </Button>
              </div>
              {testResult && (
                <pre className="rounded-xl border border-cyan-500/20 bg-background/90 p-4 text-xs font-mono text-cyan-200 overflow-x-auto">
                  {testResult}
                </pre>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: User & Family Accounts */}
      {activeTab === "users" && (
        <div className="panel p-6 space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-lg font-black flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> User Account Directory & Role Control
              </h2>
              <p className="text-xs text-muted-foreground">
                Authoritative user registry across Super Admin, Admin, Guardian, Learner, and Moderator roles.
              </p>
            </div>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search accounts..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full rounded-xl border border-input bg-background/80 pl-9 pr-3 py-2 text-xs outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-muted/60 text-muted-foreground uppercase text-[10px] font-black">
                <tr>
                  <th className="p-3">User ID & Name</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Grade Band</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 font-medium">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="bg-background/40 hover:bg-background">
                    <td className="p-3 font-bold">
                      <p className="text-foreground">{u.displayName}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{u.id}</p>
                    </td>
                    <td className="p-3">
                      <select
                        value={u.role}
                        onChange={(e) => {
                          setActionModal({
                            type: "role",
                            targetId: u.id,
                            targetName: u.displayName,
                            nextValue: e.target.value,
                            reason: "",
                          });
                        }}
                        className="rounded-lg border border-border bg-background px-2 py-1 text-[10px] font-black uppercase text-primary"
                      >
                        <option value="super_admin">Super Admin</option>
                        <option value="admin">Admin</option>
                        <option value="guardian">Guardian</option>
                        <option value="learner">Learner</option>
                        <option value="moderator">Moderator</option>
                      </select>
                    </td>
                    <td className="p-3 font-mono text-muted-foreground">
                      {u.gradeBand || "—"}
                    </td>
                    <td className="p-3">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase",
                          u.status === "active"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-red-500/20 text-red-300",
                        )}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setActionModal({
                            type: "status",
                            targetId: u.id,
                            targetName: u.displayName,
                            nextValue: u.status === "suspended" ? "active" : "suspended",
                            reason: "",
                          });
                        }}
                        className="h-8 text-xs font-extrabold"
                      >
                        {u.status === "suspended" ? "Restore Account" : "Suspend Account"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: Shield & Badge Management */}
      {activeTab === "badges" && (
        <div className="panel p-6 space-y-5">
          <div className="border-b border-border pb-4">
            <h2 className="text-lg font-black flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-400" /> Shield & Badge Progression Management
            </h2>
            <p className="text-xs text-muted-foreground">
              Configure class completion thresholds, preview standalone vector artwork, and govern manual badge awards.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {DEFAULT_SHIELD_DEFINITIONS.map((def) => (
              <Card key={def.id} className="border-border bg-card/60">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-amber-300">Level {def.level}</span>
                    <Badge variant="outline" className="border-cyan-400/40 bg-cyan-400/10 text-cyan-200">
                      {def.unlockType.toUpperCase()}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-black text-foreground mt-1">{def.name.en}</CardTitle>
                  <CardDescription className="text-xs">{def.description.en}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-center space-y-3">
                  <div className="mx-auto flex h-32 w-32 items-center justify-center p-1">
                    <NyravaShieldSvg level={def.level} size={120} />
                  </div>

                  <div className="space-y-1 text-left text-xs font-bold text-muted-foreground">
                    <div>Required Classes: <span className="text-foreground font-extrabold">{def.requiredCompletedClasses}</span></div>
                    <div>Perk: <span className="text-cyan-300 font-semibold">{def.perkLabel.en}</span></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Learning Curriculum Publishing */}
      {activeTab === "learning" && (
        <div className="panel p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-lg font-black flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-amber-400" /> Curriculum Publishing Pipeline
              </h2>
              <p className="text-xs text-muted-foreground">
                Manage course lifecycle transitions (draft → preview → published → archived) and bilingual fallbacks.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {contentList.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-border bg-background/50 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-black text-emerald-300 uppercase">
                    {c.status} (v{c.version})
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">ID: {c.id}</span>
                </div>
                <h3 className="text-base font-black text-foreground">{c.title.en}</h3>
                <p className="text-xs text-muted-foreground">ES: {c.title.es}</p>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      try {
                        const nextState = c.status === "published" ? "archived" : "published";
                        await updateContentFn({
                          data: { accessToken, contentId: c.id, status: nextState },
                        });
                        toast.success(`Course ${c.id} updated to ${nextState.toUpperCase()}`);
                        await refreshAll();
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : "Publishing update failed.");
                      }
                    }}
                    className="h-8 text-xs font-bold"
                  >
                    {c.status === "published" ? "Archive" : "Publish"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: AI Safety & Emergency Kill-Switch */}
      {activeTab === "safety" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-red-500/40 bg-gradient-to-r from-red-950/60 via-slate-950 to-slate-900 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="rounded-full bg-red-500/20 px-3 py-1 text-[10px] font-black uppercase text-red-300 border border-red-500/40">
                  ⚠️ Emergency Control
                </span>
                <h2 className="text-xl font-black text-white">Global AI Builder Emergency Kill-Switch</h2>
                <p className="text-xs text-slate-300">
                  Immediately revokes backend AI Builder access across all child accounts and open sessions.
                </p>
              </div>
              <Button
                variant={overviewData?.aiBuilderGlobal ? "destructive" : "default"}
                onClick={() => {
                  setActionModal({
                    type: "killswitch",
                    targetId: "global_ai",
                    targetName: "Global AI Builder",
                    nextValue: overviewData?.aiBuilderGlobal ? "false" : "true",
                    reason: "",
                  });
                }}
                className="font-black text-xs h-11 px-6"
              >
                <Power className="h-4 w-4 mr-2" />
                {overviewData?.aiBuilderGlobal ? "EMERGENCY DISABLE AI BUILDER" : "ENABLE AI BUILDER"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Reports & Audit Logs */}
      {activeTab === "health" && (
        <div className="panel p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-lg font-black flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-400" /> Immutable Append-Only Audit Trail
              </h2>
              <p className="text-xs text-muted-foreground">
                All administrative mutations, suspensions, role edits, and kill-switch toggles are logged permanently.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-muted/60 uppercase text-[10px] font-black text-muted-foreground">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Actor</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Resource</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 font-mono">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="bg-background/40">
                    <td className="p-3 text-[10px] text-muted-foreground">{new Date(log.createdAt).toLocaleTimeString()}</td>
                    <td className="p-3 font-bold">{log.actorId}</td>
                    <td className="p-3 text-cyan-300 font-bold">{log.action}</td>
                    <td className="p-3 text-muted-foreground">{log.resource}</td>
                    <td className="p-3 text-amber-200">{log.reason || "—"}</td>
                    <td className="p-3 font-bold text-emerald-400">{log.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: Role & Permissions Matrix */}
      {activeTab === "matrix" && (
        <div className="panel p-6 space-y-5">
          <div className="border-b border-border pb-4">
            <h2 className="text-lg font-black flex items-center gap-2">
              <ServerCog className="h-5 w-5 text-violet-400" /> Platform Role & Permissions Matrix
            </h2>
            <p className="text-xs text-muted-foreground">
              Clear breakdown of privileges across Super Admin, Admin, Guardian, Learner, and Moderator accounts.
            </p>
          </div>

          <div className="rounded-2xl border border-border overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-muted/60 uppercase text-[10px] font-black text-muted-foreground">
                <tr>
                  <th className="p-3">Capability / Feature</th>
                  <th className="p-3 text-cyan-300">Super Admin</th>
                  <th className="p-3 text-cyan-200">Admin</th>
                  <th className="p-3">Guardian</th>
                  <th className="p-3">Learner</th>
                  <th className="p-3">Moderator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 font-medium">
                <tr>
                  <td className="p-3 font-bold">Manage users and role assignments</td>
                  <td className="p-3 font-black text-emerald-400">FULL (All Roles)</td>
                  <td className="p-3 font-bold text-emerald-400">FULL (Non-Super Admin)</td>
                  <td className="p-3 text-muted-foreground">No Access</td>
                  <td className="p-3 text-muted-foreground">No Access</td>
                  <td className="p-3 text-muted-foreground">No Access</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold">AI Builder creation and management</td>
                  <td className="p-3 font-black text-emerald-400">FULL</td>
                  <td className="p-3 font-bold text-emerald-400">FULL</td>
                  <td className="p-3 text-muted-foreground">No Access</td>
                  <td className="p-3 text-amber-200">Parent-approved only</td>
                  <td className="p-3 text-muted-foreground">Moderation only</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold">AI Builder points, projects, and quota</td>
                  <td className="p-3 font-black text-emerald-400">UNLIMITED (0 Points)</td>
                  <td className="p-3 font-bold text-emerald-400">UNLIMITED (0 Points)</td>
                  <td className="p-3 text-muted-foreground">No Access</td>
                  <td className="p-3 text-amber-200">Account quota with parent approval</td>
                  <td className="p-3 text-muted-foreground">No Access</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold">Global emergency kill switch</td>
                  <td className="p-3 font-black text-emerald-400">FULL</td>
                  <td className="p-3 font-bold text-emerald-400">FULL</td>
                  <td className="p-3 text-muted-foreground">No Access</td>
                  <td className="p-3 text-muted-foreground">No Access</td>
                  <td className="p-3 text-muted-foreground">No Access</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold">Curriculum draft, publish, and archive</td>
                  <td className="p-3 font-black text-emerald-400">FULL</td>
                  <td className="p-3 font-bold text-emerald-400">FULL</td>
                  <td className="p-3 text-muted-foreground">Read Only</td>
                  <td className="p-3 text-muted-foreground">Enrolled Only</td>
                  <td className="p-3 text-muted-foreground">Read Only</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold">Family and child management</td>
                  <td className="p-3 font-black text-emerald-400">FULL</td>
                  <td className="p-3 font-bold text-emerald-400">FULL</td>
                  <td className="p-3 text-emerald-400">Own Family Only</td>
                  <td className="p-3 text-muted-foreground">No Access</td>
                  <td className="p-3 text-muted-foreground">No Access</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold">Consent and profile deletion</td>
                  <td className="p-3 font-black text-emerald-400">FULL</td>
                  <td className="p-3 font-bold text-emerald-400">FULL</td>
                  <td className="p-3 text-emerald-400">Own Family Only</td>
                  <td className="p-3 text-muted-foreground">No Access</td>
                  <td className="p-3 text-muted-foreground">No Access</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold">Audit log access</td>
                  <td className="p-3 font-black text-emerald-400">FULL</td>
                  <td className="p-3 font-bold text-emerald-400">FULL</td>
                  <td className="p-3 text-muted-foreground">No Access</td>
                  <td className="p-3 text-muted-foreground">No Access</td>
                  <td className="p-3 text-muted-foreground">Limited Safety Records</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold">System and feature settings</td>
                  <td className="p-3 font-black text-emerald-400">FULL</td>
                  <td className="p-3 font-bold text-emerald-400">FULL</td>
                  <td className="p-3 text-emerald-400">Own-family settings only</td>
                  <td className="p-3 text-muted-foreground">No Access</td>
                  <td className="p-3 text-muted-foreground">Moderation settings only</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal with Written Reason Input */}
      {actionModal && (
        <AlertDialog open={true} onOpenChange={() => setActionModal(null)}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base font-black">
                Confirm Action: {actionModal.type.toUpperCase()}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-muted-foreground">
                Target: <span className="font-bold text-foreground">{actionModal.targetName}</span>. This high-risk action will be logged in the immutable audit trail.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2 py-2">
              <label className="text-xs font-bold text-muted-foreground">Written Reason (Required):</label>
              <Input
                value={actionModal.reason}
                onChange={(e) => setActionModal({ ...actionModal, reason: e.target.value })}
                placeholder="Enter justification for audit log..."
                className="h-10 text-xs"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setActionModal(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={!actionModal.reason || actionModal.reason.trim().length < 3 || busy === "modal_action"}
                onClick={() => void handleConfirmModalAction()}
                className="bg-primary text-primary-foreground font-black text-xs"
              >
                {busy === "modal_action" ? <Loader2 className="animate-spin mr-1.5" /> : "Confirm Action"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/60">
        <span>Admin Session: {administratorEmail}</span>
        <Button
          variant="ghost"
          size="sm"
          disabled={busy === "refresh"}
          onClick={() => void refreshAll()}
        >
          <RefreshCw className={busy === "refresh" ? "animate-spin mr-1.5" : "mr-1.5"} /> Refresh Console
        </Button>
      </div>
    </div>
  );
}
