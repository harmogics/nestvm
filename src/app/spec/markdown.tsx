// A compact renderer for the GFM subset used by the specification set:
// ATX headings (anchored), paragraphs, pipe tables, fenced code blocks,
// nested ordered/unordered lists, blockquotes, and inline code / bold /
// italic / links. Relative .md links are rewritten to /spec routes so the
// set remains one navigable book. Deliberately no raw HTML pass-through.

import React, { type ReactNode } from "react";
import { anchorOf } from "@/corpus/anchor";

function rewriteHref(href: string): { href: string; external: boolean } {
  if (/^https?:\/\//.test(href)) return { href, external: true };
  const [pathPart, hash] = href.split("#");
  if (pathPart === "" && hash) return { href: `#${hash}`, external: false };
  if (/\.md$/.test(pathPart)) {
    const slug = pathPart.replace(/^\.\//, "").replace(/\.md$/, "");
    return { href: `/spec/${slug}${hash ? `#${hash}` : ""}`, external: false };
  }
  return { href, external: false };
}

// --- inline rendering -------------------------------------------------------

function renderInline(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let buffer = "";
  let i = 0;
  let k = 0;
  const flush = () => {
    if (buffer) {
      nodes.push(buffer);
      buffer = "";
    }
  };
  while (i < text.length) {
    const ch = text[i];
    if (ch === "`") {
      const end = text.indexOf("`", i + 1);
      if (end !== -1) {
        flush();
        nodes.push(<code key={`${keyBase}-c${k++}`}>{text.slice(i + 1, end)}</code>);
        i = end + 1;
        continue;
      }
    }
    if (ch === "[") {
      const closeBracket = text.indexOf("]", i);
      if (closeBracket !== -1 && text[closeBracket + 1] === "(") {
        const closeParen = text.indexOf(")", closeBracket + 2);
        if (closeParen !== -1) {
          flush();
          const label = text.slice(i + 1, closeBracket);
          const target = rewriteHref(text.slice(closeBracket + 2, closeParen));
          nodes.push(
            <a
              key={`${keyBase}-a${k++}`}
              href={target.href}
              {...(target.external ? { target: "_blank", rel: "noreferrer" } : {})}
            >
              {renderInline(label, `${keyBase}-a${k}`)}
            </a>
          );
          i = closeParen + 1;
          continue;
        }
      }
    }
    if (text.startsWith("**", i)) {
      const end = text.indexOf("**", i + 2);
      if (end !== -1) {
        flush();
        nodes.push(<strong key={`${keyBase}-b${k++}`}>{renderInline(text.slice(i + 2, end), `${keyBase}-b${k}`)}</strong>);
        i = end + 2;
        continue;
      }
    }
    if (ch === "*" && text[i + 1] !== "*") {
      const end = text.indexOf("*", i + 1);
      if (end !== -1 && end > i + 1) {
        flush();
        nodes.push(<em key={`${keyBase}-i${k++}`}>{renderInline(text.slice(i + 1, end), `${keyBase}-i${k}`)}</em>);
        i = end + 1;
        continue;
      }
    }
    buffer += ch;
    i += 1;
  }
  flush();
  return nodes;
}

// --- table row splitting (respects inline code spans) -----------------------

function splitRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  const cells: string[] = [];
  let current = "";
  let inCode = false;
  for (const ch of trimmed) {
    if (ch === "`") inCode = !inCode;
    if (ch === "|" && !inCode) {
      cells.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells;
}

// --- list parsing ------------------------------------------------------------

type ListItem = { indent: number; ordered: boolean; text: string };

function renderList(items: ListItem[], keyBase: string): ReactNode {
  const build = (slice: ListItem[], depth: number, kb: string): ReactNode => {
    if (slice.length === 0) return null;
    const baseIndent = slice[0].indent;
    const ordered = slice[0].ordered;
    const rendered: ReactNode[] = [];
    let index = 0;
    let li = 0;
    while (index < slice.length) {
      const item = slice[index];
      const children: ListItem[] = [];
      let j = index + 1;
      while (j < slice.length && slice[j].indent > baseIndent) {
        children.push(slice[j]);
        j += 1;
      }
      rendered.push(
        <li key={`${kb}-li${li++}`}>
          {renderInline(item.text, `${kb}-li${li}`)}
          {children.length > 0 && build(children, depth + 1, `${kb}-d${depth}`)}
        </li>
      );
      index = j;
    }
    return ordered ? <ol key={kb}>{rendered}</ol> : <ul key={kb}>{rendered}</ul>;
  };
  return build(items, 0, keyBase);
}

// --- block parsing ------------------------------------------------------------

export function renderMarkdown(markdown: string): ReactNode[] {
  const lines = markdown.split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let b = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (/^\s*$/.test(line)) {
      i += 1;
      continue;
    }

    // fenced code
    const fence = line.match(/^```(\w*)/);
    if (fence) {
      const buffer: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith("```")) {
        buffer.push(lines[i]);
        i += 1;
      }
      i += 1; // closing fence
      blocks.push(
        <pre key={`b${b++}`} data-lang={fence[1] || undefined}>
          <code>{buffer.join("\n")}</code>
        </pre>
      );
      continue;
    }

    // heading
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2].trim();
      const id = anchorOf(text);
      const content = renderInline(text, `b${b}`);
      blocks.push(
        level === 1 ? (
          <h1 key={`b${b++}`} id={id}>{content}</h1>
        ) : level === 2 ? (
          <h2 key={`b${b++}`} id={id}>{content}</h2>
        ) : level === 3 ? (
          <h3 key={`b${b++}`} id={id}>{content}</h3>
        ) : (
          <h4 key={`b${b++}`} id={id}>{content}</h4>
        )
      );
      i += 1;
      continue;
    }

    // table
    if (line.trim().startsWith("|") && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1]) && lines[i + 1].includes("-")) {
      const headerCells = splitRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(splitRow(lines[i]));
        i += 1;
      }
      blocks.push(
        <div className="table-scroll" key={`b${b++}`}>
          <table>
            <thead>
              <tr>
                {headerCells.map((cell, ci) => (
                  <th key={ci}>{renderInline(cell, `b${b}-h${ci}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci}>{renderInline(cell, `b${b}-r${ri}c${ci}`)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // blockquote
    if (line.trim().startsWith(">")) {
      const buffer: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        buffer.push(lines[i].replace(/^\s*>\s?/, ""));
        i += 1;
      }
      blocks.push(<blockquote key={`b${b++}`}>{renderInline(buffer.join(" "), `b${b}`)}</blockquote>);
      continue;
    }

    // list (ordered or unordered), with indented continuation lines
    const listMatch = line.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
    if (listMatch) {
      const items: ListItem[] = [];
      while (i < lines.length) {
        const m = lines[i].match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
        if (m) {
          items.push({ indent: m[1].length, ordered: /\d/.test(m[2]), text: m[3] });
          i += 1;
        } else if (/^\s{2,}\S/.test(lines[i]) && items.length > 0) {
          items[items.length - 1].text += " " + lines[i].trim();
          i += 1;
        } else {
          break;
        }
      }
      blocks.push(<React.Fragment key={`b${b++}`}>{renderList(items, `b${b}`)}</React.Fragment>);
      continue;
    }

    // paragraph: gather until a blank line or a new block opener
    const buffer: string[] = [line.trim()];
    i += 1;
    while (
      i < lines.length &&
      !/^\s*$/.test(lines[i]) &&
      !/^(#{1,4})\s/.test(lines[i]) &&
      !lines[i].startsWith("```") &&
      !lines[i].trim().startsWith("|") &&
      !lines[i].trim().startsWith(">") &&
      !/^(\s*)([-*]|\d+\.)\s+/.test(lines[i])
    ) {
      buffer.push(lines[i].trim());
      i += 1;
    }
    blocks.push(<p key={`b${b++}`}>{renderInline(buffer.join(" "), `b${b}`)}</p>);
  }

  return blocks;
}
