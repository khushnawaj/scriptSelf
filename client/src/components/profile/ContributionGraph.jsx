import { useMemo } from 'react';

const ContributionGraph = ({ logs = [], createdAt }) => {
    // Generate last 365 days
    const dailyData = useMemo(() => {
        const days = [];
        const today = new Date();
        for (let i = 364; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const log = logs.find(l => l.date === dateStr);
            days.push({
                date: dateStr,
                count: log ? log.count : 0
            });
        }
        return days;
    }, [logs]);

    const getColor = (count) => {
        if (count === 0) return 'bg-muted/30';
        if (count < 2) return 'bg-primary/30';
        if (count < 5) return 'bg-primary/60';
        if (count < 8) return 'bg-primary/80';
        return 'bg-primary';
    };

    // Group into weeks for the grid
    const weeks = [];
    for (let i = 0; i < dailyData.length; i += 7) {
        weeks.push(dailyData.slice(i, i + 7));
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-bold text-foreground uppercase tracking-wider">Logic Evolution Matrix</h3>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-bold">
                    <span>Less</span>
                    <div className="flex gap-1">
                        <div className="w-2.5 h-2.5 rounded-[1px] bg-muted/30" />
                        <div className="w-2.5 h-2.5 rounded-[1px] bg-primary/30" />
                        <div className="w-2.5 h-2.5 rounded-[1px] bg-primary/60" />
                        <div className="w-2.5 h-2.5 rounded-[1px] bg-primary/80" />
                        <div className="w-2.5 h-2.5 rounded-[1px] bg-primary" />
                    </div>
                    <span>More</span>
                </div>
            </div>

            <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
                {weeks.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-1">
                        {week.map((day, di) => (
                            <div
                                key={di}
                                title={`${day.date}: ${day.count} activities`}
                                className={`w-[11px] h-[11px] rounded-[1px] transition-colors duration-500 hover:scale-125 hover:z-10 cursor-pointer ${getColor(day.count)}`}
                            />
                        ))}
                    </div>
                ))}
            </div>

            <div className="flex justify-between text-[11px] text-muted-foreground font-medium pr-2">
                <span>12 months ago</span>
                <span>Today</span>
            </div>
        </div>
    );
};

export default ContributionGraph;
