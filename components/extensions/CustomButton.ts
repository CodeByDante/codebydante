import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { CustomButtonComponent } from '../CustomButtonComponent';

export interface CustomButtonOptions {
    HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        customButton: {
            setCustomButton: (options: { text: string; url: string; variant: 'visit' | 'download' } & Record<string, any>) => ReturnType;
        };
    }
}

export const CustomButton = Node.create<CustomButtonOptions>({
    name: 'customButton',

    group: 'inline',

    inline: true,

    atom: true,

    addAttributes() {
        return {
            text: {
                default: 'Button',
            },
            url: {
                default: '#',
            },
            variant: {
                default: 'visit',
            },
            backgroundColor: {
                default: null,
            },
            textColor: {
                default: null,
            },
            borderRadius: {
                default: null,
            },
            width: {
                default: null,
            },
            height: {
                default: null,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'a[data-type="custom-button"]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['a', mergeAttributes(HTMLAttributes, { 'data-type': 'custom-button' })];
    },

    addNodeView() {
        return ReactNodeViewRenderer(CustomButtonComponent);
    },

    addCommands() {
        return {
            setCustomButton:
                (options) =>
                    ({ commands }) => {
                        return commands.insertContent({
                            type: this.name,
                            attrs: options,
                        });
                    },
        };
    },
});
