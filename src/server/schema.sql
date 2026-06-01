-- Newsletter issues (Ghost calls these "posts").
CREATE TABLE IF NOT EXISTS issues (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  eyebrow TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT 'Untitled',
  subtitle TEXT NOT NULL DEFAULT '',
  byline_name TEXT NOT NULL DEFAULT '',
  byline_date TEXT NOT NULL DEFAULT '',
  feature_image TEXT NOT NULL DEFAULT '',
  -- Body as an ordered JSON array of blocks.
  blocks TEXT NOT NULL DEFAULT '[]',
  -- Per-issue DESIGN.md token overrides (JSON), or NULL to inherit template/default.
  design TEXT,
  -- Mobile-only token overrides (partial JSON), layered on top of `design` when device=mobile.
  design_mobile TEXT,
  template_slug TEXT,
  -- Resend segment (audience) id this issue targets.
  audience_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft',  -- draft | scheduled | sent
  broadcast_id TEXT,
  scheduled_at TEXT,
  sent_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Reusable look + content skeleton. Built-ins are seeded; users "Save as..".
CREATE TABLE IF NOT EXISTS templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  design TEXT NOT NULL,     -- DESIGN.md tokens (JSON)
  skeleton TEXT NOT NULL,   -- content skeleton (JSON)
  builtin INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Single-row app configuration (id is always 1).
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  publication_name TEXT NOT NULL DEFAULT 'My Newsletter',
  logo TEXT NOT NULL DEFAULT '',
  from_name TEXT NOT NULL DEFAULT '',
  from_email TEXT NOT NULL DEFAULT '',
  default_audience_id TEXT,
  footer_text TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_updated ON issues(updated_at);
