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
        let isMounted = true;

        const renderDiagram = async () => {
            if (!ref.current || !chart) return;

            const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

            // Clean up previous content and show loading state
            if (ref.current) {
                ref.current.innerHTML = '<div class="animate-pulse text-muted-foreground text-[12px]">Generating diagram...</div>';
            }

            try {
                const { svg } = await mermaid.render(id, chart);
                if (isMounted && ref.current) {
                    ref.current.innerHTML = svg;
                }
            } catch (error) {
                console.error('Mermaid render error:', error);
                if (isMounted && ref.current) {
                    ref.current.innerHTML = `
                        <div class="text-rose-500 p-6 bg-rose-500/10 border border-rose-500/20 rounded-[3px] w-full">
                            <h4 class="font-bold text-sm mb-2 flex items-center gap-2">
                                <span class="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded">SYNTAX_ERROR</span>
                                Diagram Parse Failed
                            </h4>
                            <p class="text-[12px] opacity-80 leading-relaxed mb-4">
                                The diagram syntax contains invalid tokens that Mermaid cannot process.
                            </p>
                            <details class="text-[10px] cursor-pointer">
                                <summary class="font-bold uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity">Show Error Details</summary>
                                <pre class="mt-2 p-3 bg-black/20 rounded overflow-x-auto whitespace-pre-wrap font-mono">${error.message || error}</pre>
                            </details>
                        </div>
                    `;
                }
            }
        };

        renderDiagram();

        return () => {
            isMounted = false;
        };
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
