/**
 * Built-in newsletter templates. A template = DESIGN.md tokens + a
 * content skeleton (masthead fields + body blocks). Seeded into D1 on
 * first run; "Save as.." adds user templates alongside them.
 *
 * Each built-in is also published in the repo as a DESIGN.md file under
 * `templates/<slug>/` (the authored, portable form). This array is the
 * runtime mirror.
 */
import { DEFAULT_DESIGN, type DesignTokens } from "./design";
import { markdownToBlocks, blockId } from "./blocks";
import type { Block, TemplateSkeleton } from "./types";

export interface BuiltinTemplate {
  slug: string;
  name: string;
  description: string;
  design: DesignTokens;
  skeleton: TemplateSkeleton;
}

function body(md: string, extra: Block[] = []): Block[] {
  return [...markdownToBlocks(md), ...extra];
}

const editorialSkeleton: TemplateSkeleton = {
  eyebrow: "THE EDITORIAL REVIEW · VOLUME XXIII",
  title: "The Art of Modern Typography in Digital Design",
  subtitle: "A deep dive into how typefaces shape our digital experiences.",
  byline_name: "Jonathan Edwards",
  byline_date: "December 3, 2024",
  feature_image: "",
  blocks: body(
    `In an era where screens dominate our daily interactions, typography has emerged as the silent architect of digital experiences.

> "Typography is what language looks like. In the digital age, it's become the voice of our visual culture."

## Why it matters

Good type does more than decorate — it sets pace, signals hierarchy, and earns trust before a single word is read.

- **Rhythm** keeps long reads comfortable.
- **Contrast** guides the eye to what matters.
- **Restraint** is what separates editorial from noise.

## The takeaway

Treat type as the interface, not the garnish. Your readers will feel the difference even if they never name it.`,
  ),
};

