import { useMemo } from "react";

const ContributionGraph = ({ logs = [] }) => {

    /* ========================
       Build data
    ======================== */
    const weeks = useMemo(() => {
        const map = new Map(logs.map(l => [l.date, l.count]));

        const today = new Date();
        const days = [];

        for (let i = 167; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);

            const date = d.toISOString().split("T")[0];

            days.push({
                date,
                count: map.get(date) || 0
            });
        }

        const result = [];
        for (let i = 0; i < days.length; i += 7) {
            result.push(days.slice(i, i + 7));
        }

        return result;
    }, [logs]);


    const level = (c) => {
        if (c === 0) return "bg-muted/25";
        if (c < 2) return "bg-primary/30";
        if (c < 5) return "bg-primary/50";
        if (c < 8) return "bg-primary/70";
        return "bg-primary";
    };


    return (
        <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary/80 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    Your Activity
                </h3>
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40">System_Uptime: 24W</span>
            </div>

            {/* =========================
               NO SCROLL GRID
            ========================= */}

            <div
                className="grid gap-[4px]"
                style={{
                    gridTemplateColumns: `repeat(${weeks.length}, 1fr)`
                }}
            >
                {weeks.map((week, wi) =>
                    week.map((day, di) => (
                        <div
                            key={`${wi}-${di}`}
                            title={`${day.date} • ${day.count} nodes`}
                            className={`
                                ${level(day.count)}
                                aspect-square
                                rounded-[2px]
                                hover:scale-125
                                hover:z-10
                                cursor-crosshair
                                transition-all
                                duration-300
                            `}
                        />
                    ))
                )}
            </div>

            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40">
                <span>Init_Sequence [T-168D]</span>
                <div className="flex gap-1.5 items-center">
                    <div className="w-2 h-2 rounded-[1px] bg-muted/25" />
                    <div className="w-2 h-2 rounded-[1px] bg-primary/30" />
                    <div className="w-2 h-2 rounded-[1px] bg-primary/70" />
                    <div className="w-2 h-2 rounded-[1px] bg-primary" />
                </div>
                <span>Sync_Complete [Today]</span>
            </div>
        </div>
    );
};

export default ContributionGraph;
