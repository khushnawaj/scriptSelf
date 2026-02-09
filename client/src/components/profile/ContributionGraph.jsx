import { useMemo } from "react";
import { Activity } from "lucide-react";

const ContributionGraph = ({ logs = [] }) => {
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

    const getColor = (c) => {
        if (c === 0) return "bg-muted/30 border border-border/50";
        if (c < 2) return "bg-primary/20";
        if (c < 5) return "bg-primary/40";
        if (c < 8) return "bg-primary/60";
        return "bg-primary";
    };

    return (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Activity size={16} className="text-primary" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recent Activity</h3>
                </div>
                <span className="text-[10px] font-medium text-muted-foreground/60">{logs.length > 0 ? `${logs.length} entries tracked` : 'No recent activity'}</span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2">
                <div className="flex-1 grid gap-[4px]" style={{ gridTemplateColumns: `repeat(${weeks.length}, 1fr)` }}>
                    {weeks.map((week, wi) =>
                        week.map((day, di) => (
                            <div
                                key={`${wi}-${di}`}
                                title={`${day.date}: ${day.count} records`}
                                className={`
                                    ${getColor(day.count)}
                                    aspect-square
                                    rounded-[1px]
                                    cursor-default
                                    transition-colors
                                    min-w-[10px]
                                `}
                            />
                        ))
                    )}
                </div>
            </div>

            <div className="flex justify-between items-center text-[10px] font-medium text-muted-foreground/40">
                <span>(T-168d)</span>
                <div className="flex gap-1 items-center">
                    <span className="mr-1">Less</span>
                    <div className="w-2.5 h-2.5 rounded-[1px] bg-muted/30 border border-border/50" />
                    <div className="w-2.5 h-2.5 rounded-[1px] bg-primary/20" />
                    <div className="w-2.5 h-2.5 rounded-[1px] bg-primary/60" />
                    <div className="w-2.5 h-2.5 rounded-[1px] bg-primary" />
                    <span className="ml-1">More</span>
                </div>
                <span>Today</span>
            </div>
        </div>
    );
};

export default ContributionGraph;
