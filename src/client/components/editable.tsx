import { useRef, useEffect, type CSSProperties } from "react";

/**
 * Uncontrolled contentEditable. Renders `value` once, then leaves the
 * DOM alone while the user types (so the caret never jumps), committing
 * the plain text on blur or Enter. The backbone of "just type on it".
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

  // Sync DOM text only when the incoming value differs from what's shown
  // (e.g. AI regenerated it) — never while the element has focus.
  useEffect(() => {
    const el = ref.current;
    if (el && document.activeElement !== el && el.innerText !== value) {
      el.innerText = value;
    }
  }, [value]);

  const Tag = tag as React.ElementType;
  const props: Record<string, unknown> = {
    ref,
    contentEditable: true,
    suppressContentEditableWarning: true,
    "data-placeholder": placeholder,
    spellCheck: false,
    className: `nl-editable outline-none ${className}`,
    style,
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
