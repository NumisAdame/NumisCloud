'use client';

import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

interface ForumMarkdownProps {
  content: string;
  className?: string;
}

export function ForumMarkdown({ content, className = '' }: ForumMarkdownProps) {
  return (
    <div className={`forum-markdown ${className}`}>
      <ReactMarkdown
        rehypePlugins={[rehypeRaw]}
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          strong: ({ children }) => <strong className="font-bold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          u: ({ children }) => <u className="underline">{children}</u>,
          ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-0.5 ml-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-0.5 ml-2">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          h1: ({ children }) => <h3 className="font-bold text-base mt-3 mb-1">{children}</h3>,
          h2: ({ children }) => <h3 className="font-bold text-base mt-3 mb-1">{children}</h3>,
          h3: ({ children }) => <h4 className="font-semibold mt-2 mb-1">{children}</h4>,
          blockquote: ({ children }) => <blockquote className="border-l-2 border-gold/40 pl-3 italic text-muted-foreground my-2">{children}</blockquote>,
          hr: () => <hr className="my-3 border-border" />,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-gold underline hover:text-gold-dark">
              {children}
            </a>
          ),
          img: ({ src, alt }) => (
            <span className="block my-2">
              <img src={src} alt={alt ?? ''} className="max-w-full rounded-lg max-h-[400px] object-contain" />
            </span>
          ),
          code: ({ children }) => <code className="bg-muted rounded px-1 py-0.5 text-xs font-mono">{children}</code>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
