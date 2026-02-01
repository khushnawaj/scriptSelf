import { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const RichTextEditor = ({ value, onChange, placeholder }) => {
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'code-block'],
            ['clean']
        ],
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'code-block'
    ];

    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/50 text-foreground">
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                className="h-[300px] flex flex-col"
            />
            {/* ReactQuill creates its own structure, CSS override might be needed specifically for dark mode text color */}
            <style>{`
            .ql-toolbar.ql-snow {
                border: none;
                border-bottom: 1px solid var(--border);
            }
            .ql-container.ql-snow {
                border: none;
                font-family: inherit;
                font-size: 14px;
            }
            .ql-editor {
                min-height: 200px;
                color: var(--foreground);
            }
            .ql-stroke {
                stroke: var(--muted-foreground) !important;
            }
            .ql-fill {
                fill: var(--muted-foreground) !important;
            }
            .ql-picker {
                color: var(--muted-foreground) !important;
            }
        `}</style>
        </div>
    );
};

export default RichTextEditor;
