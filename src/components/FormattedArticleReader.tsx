import React from 'react';

interface FormattedArticleReaderProps {
  content: string;
}

/**
 * Parses markdown text into formatted inline elements (bold, code, math, italics)
 */
function renderInlineFormatting(text: string): React.ReactNode[] {
  const tokens = text.split(/(`[^`]+`|\$[^$]+\$|\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return tokens.map((part, idx) => {
    if (!part) return null;

    // Inline code `...`
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={idx}
          className="rounded bg-[#0b0d0f] text-[#a3e635] border border-white/10 px-1.5 py-0.5 font-mono text-xs font-semibold"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Inline math $...$
    if (part.startsWith('$') && part.endsWith('$')) {
      return (
        <span
          key={idx}
          className="rounded bg-[#c59a67]/10 text-[#c59a67] border border-[#c59a67]/30 px-1.5 py-0.5 font-mono text-xs font-medium"
        >
          {part.slice(1, -1)}
        </span>
      );
    }

    // Bold **...**
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-bold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Italic *...*
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={idx} className="italic text-slate-300">
          {part.slice(1, -1)}
        </em>
      );
    }

    return part;
  });
}

/**
 * Checks if a string block is a markdown table
 */
function isTableBlock(lines: string[]): boolean {
  return lines.length >= 2 && lines[0].includes('|') && lines[1].includes('|') && lines[1].includes('---');
}

/**
 * Renders a markdown table into a styled HTML table
 */
function renderTable(lines: string[], key: number): React.ReactNode {
  const parseRow = (line: string) =>
    line
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim());

  const headers = parseRow(lines[0]);
  const rows = lines.slice(2).map(parseRow);

  return (
    <div key={key} className="my-6 overflow-x-auto rounded-xl border border-white/10 shadow-xl">
      <table className="w-full text-left text-xs sm:text-sm border-collapse">
        <thead className="bg-[#0e1115] border-b border-white/10 text-slate-400">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-2.5 font-bold uppercase tracking-wider text-[11px] font-mono">
                {renderInlineFormatting(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 bg-[#13161b]">
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-white/5 transition">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-4 py-2.5 text-slate-300 font-normal leading-relaxed">
                  {renderInlineFormatting(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const FormattedArticleReader: React.FC<FormattedArticleReaderProps> = ({ content }) => {
  const blocks = content.split('\n\n');

  const renderedElements: React.ReactNode[] = [];

  let idx = 0;
  while (idx < blocks.length) {
    const block = blocks[idx].trim();
    if (!block) {
      idx++;
      continue;
    }

    // 1. Code blocks ```...```
    if (block.startsWith('```')) {
      const codeMatch = block.match(/```(?:[a-zA-Z0-9_-]+)?\n([\s\S]*?)```/);
      const codeText = codeMatch ? codeMatch[1] : block.replace(/^```[a-z]*\n?|```$/g, '');
      renderedElements.push(
        <div key={idx} className="my-5 rounded-2xl bg-[#0b0d0f] border border-white/10 p-4 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[10px] text-slate-500 font-mono">
            <span>TERMINAL / INVARIANT ENGINE</span>
            <span>UTF-8</span>
          </div>
          <pre className="font-mono text-xs sm:text-[13px] text-[#a3e635] overflow-x-auto leading-relaxed whitespace-pre">
            {codeText}
          </pre>
        </div>
      );
      idx++;
      continue;
    }

    // 2. Display Math formulas $$...$$
    if (block.startsWith('$$') && block.endsWith('$$')) {
      const mathText = block.slice(2, -2).trim();
      renderedElements.push(
        <div
          key={idx}
          className="my-5 rounded-2xl bg-[#13161b] border border-white/10 px-6 py-4 text-center font-mono text-sm sm:text-base text-white shadow-xl overflow-x-auto"
        >
          <span className="text-[10px] text-[#c59a67] font-mono uppercase font-bold tracking-wider block mb-1">
            Mathematical Invariant
          </span>
          <code className="text-[#a3e635] font-bold">{mathText}</code>
        </div>
      );
      idx++;
      continue;
    }

    // 3. Tables
    const blockLines = block.split('\n');
    if (isTableBlock(blockLines)) {
      renderedElements.push(renderTable(blockLines, idx));
      idx++;
      continue;
    }

    // 4. Horizontal Rule ---
    if (block === '---' || block === '***') {
      renderedElements.push(<hr key={idx} className="my-8 border-t border-white/10" />);
      idx++;
      continue;
    }

    // 5. Headings (##, ###, #)
    if (block.startsWith('# ')) {
      renderedElements.push(
        <h1 key={idx} className="font-serif-tattva text-2xl sm:text-3xl font-normal text-white mt-8 mb-3 tracking-tight">
          {renderInlineFormatting(block.replace(/^#\s+/, ''))}
        </h1>
      );
      idx++;
      continue;
    }

    if (block.startsWith('## ')) {
      renderedElements.push(
        <h2
          key={idx}
          className="font-serif-tattva text-xl sm:text-2xl font-normal text-white mt-8 mb-3 pb-2 border-b border-white/10 tracking-tight flex items-center gap-2"
        >
          <span className="w-1.5 h-4 rounded-full bg-[#c59a67] shrink-0" />
          <span>{renderInlineFormatting(block.replace(/^##\s+/, ''))}</span>
        </h2>
      );
      idx++;
      continue;
    }

    if (block.startsWith('### ')) {
      renderedElements.push(
        <h3 key={idx} className="font-serif-tattva text-lg sm:text-xl font-normal text-[#c59a67] mt-5 mb-2 tracking-tight">
          {renderInlineFormatting(block.replace(/^###\s+/, ''))}
        </h3>
      );
      idx++;
      continue;
    }

    // 6. Blockquote > ...
    if (block.startsWith('> ')) {
      renderedElements.push(
        <blockquote
          key={idx}
          className="my-4 border-l-4 border-[#c59a67] bg-[#c59a67]/10 pl-4 py-2.5 text-xs sm:text-sm text-slate-200 italic rounded-r-xl font-sans"
        >
          {renderInlineFormatting(block.replace(/^>\s+/, ''))}
        </blockquote>
      );
      idx++;
      continue;
    }

    // 7. Bullet Lists or Numbered Lists
    if (block.split('\n').every((l) => l.trim().startsWith('- ') || l.trim().startsWith('* ') || /^\d+\.\s/.test(l.trim()))) {
      const listItems = block.split('\n').filter((l) => l.trim().length > 0);
      renderedElements.push(
        <ul key={idx} className="my-4 space-y-2 pl-2">
          {listItems.map((item, itemIdx) => {
            const cleanText = item.replace(/^[-*]\s+|\d+\.\s+/, '');
            return (
              <li key={itemIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c59a67] mt-2 shrink-0" />
                <span className="flex-1">{renderInlineFormatting(cleanText)}</span>
              </li>
            );
          })}
        </ul>
      );
      idx++;
      continue;
    }

    // 8. Standard Paragraph
    renderedElements.push(
      <p key={idx} className="text-xs sm:text-sm text-slate-300 leading-relaxed my-3 font-normal font-sans">
        {renderInlineFormatting(block)}
      </p>
    );

    idx++;
  }

  return <div className="space-y-2">{renderedElements}</div>;
};
