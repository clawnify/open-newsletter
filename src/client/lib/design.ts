import { DEFAULT_DESIGN, withDefaults, applyMobile, type DesignTokens } from "../../shared/design";
import type { Mail, Template } from "../../shared/types";

/** Base (desktop) tokens for an mail: mail override → template → default. */
export function baseDesign(mail: Mail, templates: Template[]): DesignTokens {
  if (mail.design) return withDefaults(mail.design);
  const t = templates.find((x) => x.slug === mail.template_slug);
  return t ? withDefaults(t.design) : DEFAULT_DESIGN;
}

/** Effective tokens for a device: desktop = base, mobile = base + mobile override. */
export function effectiveDesign(
  mail: Mail,
  templates: Template[],
  device: "desktop" | "mobile" = "desktop",
): DesignTokens {
  const base = baseDesign(mail, templates);
  return device === "mobile" ? applyMobile(base, mail.design_mobile) : base;
}
