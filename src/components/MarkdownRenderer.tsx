import React, { useState } from 'react';
import { Copy, Check, Lightbulb, Sparkles, BookOpen, Calculator } from 'lucide-react';
import confetti from 'canvas-confetti';
import katex from 'katex';

interface MarkdownRendererProps {
  content: string;
}

// Safely render KaTeX math to HTML
function renderKaTeX(tex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(tex.trim(), {
      displayMode,
      throwOnError: false,
      output: 'htmlAndMathml',
      strict: false,
    });
  } catch (err) {
    console.warn('KaTeX rendering error:', err);
    return `<span class="font-mono text-indigo-600">${tex}</span>`;
  }
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Render inline formatting: KaTeX math, bold, italic, inline code, links
  const renderFormattedText = (text: string) => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let keyIdx = 0;

    // Pattern for inline math ($...$ or \(...\)), inline code (`...`), bold (**...**), italic (*...*), markdown link
    // Avoid single dollar signs followed by digits without closing dollar or space after first dollar
    const regex = /(\$([^\$\n]+?)\$|\\\(([^\)]+?)\\\)|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)]+)\))/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(remaining)) !== null) {
      if (match.index > lastIndex) {
        parts.push(remaining.substring(lastIndex, match.index));
      }
      const raw = match[0];

      // Inline KaTeX: $...$
      if (raw.startsWith('$') && raw.endsWith('$') && raw.length > 2) {
        const mathContent = raw.slice(1, -1);
        const html = renderKaTeX(mathContent, false);
        parts.push(
          <span
            key={keyIdx++}
            className="inline-math px-1 py-0.5 text-indigo-950 dark:text-indigo-200 font-sans"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      }
      // Inline KaTeX: \( ... \)
      else if (raw.startsWith('\\(') && raw.endsWith('\\)')) {
        const mathContent = raw.slice(2, -2);
        const html = renderKaTeX(mathContent, false);
        parts.push(
          <span
            key={keyIdx++}
            className="inline-math px-1 py-0.5 text-indigo-950 dark:text-indigo-200 font-sans"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      }
      // Inline Code: `...`
      else if (raw.startsWith('`') && raw.endsWith('`')) {
        parts.push(
          <code
            key={keyIdx++}
            className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-mono text-xs md:text-sm border border-slate-200 dark:border-slate-700 font-medium"
          >
            {raw.slice(1, -1)}
          </code>
        );
      }
      // Bold: **...**
      else if (raw.startsWith('**') && raw.endsWith('**')) {
        parts.push(
          <strong key={keyIdx++} className="font-semibold text-slate-900 dark:text-slate-100">
            {raw.slice(2, -2)}
          </strong>
        );
      }
      // Italic: *...*
      else if (raw.startsWith('*') && raw.endsWith('*')) {
        parts.push(
          <em key={keyIdx++} className="italic text-slate-800 dark:text-slate-200">
            {raw.slice(1, -1)}
          </em>
        );
      }
      // Link: [text](url)
      else if (raw.startsWith('[') && raw.includes('](') && raw.endsWith(')')) {
        const linkText = raw.substring(1, raw.indexOf(']('));
        const linkUrl = raw.substring(raw.indexOf('](') + 2, raw.length - 1);
        parts.push(
          <a
            key={keyIdx++}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            {linkText}
          </a>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < remaining.length) {
      parts.push(remaining.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  // Split into major blocks: Code blocks (```...```) and Display Math blocks ($$...$$)
  const blocks = content.split(/(```[\s\S]*?```|\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\])/g);

  return (
    <div className="space-y-4 text-slate-800 dark:text-slate-200 text-sm md:text-base leading-relaxed break-words font-sans">
      {blocks.map((block, bIdx) => {
        if (!block) return null;

        // Display Math Block: $$...$$ or \[...\]
        if (
          (block.startsWith('$$') && block.endsWith('$$') && block.length > 4) ||
          (block.startsWith('\\[') && block.endsWith('\\]'))
        ) {
          const tex = block.startsWith('$$') ? block.slice(2, -2) : block.slice(2, -2);
          const html = renderKaTeX(tex, true);

          return (
            <div
              key={bIdx}
              className="my-3 p-4 rounded-xl border border-indigo-200/80 dark:border-indigo-800/80 bg-gradient-to-r from-indigo-50/50 via-purple-50/30 to-indigo-50/50 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-indigo-950/40 overflow-x-auto shadow-xs relative group"
            >
              <div className="flex items-center justify-between text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mb-1 border-b border-indigo-100 dark:border-indigo-900/60 pb-1">
                <span className="flex items-center gap-1.5 uppercase tracking-wider">
                  <Calculator className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Formula / Mathematical Equation</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(tex.trim(), bIdx)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900 text-slate-500 dark:text-slate-400"
                  title="Copy LaTeX"
                >
                  {copiedIndex === bIdx ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
              <div
                className="py-2 text-center text-slate-900 dark:text-slate-100 font-serif text-base md:text-lg overflow-x-auto scrollbar-none"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          );
        }

        // Code Block: ```lang ... ```
        if (block.startsWith('```') && block.endsWith('```')) {
          const lines = block.slice(3, -3).trim().split('\n');
          const language = lines[0].trim();
          const code = lines.slice(language ? 1 : 0).join('\n');

          return (
            <div
              key={bIdx}
              className="my-3 rounded-xl overflow-hidden border border-slate-700/60 bg-slate-900 text-slate-100 shadow-md font-mono text-xs md:text-sm"
            >
              <div className="flex items-center justify-between px-4 py-2 bg-slate-800/90 border-b border-slate-700 text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-indigo-400">
                  {language || 'code'}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(code, bIdx)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                >
                  {copiedIndex === bIdx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-emerald-300 font-mono leading-relaxed">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        // Split regular text by lines
        const lines = block.split('\n');
        const renderedLines: React.ReactNode[] = [];
        let i = 0;

        while (i < lines.length) {
          const line = lines[i];
          const trimmed = line.trim();

          if (!trimmed) {
            renderedLines.push(<div key={`empty-${i}`} className="h-2" />);
            i++;
            continue;
          }

          // Header 3
          if (trimmed.startsWith('###')) {
            renderedLines.push(
              <h3
                key={`h3-${i}`}
                className="text-base md:text-lg font-bold text-slate-900 dark:text-slate-100 mt-4 mb-2 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1"
              >
                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>{renderFormattedText(trimmed.replace(/^###\s*/, ''))}</span>
              </h3>
            );
            i++;
            continue;
          }

          // Header 2
          if (trimmed.startsWith('##')) {
            renderedLines.push(
              <h2
                key={`h2-${i}`}
                className="text-lg md:text-xl font-bold text-indigo-950 dark:text-indigo-200 mt-5 mb-2.5 flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>{renderFormattedText(trimmed.replace(/^##\s*/, ''))}</span>
              </h2>
            );
            i++;
            continue;
          }

          // Header 1
          if (trimmed.startsWith('#')) {
            renderedLines.push(
              <h1
                key={`h1-${i}`}
                className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white mt-6 mb-3"
              >
                {renderFormattedText(trimmed.replace(/^#\s*/, ''))}
              </h1>
            );
            i++;
            continue;
          }

          // Highlight / Pro Tip Box
          if (
            trimmed.includes('💡') ||
            trimmed.toLowerCase().startsWith('**pro tip') ||
            trimmed.toLowerCase().startsWith('**exam tip') ||
            trimmed.toLowerCase().startsWith('**tip')
          ) {
            renderedLines.push(
              <div
                key={`tip-${i}`}
                className="my-3 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-2.5 shadow-xs"
              >
                <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1 text-sm font-medium leading-relaxed">
                  {renderFormattedText(trimmed.replace(/^💡\s*/, ''))}
                </div>
              </div>
            );
            i++;
            continue;
          }

          // Final Answer Highlight Box
          if (
            trimmed.toLowerCase().includes('final answer') ||
            trimmed.toLowerCase().startsWith('**final answer') ||
            trimmed.toLowerCase().startsWith('**answer') ||
            trimmed.includes('उत्तर:')
          ) {
            renderedLines.push(
              <div
                key={`ans-${i}`}
                className="my-3 p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border-2 border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100 flex items-start gap-2.5 shadow-xs"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  ✓
                </div>
                <div className="flex-1 font-semibold text-sm md:text-base leading-relaxed">
                  {renderFormattedText(trimmed)}
                </div>
              </div>
            );
            i++;
            continue;
          }

          // Step item (e.g. "Step 1:", "Step 2:", or "1. **Step")
          const stepMatch = trimmed.match(/^(?:Step\s*(\d+)[:.]|(\d+)\.\s*\*\*(?:Step|चरण)\s*(\d+)?)/i);
          if (stepMatch) {
            const stepNum = stepMatch[1] || stepMatch[2] || stepMatch[3] || '•';
            renderedLines.push(
              <div
                key={`step-${i}`}
                className="my-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  {stepNum}
                </div>
                <div className="flex-1 leading-relaxed text-slate-800 dark:text-slate-200">
                  {renderFormattedText(trimmed)}
                </div>
              </div>
            );
            i++;
            continue;
          }

          // Numbered list
          if (/^\d+\.\s/.test(trimmed)) {
            const num = trimmed.match(/^(\d+)\./)?.[1] || '1';
            renderedLines.push(
              <div key={`num-${i}`} className="flex items-start gap-2.5 my-1.5 pl-1">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400 min-w-[1.25rem] text-sm shrink-0">
                  {num}.
                </span>
                <div className="flex-1 leading-relaxed">{renderFormattedText(trimmed.replace(/^\d+\.\s*/, ''))}</div>
              </div>
            );
            i++;
            continue;
          }

          // Bullet item
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            renderedLines.push(
              <div key={`bullet-${i}`} className="flex items-start gap-2.5 my-1 pl-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 mt-2 shrink-0" />
                <div className="flex-1 leading-relaxed">{renderFormattedText(trimmed.replace(/^[-*]\s*/, ''))}</div>
              </div>
            );
            i++;
            continue;
          }

          // Regular paragraph line
          renderedLines.push(
            <p key={`p-${i}`} className="my-1.5 leading-relaxed text-slate-800 dark:text-slate-200">
              {renderFormattedText(line)}
            </p>
          );
          i++;
        }

        return <div key={bIdx}>{renderedLines}</div>;
      })}
    </div>
  );
};
