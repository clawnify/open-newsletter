/**
 * Minimal, email-safe Markdown → HTML for newsletter bodies.
 *
 * Deliberately small: we control the input (AI-generated or
 * hand-edited editorial prose), and email clients only support a
 * narrow HTML/CSS subset, so a full CommonMark parser would be both
 * overkill and risky. Supports: h2/h3, paragraphs, bold/italic,
 * inline links, inline code, unordered/ordered lists, blockquotes,
 * horizontal rules, and images.
 *
 * Output is intentionally class-free and tag-only; the preview wraps
 * it in `.nl-body` (CSS classes) and the email renderer post-processes
 * it to inline styles. Both share THIS converter so body formatting
 * never diverges between preview and the sent email.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Inline spans: bold, italic, code, links. Run on already-escaped text. */
function inline(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_m, alt, src) => `<img src="${src}" alt="${alt}">`)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label, href) => `<a href="${href}">${label}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

export function markdownToHtml(md: string): string {
  const lines = (md || "").replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;
  let listType: "ul" | "ol" | null = null;

  const closeList = () => {
    if (listType) {
      out.push(`</${listType}>`);
      listType = null;
    }
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Blank line → paragraph break
    if (trimmed === "") {
      closeList();
      i++;
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      closeList();
      out.push("<hr>");
      i++;
      continue;
    }

    // Headings (h2/h3 only — the issue title is a structured field)
    const h = trimmed.match(/^(#{2,3})\s+(.*)$/);
    if (h) {
      closeList();
      const level = h[1].length;
      out.push(`<h${level}>${inline(escapeHtml(h[2]))}</h${level}>`);
      i++;
      continue;
    }

    // Blockquote (consume consecutive > lines)
    if (/^>\s?/.test(trimmed)) {
      closeList();
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
        buf.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      out.push(`<blockquote>${inline(escapeHtml(buf.join(" ")))}</blockquote>`);
      continue;
    }

    // Lists
    const ul = trimmed.match(/^[-*+]\s+(.*)$/);
    const ol = trimmed.match(/^\d+\.\s+(.*)$/);
    if (ul || ol) {
      const type = ul ? "ul" : "ol";
      if (listType !== type) {
        closeList();
        out.push(`<${type}>`);
        listType = type;
      }
      out.push(`<li>${inline(escapeHtml((ul || ol)![1]))}</li>`);
      i++;
      continue;
    }

    // Standalone image line
    const img = trimmed.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
    if (img) {
      closeList();
      out.push(`<img src="${img[2]}" alt="${img[1]}">`);
      i++;
      continue;
    }

    // Paragraph (consume consecutive non-blank, non-special lines)
    closeList();
    const buf: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{2,3}\s|>\s?|[-*+]\s|\d+\.\s|(-{3,}|\*{3,}|_{3,})$)/.test(lines[i].trim())
    ) {
      buf.push(lines[i].trim());
      i++;
    }
    out.push(`<p>${inline(escapeHtml(buf.join(" ")))}</p>`);
  }

  closeList();
  return out.join("\n");
}
