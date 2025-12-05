import { CodeBlock } from '@tiptap/extension-code-block';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { CodeBlockComponent } from '../CodeBlockComponent';

export const CustomCodeBlock = CodeBlock.extend({
    addNodeView() {
        return ReactNodeViewRenderer(CodeBlockComponent);
    },
    addAttributes() {
        return {
            language: {
                default: null,
            },
            filename: {
                default: null,
            },
            collapsible: {
                default: true,
                parseHTML: (element) => element.getAttribute('data-collapsible') !== 'false',
                renderHTML: (attributes) => {
                    return {
                        'data-collapsible': attributes.collapsible,
                    };
                },
            }
        };
    },
    content: 'text*',
    marks: '_',
});
