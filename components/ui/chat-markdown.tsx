'use client';

import ReactMarkdown from 'react-markdown';

interface ChatMarkdownProps {
  content: string;
}

export function ChatMarkdown({ content }: ChatMarkdownProps) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        strong: ({ children }) => <strong className="font-bold">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-0.5">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-0.5">{children}</ol>,
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        h1: ({ children }) => <h3 className="font-bold text-base mt-3 mb-1">{children}</h3>,
        h2: ({ children }) => <h3 className="font-bold text-base mt-3 mb-1">{children}</h3>,
        h3: ({ children }) => <h4 className="font-semibold mt-2 mb-1">{children}</h4>,
        code: ({ children }) => <code className="bg-black/10 dark:bg-white/10 rounded px-1 py-0.5 text-xs font-mono">{children}</code>,
        blockquote: ({ children }) => <blockquote className="border-l-2 border-gold/40 pl-3 italic text-muted-foreground my-2">{children}</blockquote>,
        hr: () => <hr className="my-3 border-border" />,
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-gold underline hover:text-gold-dark">
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
