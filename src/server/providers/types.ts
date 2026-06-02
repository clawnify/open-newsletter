/**
 * Email-provider abstraction. The app talks to this interface; a
 * concrete provider (currently only Resend) maps it to a vendor API.
 *
 * Designed so a second provider (Loops, Mailchimp, …) is a new file
 * implementing this interface + one line in `providers/index.ts` — no
 * changes to routes or UI. Only Resend is wired today.
 *
 * Domain vocabulary: we call a recipient list an **audience**. Resend
 * has renamed these to "segments" internally, so the Resend adapter
 * maps `audienceId` → `segment_id`.
 */
import type { ResendAudience, ResendContact } from "../../shared/types";

export interface SendResult {
  id: string;
}

export interface NewContact {
  email: string;
  first_name?: string;
  last_name?: string;
}

export interface CreateBroadcastInput {
  audienceId: string;
  from: string;
  subject: string;
  html: string;
}

export interface EmailProvider {
  /** Provider id, e.g. "resend". */
  readonly name: string;

  // ── Audience / contacts ──
  listAudiences(): Promise<ResendAudience[]>;
  /** Verified sending domains on the provider account (status: "verified", …). */
  listDomains(): Promise<{ name: string; status: string }[]>;
  listContacts(audienceId: string): Promise<ResendContact[]>;
  addContact(audienceId: string, contact: NewContact): Promise<ResendContact>;
  removeContact(audienceId: string, contactId: string): Promise<void>;

  // ── Sending ──
  /** Send a one-off email (used for "send test"). */
  sendEmail(input: { from: string; to: string; subject: string; html: string }): Promise<SendResult>;
  /** Create a broadcast draft to an audience; returns its id. */
  createBroadcast(input: CreateBroadcastInput): Promise<SendResult>;
  /** Trigger a created broadcast, optionally scheduled (natural language or ISO). */
  sendBroadcast(broadcastId: string, scheduledAt?: string | null): Promise<void>;
}
