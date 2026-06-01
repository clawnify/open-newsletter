/**
 * Provider registry. Resolves the active EmailProvider from the
 * environment. Today only Resend (keyed by RESEND_API_KEY); to add a
 * provider, implement EmailProvider and add a branch here.
 */
import type { EmailProvider } from "./types";
import { ResendProvider } from "./resend";

export type { EmailProvider } from "./types";

export function getEmailProvider(env: Record<string, string>): EmailProvider | null {
  if (env.RESEND_API_KEY) return new ResendProvider(env.RESEND_API_KEY);
  return null;
}
