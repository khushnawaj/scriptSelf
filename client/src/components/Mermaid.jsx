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
                ref.current.innerHTML = `
                    <div class="flex flex-col items-center justify-center gap-2 py-10 opacity-50">
                        <div class="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                        <div class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Synthesizing Logic_</div>
                    </div>
                `;
            }

            try {
                const { svg } = await mermaid.render(id, chart);
                if (isMounted && ref.current) {
                    ref.current.innerHTML = svg;
                }
            } catch (error) {
                console.error('Mermaid render error:', error);

                // Detection for specific common errors
                const isAtLayerError = chart.includes('@layer') && !chart.includes('"@layer"');
                const suggestion = isAtLayerError
                    ? 'TIP: Wrap labels containing "@" or spaces in double quotes, e.g., ["@layer Directives"]'
                    : 'Check for missing connectors (-->) or unclosed brackets.';

                if (isMounted && ref.current) {
                    ref.current.innerHTML = `
                        <div class="w-full max-w-2xl mx-auto overflow-hidden rounded-[4px] border border-rose-500/30 bg-black/40 backdrop-blur-md shadow-2xl animate-in zoom-in-95 duration-300">
                            <!-- Header Bar -->
                            <div class="px-4 py-2 border-b border-rose-500/20 bg-rose-500/10 flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                    <div class="flex gap-1.5 mr-2">
                                        <div class="w-2.5 h-2.5 rounded-full bg-rose-500/50"></div>
                                        <div class="w-2.5 h-2.5 rounded-full bg-rose-500/20"></div>
                                        <div class="w-2.5 h-2.5 rounded-full bg-rose-500/20"></div>
                                    </div>
                                    <span class="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">System_Failure_Detected (x00)</span>
                                </div>
                                <span class="bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded font-black tracking-widest">PARSE_ERR</span>
                            </div>

                            <!-- Body Content -->
                            <div class="p-6 space-y-4">
                                <div class="space-y-1">
                                    <p class="text-rose-400 font-bold text-[14px]">Diagram Parsing Engine Failed</p>
                                    <p class="text-[12px] text-muted-foreground/80 leading-relaxed font-mono italic">
                                        "${suggestion}"
                                    </p>
                                </div>

                                <div class="bg-black/40 border border-white/5 p-4 rounded text-left font-mono text-[11px] text-rose-300/80 overflow-x-auto max-h-[150px] custom-scrollbar">
                                    <span class="text-rose-500/50 mr-2 opacity-50 select-none">DEBUG:</span>
                                    ${error.message || error}
                                </div>

                                <div class="flex items-center gap-4 pt-2">
                                    <button 
                                        onclick="navigator.clipboard.writeText('${(error.message || error).replace(/'/g, "\\'")}')"
                                        class="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded border border-rose-500/20 hover:bg-rose-500/10 transition-all text-rose-500"
                                    >
                                        Copy Debug Trace
                                    </button>
                                </div>
                            </div>
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
