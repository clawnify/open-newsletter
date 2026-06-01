import { FileText, LayoutGrid, Users, Settings as Cog, Mail } from "lucide-react";
import type { View } from "../app";

const ITEMS: { v: View; label: string; icon: typeof Mail }[] = [
  { v: "issues", label: "Mail", icon: FileText },
  { v: "templates", label: "Templates", icon: LayoutGrid },
  { v: "audience", label: "Audience", icon: Users },
  { v: "settings", label: "Settings", icon: Cog },
];

export function Rail({ view, navigate }: { view: View; navigate: (v: View) => void }) {
  return (
    <nav className="flex w-14 shrink-0 flex-col items-center gap-1 border-r bg-background py-3">
      <div className="mb-3 grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
        <Mail size={18} />
      </div>
      {ITEMS.map(({ v, label, icon: Icon }) => (
        <button
          key={v}
          title={label}
          aria-label={label}
          onClick={() => navigate(v)}
          className={`grid h-10 w-10 place-items-center rounded-xl transition ${
            view === v ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Icon size={19} />
        </button>
      ))}
    </nav>
  );
}