export const BUILTIN_TEMPLATES: BuiltinTemplate[] = [
  {
    slug: "classic-editorial",
    name: "Classic Editorial",
    description: "Serif headlines, italic deck, a single accent rule. Reads like a magazine column.",
    design: DEFAULT_DESIGN,
    skeleton: editorialSkeleton,
  },
  {
    slug: "product-update",
    name: "Product Update",
    description: "A clean white card on gray, Inter, bold headline, a single blue button. For SaaS launches.",
    design: {
      colors: {
        page: "#F5F5F5",
        background: "#FFFFFF",
        foreground: "#0A0A0A",
        primary: "#155EFF",
        onPrimary: "#FFFFFF",
        secondary: "#9CA3AF",
        link: "#155EFF",
        border: "#ECECEC",
      },
      typography: {
        headingFont: "inter",
        bodyFont: "inter",
        baseSize: 15,
        titleSize: 30,
        lineHeight: 1.55,
        headingWeight: 700,
      },
      layout: { contentWidth: 600, spacing: 16, imageRadius: 8, buttonRadius: 6, cardRadius: 16, outerPadding: 24 },
      options: {
        showHeader: true,
        showFeatureImage: false,
        showByline: false,
        showDivider: false,
        showFooter: true,
      },
    },
    skeleton: {
      eyebrow: "New Feature",
      title: "Introducing: Content Agent",
      subtitle: "",
      byline_name: "",
      byline_date: "",
      feature_image: "",
      blocks: body(
        `Content Agent helps marketers create content based on more than just a prompt.

It pulls from the data your platform already has about your brand's presence in AI answers, how models crawl your pages, and the gaps in your content. The result is highly relevant content that gets your brand cited.

![Product screenshot](https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&q=80)

Here's how it works:

1. Select a prompt you want to increase your visibility for
2. Choose your content type, length, persona, and tone
3. Upload a content brief for even more context
4. Hit "Run Agent" and let it do the rest`,
        [
          { id: blockId(), type: "button", text: "Try Content Agent", href: "https://example.com", align: "left" },
          { id: blockId(), type: "text", md: "*You can also access Content Agent with our API & MCP*" },
        ],
      ),
    },
  },
  {
    slug: "minimal-mono",
    name: "Minimal Mono",
    description: "Stripped-back, sans-serif, monochrome. For developer logs and changelogs.",
    design: {
      colors: {
        page: "#FFFFFF",
        background: "#FFFFFF",
        foreground: "#0A0A0A",
        primary: "#0A0A0A",
        onPrimary: "#FFFFFF",
        secondary: "#737373",
        link: "#0A0A0A",
        border: "#EAEAEA",
      },
      typography: {
        headingFont: "inter",
        bodyFont: "inter",
        baseSize: 15,
        titleSize: 30,
        lineHeight: 1.6,
        headingWeight: 700,
      },
      layout: { contentWidth: 560, spacing: 20, imageRadius: 4, buttonRadius: 4, cardRadius: 0, outerPadding: 0 },
      options: {
        showHeader: true,
        showFeatureImage: false,
        showByline: false,
        showDivider: true,
        showFooter: true,
      },
    },
    skeleton: {
      eyebrow: "CHANGELOG · WEEK 24",
      title: "What shipped this week",
      subtitle: "Three fixes, one feature, and a faster build.",
      byline_name: "",
      byline_date: "",
      feature_image: "",
      blocks: body(
        `## Added
- Inline preview now renders dark-mode tokens.

## Fixed
- Resolved a race when saving design tokens rapidly.

## Changed
- Build is ~30% faster on cold starts.

Thanks for reading. Reply with anything you'd like to see next.`,
      ),
    },
  },
  {
    slug: "bold-bulletin",
    name: "Bold Bulletin",
    description: "Loud color, heavy sans display, a feature image up top. For product launches.",
    design: {
      colors: {
        page: "#070A14",
        background: "#0B1020",
        foreground: "#F4F5FB",
        primary: "#7C5CFF",
        onPrimary: "#FFFFFF",
        secondary: "#9AA0B5",
        link: "#9D86FF",
        border: "#22263A",
      },
      typography: {
        headingFont: "inter",
        bodyFont: "inter",
        baseSize: 16,
        titleSize: 44,
        lineHeight: 1.6,
        headingWeight: 800,
      },
      layout: { contentWidth: 600, spacing: 26, imageRadius: 14, buttonRadius: 14, cardRadius: 20, outerPadding: 20 },
      options: {
        showHeader: true,
        showFeatureImage: true,
        showByline: false,
        showDivider: false,
        showFooter: true,
      },
    },
    skeleton: {
      eyebrow: "LAUNCH DAY",
      title: "Meet the thing we've been hiding",
      subtitle: "It's faster, it's bolder, and it's live today.",
      byline_name: "",
      byline_date: "",
      feature_image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&q=80",
      blocks: body(
        `Today we're flipping the switch. Here's what's new and why it matters.

## The headline feature

One sentence on the big thing. Make it concrete and benefit-led.`,
        [
          { id: blockId(), type: "button", text: "See it in action", href: "https://example.com", align: "left" },
        ],
      ),
    },
  },
  {
    slug: "product-bulletin",
    name: "Product Bulletin",
    description: "Bright and scannable — a bold heading, emoji-bulleted highlights, and one CTA. For changelogs and product updates.",
    design: {
      colors: {
        page: "#F4F6FB",
        background: "#FFFFFF",
        foreground: "#0B1220",
        primary: "#2563EB",
        onPrimary: "#FFFFFF",
        secondary: "#6B7280",
        link: "#2563EB",
        border: "#E6E9F2",
      },
      typography: { headingFont: "inter", bodyFont: "inter", baseSize: 15, titleSize: 32, lineHeight: 1.6, headingWeight: 700 },
      layout: { contentWidth: 600, spacing: 18, imageRadius: 12, buttonRadius: 8, cardRadius: 16, outerPadding: 24 },
      options: { showHeader: true, showFooter: true, autoButtonText: true },
    },
    skeleton: {
      eyebrow: "PRODUCT UPDATE",
      title: "Recent updates: the highlights",
      subtitle: "",
      byline_name: "",
      byline_date: "",
      feature_image: "",
      blocks: body(
        `Since the last update we've kept shipping — here's what's new and why it matters.

- 🆕 **New integrations** — BigQuery, Cal.com, Confluence, Postgres, and more.
- 🧠 **Smarter agents** — more reliable, robust, and self-aware.
- 🎨 **Custom icons** — pick a classic variant or your favorite emoji.
- 💸 **Credit alerts** — get notified before you run out.`,
        [{ id: blockId(), type: "button", text: "See the changelog", href: "https://example.com", align: "left" }],
      ),
    },
  },
  {
    slug: "announcement",
    name: "Announcement",
    description: "Loud and celebratory — a bright accent, big headline, and a single call to action. For launches and big news.",
    design: {
      colors: {
        page: "#FDF2F8",
        background: "#FFFFFF",
        foreground: "#111827",
        primary: "#EC4899",
        onPrimary: "#FFFFFF",
        secondary: "#6B7280",
        link: "#DB2777",
        border: "#F6E4EE",
      },
      typography: { headingFont: "inter", bodyFont: "inter", baseSize: 16, titleSize: 34, lineHeight: 1.55, headingWeight: 700 },
      layout: { contentWidth: 600, spacing: 20, imageRadius: 14, buttonRadius: 10, cardRadius: 18, outerPadding: 24 },
      options: { showHeader: true, showFooter: true, autoButtonText: true },
    },
    skeleton: {
      eyebrow: "NEW",
      title: "Introducing Community Templates",
      subtitle: "Curated, high-quality starting points — built by the team and the community.",
      byline_name: "",
      byline_date: "",
      feature_image: "",
      blocks: body(
        `Explore a curated collection of high-quality templates — both flows and agents — built by our team and community members. Get inspired, learn best practices, and set up new workflows fast.`,
        [{ id: blockId(), type: "button", text: "Check out templates", href: "https://example.com", align: "left" }],
      ),
    },
  },
  {
    slug: "partnership",
    name: "Partnership",
    description: "Minimal, black-on-white, co-branded. A title like “Acme × Partner”, link lists, and a clean second section. For collabs and integrations.",
    design: {
      colors: {
        page: "#FFFFFF",
        background: "#FFFFFF",
        foreground: "#0A0A0A",
        primary: "#0A0A0A",
        onPrimary: "#FFFFFF",
        secondary: "#6B7280",
        link: "#0A0A0A",
        border: "#E5E7EB",
      },
      typography: { headingFont: "inter", bodyFont: "inter", baseSize: 16, titleSize: 30, lineHeight: 1.6, headingWeight: 700 },
      layout: { contentWidth: 600, spacing: 22, imageRadius: 8, buttonRadius: 8, cardRadius: 0, outerPadding: 16 },
      options: { showHeader: true, showFooter: true, autoButtonText: true },
    },
    skeleton: {
      eyebrow: "",
      title: "Acme × Partner",
      subtitle: "How two teams are better together.",
      byline_name: "",
      byline_date: "",
      feature_image: "",
      blocks: body(
        `The team at **Partner** uses Acme to automatically enrich CRM data and generate personalized outreach for enterprise prospects. We just shipped a Partner integration — here's what you can build with it:

- [Enrich leads and route to sales with AI research](https://example.com)
- [Research any company or person for personalized outreach](https://example.com)
- [Competitive SEO analyzer](https://example.com)

## New learning resources

Two new courses and a refreshed curriculum, plus certifications to show your expertise.`,
      ),
    },
  },
];
