import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { useStore } from "../store";
import type { Settings } from "../../shared/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function SettingsView() {
  const { settings, status, saveSettings, setError } = useStore();
  const [form, setForm] = useState<Settings>(
    settings || { publication_name: "", logo: "", from_name: "", from_email: "", default_audience_id: null, footer_text: "" },
  );
  const [savedAt, setSavedAt] = useState(false);

  const save = async () => {
    try {
      await saveSettings(form);
      setSavedAt(true);
      setTimeout(() => setSavedAt(false), 1500);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const field = (label: string, key: keyof Settings, placeholder = "", type = "text") => (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        type={type}
        placeholder={placeholder}
        value={String((form as unknown as Record<string, unknown>)[key] ?? "")}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl px-8 py-8">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <section className="mt-6 space-y-2 rounded-2xl border bg-background p-5">
        <h2 className="text-sm font-semibold">Connections</h2>
        <Status ok={!!status?.resend_connected} label="Resend" detail={status?.resend_connected ? `${status.audiences.length} audience(s)` : "Set RESEND_API_KEY in your Clawnify environment"} />
        <Status ok={!!status?.ai_available} label="AI generation (OpenRouter)" detail={status?.ai_available ? "Ready" : "Set OPENROUTER_API_KEY to enable Generate"} />
      </section>

      <section className="mt-6 space-y-4 rounded-2xl border bg-background p-5">
        <h2 className="text-sm font-semibold">Sender</h2>
        {field("Publication name", "publication_name", "The Editorial Review")}
        {field("Logo URL", "logo", "https://…/logo.png")}
        <div className="grid grid-cols-2 gap-4">
          {field("From name", "from_name", "Jane from Acme")}
          {field("From email", "from_email", "hello@yourdomain.com", "email")}
        </div>
        <p className="text-xs text-muted-foreground">The from address must be on a domain you've verified in Resend.</p>

        <div className="space-y-1.5">
          <Label>Default audience</Label>
          <Select
            value={form.default_audience_id || "none"}
            onValueChange={(v) => setForm({ ...form, default_audience_id: v === "none" ? null : v })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {(status?.audiences || []).map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {field("Footer text", "footer_text", "123 Main St · You can unsubscribe anytime.")}
      </section>

      <div className="mt-5 flex items-center gap-3">
        <Button onClick={save}>Save settings</Button>
        {savedAt ? <span className="text-sm text-green-600">Saved</span> : null}
      </div>
    </div>
  );
}

function Status({ ok, label, detail }: { ok: boolean; label: string; detail: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {ok ? <CheckCircle2 size={17} className="text-green-600" /> : <XCircle size={17} className="text-muted-foreground" />}
      <span className="font-medium">{label}</span>
      <span className="text-muted-foreground">— {detail}</span>
    </div>
  );
}
