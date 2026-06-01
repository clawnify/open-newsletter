---
version: alpha
name: Bold Bulletin
description: Loud color, heavy sans display, a feature image up top. For product launches.
colors:
  background: "#0B1020"
  foreground: "#F4F5FB"
  primary: "#7C5CFF"
  onPrimary: "#FFFFFF"
  secondary: "#9AA0B5"
  link: "#9D86FF"
  border: "#22263A"
typography:
  headingFont: inter
  bodyFont: inter
  baseSize: 16px
  titleSize: 44px
  lineHeight: 1.6
  headingWeight: 800
layout:
  contentWidth: 600px
  spacing: 26px
  radius: 14px
options:
  showHeader: true
  showFeatureImage: true
  showByline: false
  showDivider: false
  showFooter: true
---

# Bold Bulletin

A dark, high-contrast launch brand. Heavy display weight, a violet accent,
generously rounded corners, and a feature image leading the issue. Use it
for product announcements and moments that should feel like an event.

Dark backgrounds render reliably in most modern email clients; the renderer
pins `color-scheme: light` so clients don't re-invert the palette.

Runtime mirror: the `bold-bulletin` entry in `src/shared/templates.ts`.
