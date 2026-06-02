/**
 * Resend adapter for the EmailProvider interface.
 *
 * Resend has renamed Audiences → Segments (Audiences are deprecated),
 * so `audienceId` maps to `segment_id` here. Endpoints used:
 *   GET  /segments                          — list audiences
 *   GET  /segments/{id}/contacts            — list contacts
 *   POST /contacts                          — create contact (+ segments)
 *   DELETE /contacts/{id}                   — remove contact
 *   POST /emails                            — one-off (test) send
 *   POST /broadcasts                        — create broadcast draft
 *   POST /broadcasts/{id}/send              — send / schedule broadcast
 *
 * REST (fetch) rather than the `resend` SDK: no dependency, and the
 * raw API is a better fit for a Worker.
 */
import type { ResendAudience, ResendContact } from "../../shared/types";
import type { CreateBroadcastInput, EmailProvider, NewContact, SendResult } from "./types";

const BASE = "https://api.resend.com";

export class ResendProvider implements EmailProvider {
  readonly name = "resend";
  constructor(private apiKey: string) {}

  private async req<T>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let json: any = undefined;
    if (text) {
      try {
        json = JSON.parse(text);
      } catch {
        /* non-JSON */
      }
    }
    if (!res.ok) {
      const msg = json?.message || json?.error?.message || text || `HTTP ${res.status}`;
      throw new Error(`Resend ${method} ${path} → ${res.status}: ${msg}`);
    }
    return json as T;
  }

  async listAudiences(): Promise<ResendAudience[]> {
    const data = await this.req<{ data?: Array<{ id: string; name: string }> }>("GET", "/segments");
    return (data.data || []).map((a) => ({ id: a.id, name: a.name }));
  }

  async listDomains(): Promise<{ name: string; status: string }[]> {
    const data = await this.req<{ data?: Array<{ name: string; status: string }> }>("GET", "/domains");
    return (data.data || []).map((d) => ({ name: d.name, status: d.status }));
  }

  async listContacts(audienceId: string): Promise<ResendContact[]> {
    const data = await this.req<{ data?: any[] }>(
      "GET",
      `/segments/${encodeURIComponent(audienceId)}/contacts`,
    );
    return (data.data || []).map((c) => ({
      id: c.id,
      email: c.email,
      first_name: c.first_name,
      last_name: c.last_name,
      unsubscribed: c.unsubscribed,
      created_at: c.created_at,
    }));
  }

  async addContact(audienceId: string, contact: NewContact): Promise<ResendContact> {
    const c = await this.req<{ id: string }>("POST", "/contacts", {
      email: contact.email,
      first_name: contact.first_name,
      last_name: contact.last_name,
      segments: [audienceId],
    });
    return { id: c.id, email: contact.email, first_name: contact.first_name, last_name: contact.last_name };
  }

  async removeContact(_audienceId: string, contactId: string): Promise<void> {
    await this.req("DELETE", `/contacts/${encodeURIComponent(contactId)}`);
  }

  async sendEmail(input: { from: string; to: string; subject: string; html: string }): Promise<SendResult> {
    const r = await this.req<{ id: string }>("POST", "/emails", {
      from: input.from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
    });
    return { id: r.id };
  }

  async createBroadcast(input: CreateBroadcastInput): Promise<SendResult> {
    const r = await this.req<{ id: string }>("POST", "/broadcasts", {
      segment_id: input.audienceId,
      from: input.from,
      subject: input.subject,
      html: input.html,
    });
    return { id: r.id };
  }

  async sendBroadcast(broadcastId: string, scheduledAt?: string | null): Promise<void> {
    await this.req("POST", `/broadcasts/${encodeURIComponent(broadcastId)}/send`, {
      ...(scheduledAt ? { scheduled_at: scheduledAt } : {}),
    });
  }
}
