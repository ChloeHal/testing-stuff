import { Fragment } from "react";

/**
 * Lightweight inline markdown renderer.
 * Supports: **bold**, `code`, and - list items.
 */
export default function MarkdownText({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = () => {
    if (listBuffer.length === 0) return;
    elements.push(
      <ul key={`ul-${elements.length}`} className="my-1.5 ml-4 list-disc space-y-0.5">
        {listBuffer.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </ul>
    );
    listBuffer = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("- ")) {
      listBuffer.push(trimmed.slice(2));
    } else {
      flushList();
      if (trimmed === "") {
        elements.push(<div key={`br-${elements.length}`} className="h-2" />);
      } else {
        elements.push(
          <p key={`p-${elements.length}`}>{renderInline(trimmed)}</p>
        );
      }
    }
  }
  flushList();

  return <div className="space-y-0.5">{elements}</div>;
}

function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <Fragment key={lastIndex}>{text.slice(lastIndex, match.index)}</Fragment>
      );
    }
    const token = match[0];
    if (token.startsWith("**")) {
      parts.push(
        <strong key={match.index} className="font-semibold">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("`")) {
      parts.push(
        <code
          key={match.index}
          className="rounded bg-slate-200 px-1 py-0.5 text-[12px] font-mono text-slate-800"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(<Fragment key={lastIndex}>{text.slice(lastIndex)}</Fragment>);
  }
  return parts.length === 1 ? parts[0] : parts;
}
