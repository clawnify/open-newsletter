import { DEFAULT_DESIGN, withDefaults, applyMobile, type DesignTokens } from "../../shared/design";
import type { Issue, Template } from "../../shared/types";

/** Base (desktop) tokens for an issue: issue override → template → default. */
export function baseDesign(issue: Issue, templates: Template[]): DesignTokens {
  if (issue.design) return withDefaults(issue.design);
  const t = templates.find((x) => x.slug === issue.template_slug);
  return t ? withDefaults(t.design) : DEFAULT_DESIGN;
}

/** Effective tokens for a device: desktop = base, mobile = base + mobile override. */
export function effectiveDesign(
  issue: Issue,
  templates: Template[],
  device: "desktop" | "mobile" = "desktop",
): DesignTokens {
  const base = baseDesign(issue, templates);
  return device === "mobile" ? applyMobile(base, issue.design_mobile) : base;
}
