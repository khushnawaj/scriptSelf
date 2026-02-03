import { useEffect } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
    startOnLoad: true,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: 'Fira Code, monospace',
});

const Mermaid = ({ chart }) => {
    useEffect(() => {
        mermaid.contentLoaded();
    }, [chart]);

    return (
        <div className="mermaid bg-slate-900/50 p-6 my-4 rounded-[3px] border border-border flex justify-center overflow-x-auto">
            {chart}
        </div>
    );
};

export default Mermaid;
