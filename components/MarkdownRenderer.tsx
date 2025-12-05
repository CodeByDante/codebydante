import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { Copy, Check, Edit2 } from 'lucide-react';
import { subscribeToStyleConfig } from '../services/codeStyleService';
import { CopyButton } from './CopyButton';
import { CustomBlockquote } from './CustomBlockquote';

interface MarkdownRendererProps {
  content: string;
  onBlockDoubleClick?: (type: 'code' | 'quote', index: number) => void;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, onBlockDoubleClick }) => {
  const [showCopyButton, setShowCopyButton] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = subscribeToStyleConfig((config) => {
      setShowCopyButton(config.showCopyButton);
    });
    return () => unsubscribe();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBlockDoubleClick = (e: React.MouseEvent, type: 'code' | 'quote') => {
    if (!onBlockDoubleClick || !containerRef.current) return;

    e.stopPropagation(); // Prevent bubbling

    const wrapper = e.currentTarget as HTMLElement;
    const selector = type === 'quote' ? 'blockquote' : 'pre';
    const block = wrapper.querySelector(selector);

    if (!block) return;

    const allBlocks = Array.from(containerRef.current.querySelectorAll(selector));
    const index = allBlocks.indexOf(block as any);

    if (index !== -1) {
      onBlockDoubleClick(type, index);
    }
  };

  return (
    <div ref={containerRef} className="markdown-content relative group">
      {showCopyButton && (
        <button
          onClick={handleCopy}
          className="absolute -top-2 -right-2 p-2 bg-surface border border-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-background z-10"
          title="Copiar contenido"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      )}
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold text-white mb-4 pb-2 border-b border-white/10">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-bold text-white mb-3 pb-2 border-b border-white/10 mt-6">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-bold text-white mb-2 mt-4">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-semibold text-white mb-2 mt-3">
              {children}
            </h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-base font-semibold text-white mb-2 mt-3">
              {children}
            </h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-sm font-semibold text-gray-300 mb-2 mt-3">
              {children}
            </h6>
          ),
          p: ({ children }) => (
            <p className="text-gray-300 mb-4 leading-relaxed">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside text-gray-300 mb-4 space-y-1 ml-4">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside text-gray-300 mb-4 space-y-1 ml-4">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-gray-300">
              {children}
            </li>
          ),
          blockquote: ({ children, ...props }) => (
            <div
              onDoubleClick={(e) => handleBlockDoubleClick(e, 'quote')}
            >
              <CustomBlockquote isEditable={!!onBlockDoubleClick} {...props}>{children}</CustomBlockquote>
            </div>
          ),
          code: ({ inline, children, className, style, ...props }: any) => {
            const codeString = String(children).replace(/\n$/, '');

            if (inline) {
              return (
                <code className={className} style={style} {...props}>
                  {children}
                </code>
              );
            }

            return (
              <code className="text-gray-300 font-mono text-sm leading-relaxed">
                {codeString.split('\n').map((line, i) => {
                  const highlighted = line
                    .replace(/(\b(?:const|let|var|function|return|if|else|for|while|class|import|export|from|default|async|await|try|catch|throw|new)\b)/g, '<span class="text-[#569cd6]">$1</span>')
                    .replace(/(['"`].*?['"`])/g, '<span class="text-[#ce9178]">$1</span>')
                    .replace(/(\b\d+\b)/g, '<span class="text-[#b5cea8]">$1</span>')
                    .replace(/(\/\/.*$)/g, '<span class="text-[#6a9955]">$1</span>')
                    .replace(/([{}()[\];,.])/g, '<span class="text-gray-400">$1</span>');

                  return (
                    <div key={i} className="leading-6" dangerouslySetInnerHTML={{ __html: highlighted || ' ' }} />
                  );
                })}
              </code>
            );
          },
          pre: ({ children, ...props }: any) => {
            // Extract text content from the code block for the copy button
            let codeText = '';
            const childProps = (children as any)?.props;
            if (React.isValidElement(children) && childProps && childProps.children) {
              codeText = String(childProps.children);
            }

            const showCopy = props['data-show-copy'] === 'true' || (props['data-show-copy'] === undefined && showCopyButton);

            return (
              <div
                className="relative group mb-4"
                onDoubleClick={(e) => handleBlockDoubleClick(e, 'code')}
              >
                <pre className="overflow-x-auto bg-[#1a1a1a] border border-white/10 rounded-lg p-4" {...props}>
                  {children}
                </pre>
                <div className={`absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity`}>
                  {showCopy && <CopyButton text={codeText} className="" />}
                </div>
              </div>
            );
          },
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {children}
            </a>
          ),
          hr: () => (
            <hr className="border-white/10 my-6" />
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border border-white/10 rounded-lg overflow-hidden">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-white/5">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-white/10">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr>
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 text-left text-white font-semibold border border-white/10">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-gray-300 border border-white/10">
              {children}
            </td>
          ),
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt}
              className="max-w-full h-auto rounded-lg my-4 border border-white/10"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};