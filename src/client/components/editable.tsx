import { useRef, useEffect, type CSSProperties } from "react";
import { inlineMarkdownToHtml } from "../../shared/markdown";

/**
 * Uncontrolled contentEditable. While idle it shows `value` rendered (inline
 * Markdown → HTML, so **bold** looks bold); on focus it swaps to the raw
 * Markdown source to edit, committing that source on blur or Enter. The DOM is
 * left alone while focused so the caret never jumps. The backbone of "just type
 * on it" — storage stays Markdown, the AI round-trip is unaffected.
 */
export function Editable({
  value,
  onCommit,
  tag = "div",
  multiline = false,
  placeholder = "",
  className = "",
  style = {},
}: {
  value: string;
  onCommit: (v: string) => void;
  tag?: keyof React.JSX.IntrinsicElements;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);

  // Render the formatted value while idle (e.g. after an AI edit). Never touch
  // the DOM while focused — the user is editing the raw source there.
  useEffect(() => {
    const el = ref.current;
    if (el && document.activeElement !== el) {
      el.innerHTML = inlineMarkdownToHtml(value, multiline);
    }
  }, [value, multiline]);

  const Tag = tag as React.ElementType;
  const props: Record<string, unknown> = {
    ref,
    contentEditable: true,
    suppressContentEditableWarning: true,
    "data-placeholder": placeholder,
    spellCheck: false,
    className: `nl-editable outline-none ${className}`,
    style,
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
      // Swap the rendered HTML for the raw Markdown source so it's editable.
      const el = e.currentTarget;
      if (el.innerText !== value) el.innerText = value;
    },
    onBlur: (e: React.FocusEvent<HTMLElement>) => onCommit(e.currentTarget.innerText),
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
      if (!multiline && e.key === "Enter") {
        e.preventDefault();
        (e.currentTarget as HTMLElement).blur();
      }
    },
  };
  return <Tag {...props} />;
}
