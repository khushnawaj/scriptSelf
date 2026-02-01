import { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import Spinner from '../components/Spinner';
import { FileText, Folder, Plus, TrendingUp, Pin, Clock } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getNotes, getNoteStats } from '../features/notes/noteSlice';
import { getCategories } from '../features/categories/categorySlice';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Dashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { notes, stats, isLoading: notesLoading } = useSelector((state) => state.notes);
    const { categories, isLoading: catsLoading } = useSelector((state) => state.categories);

    const [barChartData, setBarChartData] = useState(null);
    const [lineChartData, setLineChartData] = useState(null);

    useEffect(() => {
        dispatch(getNotes());
        dispatch(getCategories());
        dispatch(getNoteStats());
    }, [dispatch]);

    useEffect(() => {
        if (stats) {
            // Process Category Stats for Bar Chart
            const labels = stats.categoryStats.map(s => s._id || 'Uncategorized');
            const data = stats.categoryStats.map(s => s.count);

            setBarChartData({
                labels,
                datasets: [{
                    label: 'Notes',
                    data,
                    backgroundColor: 'rgba(0, 128, 128, 0.6)',
                    borderColor: '#008080',
                    borderWidth: 1,
                    borderRadius: 5
                }]
            });

            // Process Time Series for Multi-dataset Line Chart
            // Group by type
            const types = [...new Set(stats.timeSeries.map(item => item._id.type))];
            const dates = [...new Set(stats.timeSeries.map(item => item._id.date))].sort();

            const datasets = types.map((type, idx) => {
                const colors = ['#008080', '#800000', '#f59e0b', '#3b82f6'];
                const color = colors[idx % colors.length];

                return {
                    label: type.charAt(0).toUpperCase() + type.slice(1),
                    data: dates.map(date => {
                        const match = stats.timeSeries.find(item => item._id.date === date && item._id.type === type);
                        return match ? match.count : 0;
                    }),
                    borderColor: color,
                    backgroundColor: color + '20',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6
                };
            });

            setLineChartData({
                labels: dates.map(d => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
                datasets
            });
        }
    }, [stats]);

    if (notesLoading || catsLoading) return (
        <div className="mt-10">
            <Spinner message="Retrieving your notes..." />
        </div>
    );

    const pinnedNotes = notes.filter(n => n.isPinned).slice(0, 3);
    const recentNotes = notes.slice(0, 5);

    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-card to-muted/30 p-8 rounded-3xl border border-border shadow-sm">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                        Welcome back, <span className="text-primary">{user?.username}</span>! 👋
                    </h1>
                    <p className="text-muted-foreground font-medium">You have {notes.length} saved scripts in your library.</p>
                </div>
                <Link
                    to="/notes/new"
                    className="btn-premium-primary self-start md:self-auto shadow-xl shadow-primary/20"
                >
                    <Plus size={20} /> Create New Script
                </Link>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Scripts', value: notes.length, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Categories', value: categories.length, icon: FolderOpen, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                    { label: 'Pinned Notes', value: notes.filter(n => n.isPinned).length, icon: Tag, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                    { label: 'Public Notes', value: notes.filter(n => n.isPublic).length, icon: Globe, color: 'text-green-500', bg: 'bg-green-500/10' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-card border border-border p-6 rounded-2xl hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group">
                        <div className="flex items-center gap-4">
                            <div className={clsx("p-3 rounded-xl transition-colors group-hover:scale-110 duration-300", stat.bg, stat.color)}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">{stat.label}</p>
                                <h3 className="text-2xl font-black mt-1 group-hover:text-primary transition-colors">{stat.value}</h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Viz Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Line Chart (Multi-dataset) */}
                <div className="xl:col-span-2 bg-card/40 backdrop-blur-xl border border-border p-6 rounded-3xl shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Clock size={18} className="text-primary" />
                            <h3 className="text-lg font-bold">Activity Feed (Last 14 Days)</h3>
                        </div>
                    </div>
                    {lineChartData ? (
                        <div className="h-[350px]">
                            <Line
                                data={lineChartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { position: 'top', labels: { usePointStyle: true, font: { weight: 'bold' } } } },
                                    scales: {
                                        y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
                                        x: { grid: { display: false } }
                                    }
                                }}
                            />
                        </div>
                    ) : <div className="h-[350px] flex items-center justify-center text-muted-foreground">Generating activity map...</div>}
                </div>

                {/* Distribution (Bar Chart) */}
                <div className="bg-card/40 backdrop-blur-xl border border-border p-6 rounded-3xl shadow-sm">
                    <h3 className="text-lg font-bold mb-6">Library Spread</h3>
                    {barChartData ? (
                        <div className="h-[350px]">
                            <Bar
                                data={barChartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: {
                                        y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
                                        x: { grid: { display: false } }
                                    }
                                }}
                            />
                        </div>
                    ) : <div className="h-[350px] flex items-center justify-center text-muted-foreground">Calculating spread...</div>}
                </div>
            </div>

            {/* Bottom Grid: Pinned & Recent */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pinned Items */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Pin size={18} className="text-amber-500" />
                        <h3 className="text-xl font-bold">Priority Items</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {pinnedNotes.length > 0 ? pinnedNotes.map(n => (
                            <Link to={`/notes/${n._id}`} key={n._id} className="bg-muted/30 border border-border p-4 rounded-2xl hover:bg-muted/50 transition-all group">
                                <h4 className="font-bold text-foreground group-hover:text-primary transition-colors truncate">{n.title}</h4>
                                <div className="flex items-center gap-2 mt-3">
                                    <span className="text-[10px] uppercase font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full">{n.category?.name}</span>
                                </div>
                            </Link>
                        )) : <p className="text-sm text-muted-foreground py-4">No pinned items found.</p>}
                    </div>
                </section>

                {/* Recent Feed */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={18} className="text-emerald-500" />
                        <h3 className="text-xl font-bold">Recent Changes</h3>
                    </div>
                    <div className="space-y-3">
                        {recentNotes.length > 0 ? recentNotes.map(n => (
                            <Link to={`/notes/${n._id}`} key={n._id} className="flex items-center justify-between p-4 bg-muted/20 border border-border rounded-2xl hover:border-primary/50 transition-all">
                                <span className="font-medium text-sm">{n.title}</span>
                                <span className="text-[10px] text-muted-foreground">{new Date(n.createdAt).toLocaleDateString()}</span>
                            </Link>
                        )) : <p className="text-sm text-muted-foreground py-4">No recent activity.</p>}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Dashboard;
