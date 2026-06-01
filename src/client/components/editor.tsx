import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Monitor, Smartphone, Sparkles, ArrowLeft, Send, Save, RotateCcw, MousePointer2, X, Undo2, Redo2 } from "lucide-react";
import { useStore } from "../store";
import { api } from "../api";
import { baseDesign, effectiveDesign } from "../lib/design";
import { diffTokens, withDefaults, type DesignTokens } from "../../shared/design";
import { newBlock } from "../../shared/blocks";
import type { Block, BlockType, Issue } from "../../shared/types";
import { Preview, type EditHandlers } from "./preview";
import { DesignPanel } from "./design-panel";
import { SendDialog } from "./send-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function Editor({ issueId, onBack }: { issueId: number; onBack: () => void }) {
  const store = useStore();
  const [issue, setIssue] = useState<Issue | null>(store.issues.find((i) => i.id === issueId) || null);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [selectedId, setSelected] = useState<string | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [aiSelected, setAiSelected] = useState<Set<string>>(new Set());
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [showSend, setShowSend] = useState(false);
  const [saved, setSaved] = useState(true);

  // Undo/redo: snapshots of the whole issue. `record` is called before any
  // meaningful change (edits, block ops, design, AI). Capped at 50 steps.
  const [history, setHistory] = useState<Issue[]>([]);
  const [future, setFuture] = useState<Issue[]>([]);
  const live = useRef({ issue, history, future });
  live.current = { issue, history, future };

  useEffect(() => {
    if (!issue) api<Issue>("GET", `/api/issues/${issueId}`).then(setIssue).catch((e) => store.setError((e as Error).message));
  }, [issueId]);

  const base = useMemo(() => (issue ? baseDesign(issue, store.templates) : withDefaults(null)), [issue, store.templates]);
  const design = useMemo<DesignTokens>(() => (issue ? effectiveDesign(issue, store.templates, device) : withDefaults(null)), [issue, store.templates, device]);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queueSave = (next: Issue, patch: Partial<Issue>) => {
    setSaved(false);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        await store.saveIssue(next.id, patch);
        setSaved(true);
      } catch (e) {
        store.setError((e as Error).message);
      }
    }, 500);
  };
  /** Snapshot the current issue onto the undo stack and clear redo. */
  const record = (cur: Issue) => {
    setHistory((h) => [...h.slice(-49), cur]);
    setFuture([]);
  };

  const patch = (p: Partial<Issue>) => {
    if (!issue) return;
    record(issue);
    const next = { ...issue, ...p };
    setIssue(next);
    queueSave(next, p);
  };

  const restore = (snap: Issue) => {
    setIssue(snap);
    queueSave(snap, snap);
  };
  const undo = useCallback(() => {
    const { issue, history } = live.current;
    if (!issue || !history.length) return;
    setHistory((h) => h.slice(0, -1));
    setFuture((f) => [issue, ...f].slice(0, 50));
    restore(history[history.length - 1]);
  }, []);
  const redo = useCallback(() => {
    const { issue, future } = live.current;
    if (!issue || !future.length) return;
    setFuture((f) => f.slice(1));
    setHistory((h) => [...h.slice(-49), issue]);
    restore(future[0]);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((!e.metaKey && !e.ctrlKey) || e.key.toLowerCase() !== "z") return;
      const el = document.activeElement as HTMLElement | null;
      // While typing in a field, let the browser's native undo handle it.
      if (el && (el.isContentEditable || el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;
      e.preventDefault();
      e.shiftKey ? redo() : undo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  const setBlocks = (blocks: Block[]) => patch({ blocks });
  const onBlock = (id: string, p: Record<string, unknown>) => setBlocks((issue!.blocks || []).map((b) => (b.id === id ? ({ ...b, ...p } as Block) : b)));
  const onReplace = (id: string, block: Block) => setBlocks((issue!.blocks || []).map((b) => (b.id === id ? block : b)));
  const onAdd = (index: number, type: BlockType) => {
    const blocks = (issue!.blocks || []).slice();
    const b = newBlock(type);
    blocks.splice(index, 0, b);
    setBlocks(blocks);
    setSelected(b.id);
  };
  const onMove = (index: number, dir: -1 | 1) => {
    const blocks = (issue!.blocks || []).slice();
    const j = index + dir;
    if (j < 0 || j >= blocks.length) return;
    [blocks[index], blocks[j]] = [blocks[j], blocks[index]];
    setBlocks(blocks);
  };
  const onDelete = (index: number) => setBlocks((issue!.blocks || []).filter((_, i) => i !== index));

  const patchDesign = (edited: DesignTokens) => {
    if (device === "mobile") patch({ design_mobile: diffTokens(base, edited) });
    else patch({ design: edited });
  };
  const resetMobile = () => patch({ design_mobile: null });

  const toggleAI = (id: string) =>
    setAiSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const enterSelect = (firstId?: string) => {
    setSelectMode(true);
    setAiSelected(firstId ? new Set([firstId]) : new Set());
    setSelected(null);
    setTimeout(() => document.getElementById("gen-input")?.focus(), 0);
  };
  const exitSelect = () => {
    setSelectMode(false);
    setAiSelected(new Set());
  };

  const generate = async () => {
    if (!issue || !prompt.trim()) return;
    setGenerating(true);
    const before = issue;
    try {
      let updated: Issue;
      if (selectMode && aiSelected.size > 0) {
        updated = await api<Issue>("POST", `/api/issues/${issue.id}/blocks/rewrite-batch`, { ids: [...aiSelected], prompt: prompt.trim() });
        exitSelect();
      } else {
        updated = await api<Issue>("POST", `/api/issues/${issue.id}/generate`, { prompt: prompt.trim(), target: "all" });
      }
      record(before); // make the generation undoable
      setIssue(updated);
      await store.refreshIssues();
      setPrompt("");
    } catch (e) {
      store.setError((e as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  const saveAsTemplate = async () => {
    if (!issue) return;
    const name = window.prompt("Template name", issue.title?.slice(0, 40) || "My template");
    if (!name) return;
    try {
      await api("POST", "/api/templates", { name, from_issue_id: issue.id });
      await store.refreshTemplates();
    } catch (e) {
      store.setError((e as Error).message);
    }
  };

  if (!issue) return <div className="flex h-full items-center justify-center text-muted-foreground">Loading…</div>;

  const edit: EditHandlers = {
    onIssue: patch, onBlock, onReplace, onAdd, onMove, onDelete,
    onBlockAI: (b) => enterSelect(b.id),
    selectedId, setSelected, selectMode, aiSelected, toggleAI,
  };
  const sent = issue.status !== "draft";

  return (
    <div className="flex h-full min-w-0 flex-col" onClick={() => !selectMode && setSelected(null)}>
      <header className="flex items-center gap-3 border-b bg-background px-4 py-2.5">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back"><ArrowLeft size={18} /></Button>
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="secondary">Issue</Badge>
          <span className="max-w-[260px] truncate font-medium">{issue.title || "Untitled"}</span>
          <span className="text-xs text-muted-foreground">{saved ? "Saved" : "Saving…"}</span>
          {sent ? <Badge className="bg-green-100 capitalize text-green-700">{issue.status}</Badge> : null}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={undo} disabled={!history.length} title="Undo (⌘Z)" aria-label="Undo"><Undo2 size={16} /></Button>
            <Button variant="ghost" size="icon" onClick={redo} disabled={!future.length} title="Redo (⌘⇧Z)" aria-label="Redo"><Redo2 size={16} /></Button>
          </div>
          <Segmented
            options={[{ v: "desktop", label: "Desktop", icon: <Monitor size={15} /> }, { v: "mobile", label: "Mobile", icon: <Smartphone size={15} /> }]}
            value={device}
            onChange={(v) => setDevice(v as "desktop" | "mobile")}
          />
          <Button variant="outline" size="sm" onClick={saveAsTemplate}><Save size={15} /> Save as…</Button>
          <Button size="sm" onClick={() => setShowSend(true)}><Send size={15} /> Send</Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col bg-muted">
          {device === "mobile" ? (
            <div className="flex items-center justify-center gap-2 border-b border-amber-200 bg-amber-50 py-1.5 text-xs text-amber-700">
              <Smartphone size={13} /> Editing <strong>mobile overrides</strong> — changes here only affect phones.
              {issue.design_mobile && Object.keys(issue.design_mobile).length ? (
                <button className="ml-1 inline-flex items-center gap-1 rounded border border-amber-300 px-1.5 py-0.5 hover:bg-amber-100" onClick={resetMobile}><RotateCcw size={11} /> reset</button>
              ) : null}
            </div>
          ) : null}
          {selectMode ? (
            <div className="flex items-center justify-center gap-2 border-b border-primary/30 bg-accent py-1.5 text-xs text-foreground">
              <MousePointer2 size={13} /> Click blocks to select, then describe how to rewrite them below. <strong>{aiSelected.size} selected</strong>.
            </div>
          ) : null}

          <div className="flex-1 overflow-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto transition-all" style={{ maxWidth: device === "mobile" ? 390 : design.layout.contentWidth + 80 }}>
              <Preview issue={issue} design={design} settings={store.settings!} edit={edit} />
            </div>
          </div>

          <div className="border-t bg-background p-3" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto flex max-w-3xl items-center gap-2">
              {selectMode ? (
                <Badge variant="secondary" className="gap-1 py-1.5">
                  <Sparkles size={13} /> {aiSelected.size} block{aiSelected.size === 1 ? "" : "s"}
                  <button onClick={exitSelect} aria-label="Done selecting"><X size={12} /></button>
                </Badge>
              ) : (
                <Button variant="outline" onClick={() => enterSelect()}>
                  <MousePointer2 size={15} /> Select
                </Button>
              )}
              <Input
                id="gen-input"
                placeholder={
                  store.status?.ai_available
                    ? selectMode
                      ? aiSelected.size ? "How should I rewrite the selected blocks?" : "Select blocks above first…"
                      : "Describe what to generate…"
                    : "Connect OPENROUTER_API_KEY to generate"
                }
                value={prompt}
                disabled={!store.status?.ai_available || generating}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && generate()}
              />
              <Button disabled={!store.status?.ai_available || !prompt.trim() || generating || (selectMode && !aiSelected.size)} onClick={generate}>
                <Sparkles size={15} /> {generating ? "…" : "Generate"}
              </Button>
            </div>
          </div>
        </div>

        <aside className="hidden w-80 shrink-0 border-l bg-background lg:block">
          <DesignPanel design={design} onChange={patchDesign} />
        </aside>
      </div>

      {showSend ? <SendDialog issue={issue} onClose={() => setShowSend(false)} onSent={(i) => { setIssue(i); setShowSend(false); store.refreshIssues(); }} /> : null}
    </div>
  );
}

function Segmented<T extends string>({ options, value, onChange }: { options: { v: T; label: string; icon?: React.ReactNode }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-muted p-0.5">
      {options.map((o) => (
        <button key={o.v} onClick={() => onChange(o.v)} className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium transition ${value === o.v ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>
          {o.icon}{o.label}
        </button>
      ))}
    </div>
  );
}
