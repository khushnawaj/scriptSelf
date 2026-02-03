import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: 'Fira Code, monospace',
    themeVariables: {
        primaryColor: '#6366f1',
        edgeLabelBackground: '#1e293b',
        tertiaryColor: '#1e293b'
    }
});

const Mermaid = ({ chart }) => {
    const ref = useRef(null);

    useEffect(() => {
        if (ref.current && chart) {
            // Generating a unique ID for each diagram
            const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

            // Clean up previous content
            ref.current.innerHTML = '';
            const container = document.createElement('div');
            container.id = id;
            ref.current.appendChild(container);

            try {
                mermaid.render(id, chart).then(({ svg }) => {
                    if (ref.current) {
                        ref.current.innerHTML = svg;
                    }
                });
            } catch (error) {
                console.error('Mermaid render error:', error);
                if (ref.current) {
                    ref.current.innerHTML = `<pre class="text-rose-500 p-4 bg-rose-500/10 border border-rose-500/20 rounded">Failed to render diagram: ${error.message}</pre>`;
                }
            }
        }
    }, [chart]);

    return (
        <div
            ref={ref}
            className="mermaid-container bg-slate-900/50 p-6 my-8 rounded-[3px] border border-border flex justify-center overflow-x-auto shadow-inner"
        >
            <div className="animate-pulse text-muted-foreground text-[12px]">Generating diagram...</div>
        </div>
    );
};

export default Mermaid;
