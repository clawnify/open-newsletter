import { useState } from "react";
import { api } from "../api";
import { useStore } from "../store";
import type { Issue } from "../../shared/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function SendDialog({ issue, onClose, onSent }: { issue: Issue; onClose: () => void; onSent: (i: Issue) => void }) {
  const { status, settings, saveIssue } = useStore();
  const [audienceId, setAudienceId] = useState(issue.audience_id || settings?.default_audience_id || "");
  const [testTo, setTestTo] = useState("");
  const [when, setWhen] = useState("");
  const [busy, setBusy] = useState<"" | "test" | "send">("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const connected = status?.resend_connected;
  const audiences = status?.audiences || [];
  const fromReady = !!settings?.from_email;

  const sendTest = async () => {
    setErr(null); setMsg(null); setBusy("test");
    try {
      await api("POST", `/api/issues/${issue.id}/test`, { to: testTo.trim() });
      setMsg(`Test sent to ${testTo.trim()}`);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy("");
    }
  };

  const send = async () => {
    setErr(null); setMsg(null);
    if (!audienceId) return setErr("Pick an audience.");
    setBusy("send");
    try {
      if (issue.audience_id !== audienceId) await saveIssue(issue.id, { audience_id: audienceId });
      const res = await api<{ issue: Issue }>("POST", `/api/issues/${issue.id}/send`, { scheduled_at: when || undefined });
      onSent(res.issue);
    } catch (e) {
      setErr((e as Error).message);
      setBusy("");
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send “{issue.title}”</DialogTitle>
        </DialogHeader>

        {!connected ? (
          <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            Connect Resend first — add <code>RESEND_API_KEY</code> in your Clawnify environment.
          </p>
        ) : (
          <div className="space-y-4">
            {!fromReady ? (
              <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">Set a “from” name and email in Settings before sending.</p>
            ) : null}

            <div className="space-y-1.5">
              <Label>Audience</Label>
              <Select value={audienceId} onValueChange={setAudienceId}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  {audiences.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border p-3">
              <Label className="mb-1.5 block">Send a test</Label>
              <div className="flex gap-2">
                <Input placeholder="you@example.com" value={testTo} onChange={(e) => setTestTo(e.target.value)} />
                <Button variant="outline" disabled={!testTo.trim() || busy === "test"} onClick={sendTest}>
                  {busy === "test" ? "Sending…" : "Test"}
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Schedule (optional)</Label>
              <Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
            </div>
          </div>
        )}

        {err ? <p className="text-sm text-destructive">{err}</p> : null}
        {msg ? <p className="text-sm text-green-600">{msg}</p> : null}

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          {connected ? (
            <Button disabled={!audienceId || !fromReady || busy === "send"} onClick={send}>
              {busy === "send" ? "Sending…" : when ? "Schedule" : "Send now"}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
