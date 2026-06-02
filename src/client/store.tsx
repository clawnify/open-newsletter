import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react";
import { api } from "./api";
import type { Issue, Template, Settings, StatusInfo } from "../shared/types";

interface Store {
  loading: boolean;
  error: string | null;
  setError: (e: string | null) => void;

  status: StatusInfo | null;
  settings: Settings | null;
  templates: Template[];
  issues: Issue[];

  refreshStatus: () => Promise<void>;
  refreshIssues: () => Promise<void>;
  refreshTemplates: () => Promise<void>;
  saveSettings: (s: Partial<Settings>) => Promise<void>;

  createIssue: (templateSlug?: string) => Promise<Issue>;
  saveIssue: (id: number, patch: Partial<Issue>) => Promise<Issue>;
  deleteIssue: (id: number) => Promise<void>;
}

const Ctx = createContext<Store>(null as unknown as Store);
export const useStore = () => useContext(Ctx);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusInfo | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);

  const refreshStatus = useCallback(async () => setStatus(await api<StatusInfo>("GET", "/api/status")), []);
  const refreshIssues = useCallback(async () => setIssues(await api<Issue[]>("GET", "/api/issues")), []);
  const refreshTemplates = useCallback(async () => setTemplates(await api<Template[]>("GET", "/api/templates")), []);

  const saveSettings = useCallback(async (s: Partial<Settings>) => {
    setSettings(await api<Settings>("PUT", "/api/settings", s));
  }, []);

  const createIssue = useCallback(async (templateSlug?: string) => {
    const issue = await api<Issue>("POST", "/api/issues", { template_slug: templateSlug });
    setIssues((prev) => [issue, ...prev]);
    return issue;
  }, []);

  const saveIssue = useCallback(async (id: number, patch: Partial<Issue>) => {
    const issue = await api<Issue>("PUT", `/api/issues/${id}`, patch);
    setIssues((prev) => prev.map((i) => (i.id === id ? issue : i)));
    return issue;
  }, []);

  const deleteIssue = useCallback(async (id: number) => {
    await api("DELETE", `/api/issues/${id}`);
    setIssues((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const booted = useRef(false);
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    (async () => {
      // Load each section independently so one failing endpoint degrades
      // gracefully (shows its real error) instead of blanking the whole app.
      const results = await Promise.allSettled([
        api<StatusInfo>("GET", "/api/status").then(setStatus),
        api<Settings>("GET", "/api/settings").then(setSettings),
        api<Template[]>("GET", "/api/templates").then(setTemplates),
        api<Issue[]>("GET", "/api/issues").then(setIssues),
      ]);
      const failed = results.find((r): r is PromiseRejectedResult => r.status === "rejected");
      if (failed) setError((failed.reason as Error).message);
      setLoading(false);
    })();
  }, []);

  const value: Store = {
    loading, error, setError, status, settings, templates, issues,
    refreshStatus, refreshIssues, refreshTemplates, saveSettings, createIssue, saveIssue, deleteIssue,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
