import { useState } from "react";
import { StoreProvider, useStore } from "./store";
import { Rail } from "./components/rail";
import { IssuesView } from "./components/issues-view";
import { TemplatesView } from "./components/templates-view";
import { AudienceView } from "./components/audience-view";
import { SettingsView } from "./components/settings-view";
import { Editor } from "./components/editor";

export type View = "issues" | "templates" | "audience" | "settings";

export function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}

function Shell() {
  const { loading, error, setError } = useStore();
  const [view, setView] = useState<View>("issues");
  const [editing, setEditing] = useState<number | null>(null);

  if (loading) return <div className="flex h-full items-center justify-center text-muted-foreground">Loading…</div>;

  return (
    <div className="flex h-full">
      {editing === null ? <Rail view={view} navigate={setView} /> : null}
      <main className="min-w-0 flex-1 overflow-auto">
        {editing !== null ? (
          <Editor issueId={editing} onBack={() => setEditing(null)} />
        ) : view === "issues" ? (
          <IssuesView openIssue={setEditing} />
        ) : view === "templates" ? (
          <TemplatesView openIssue={setEditing} />
        ) : view === "audience" ? (
          <AudienceView />
        ) : (
          <SettingsView />
        )}
      </main>

      {error ? (
        <div className="fixed bottom-4 left-1/2 z-[60] -translate-x-1/2 rounded-lg bg-destructive px-4 py-2 text-sm text-white shadow-lg">
          {error}
          <button className="ml-3 font-semibold opacity-80 hover:opacity-100" onClick={() => setError(null)}>
            ✕
          </button>
        </div>
      ) : null}
    </div>
  );
}
