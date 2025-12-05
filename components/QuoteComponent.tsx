import React, { useState, useRef, useEffect } from 'react';
import { NodeViewWrapper, NodeViewContent, NodeViewProps } from '@tiptap/react';
import { Copy, Check, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { DownloadButton } from './DownloadButton';

export const QuoteComponent: React.FC<NodeViewProps> = (props) => {
    const [copied, setCopied] = useState(false);
    const [isManualExpanded, setIsManualExpanded] = useState(false);
    const { node } = props;
    const { attrs } = node;
    const contentRef = useRef<HTMLDivElement>(null);
    const [contentHeight, setContentHeight] = useState<string | number>('4.5em');

    useEffect(() => {
        if (contentRef.current) {
            setContentHeight(contentRef.current.scrollHeight);
        }
    }, [node.textContent, isManualExpanded]);

    const toggleExpand = () => {
        setIsManualExpanded(!isManualExpanded);
    };

    const handleCopy = () => {
        const text = node.textContent;
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleDownload = () => {
        const text = node.textContent;
        const element = document.createElement("a");
        const file = new Blob([text], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = 'cita.txt';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    // Construct dynamic styles from attributes
    const dynamicStyles: React.CSSProperties = {
        borderLeftColor: attrs.borderColor || 'gray',
        borderLeftWidth: attrs.borderWidth || '4px',
        backgroundColor: attrs.backgroundColor || 'transparent',
        color: attrs.textColor || 'inherit',
        padding: attrs.padding || '4px',
        fontSize: attrs.fontSize || 'inherit',
        borderRadius: attrs.borderRadius || '0px',
        width: attrs.width || '100%',
        minHeight: attrs.height || 'auto',
        fontFamily: attrs.isCodeFont ? 'monospace' : (attrs.fontFamily || 'inherit'),
        fontStyle: attrs.italic ? 'italic' : 'normal',
        borderLeftStyle: 'solid', // Ensure border style is solid
        wordBreak: 'break-word',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative', // Ensure relative positioning for absolute children
        lineHeight: '1.5', // Enforce consistent line height
    };

    const handleClick = (e: React.MouseEvent) => {
        if (e.detail === 3 && props.editor.isEditable) {
            e.preventDefault();
            const event = new CustomEvent('block-triple-click', {
                detail: { type: 'quote', pos: props.getPos() },
                bubbles: true
            });
            props.editor.view.dom.dispatchEvent(event);
        }
    };

    const isEditing = props.editor.isEditable;
    const isCollapsed = attrs.collapsible && !isManualExpanded && !isEditing;

    return (
        <NodeViewWrapper
            style={dynamicStyles}
            className="group my-4 rounded-sm transition-all [&_p]:m-0"
            onClick={handleClick}
        >
            {(attrs.showCopyButton || attrs.showDownloadButton) && (
                <div className="absolute top-2 right-2 z-10 flex gap-2">
                    {attrs.showCopyButton && (
                        <button
                            onClick={handleCopy}
                            contentEditable={false} // Important: prevent editor focus issues
                            className="p-1 bg-zinc-800/50 rounded text-zinc-300 hover:text-white transition-all backdrop-blur-sm"
                            title="Copiar texto"
                        >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                    )}
                    {attrs.showDownloadButton && (
                        <button
                            onClick={handleDownload}
                            contentEditable={false}
                            className="p-1 bg-zinc-800/50 rounded text-zinc-300 hover:text-white transition-all backdrop-blur-sm"
                            title="Descargar"
                        >
                            <Download size={14} />
                        </button>
                    )}
                </div>
            )}

            {/* --- Contenedor de Contenido con Lógica de Colapsado --- */}
            <div
                ref={contentRef}
                style={{
                    // Si está colapsado, forzamos una altura máxima (aprox 3 líneas)
                    maxHeight: isCollapsed ? '4.5em' : (isEditing ? 'none' : `${contentHeight}px`),
                    overflow: 'hidden',
                    position: 'relative',
                    transition: 'max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1)', // Smooth slide animation
                    // Opcional: Un pequeño gradiente para suavizar el corte si está colapsado
                    maskImage: isCollapsed ? 'linear-gradient(to bottom, black 60%, transparent 100%)' : 'none',
                    WebkitMaskImage: isCollapsed ? 'linear-gradient(to bottom, black 60%, transparent 100%)' : 'none'
                }}
            >
                <NodeViewContent />
            </div>

            {/* --- Botón de Leer Más (Solo Icono) --- */}
            {attrs.collapsible && (
                <div className="mt-1 flex justify-end">
                    <button
                        onClick={toggleExpand}
                        contentEditable={false} // ¡CRUCIAL PARA QUE FUNCIONE EL CLIC!
                        className="text-zinc-400 hover:text-white transition-colors cursor-pointer select-none p-1"
                        title={isManualExpanded ? "Contraer" : "Expandir"}
                    >
                        {isManualExpanded ? (
                            <ChevronUp size={16} />
                        ) : (
                            <ChevronDown size={16} />
                        )}
                    </button>
                </div>
            )}
        </NodeViewWrapper>
    );
};
