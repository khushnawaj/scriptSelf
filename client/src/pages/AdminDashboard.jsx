import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import Spinner from '../components/Spinner';
import {
    Users,
    Activity,
    FileText,
    Shield,
    Trash2,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Search,
    Database,
    Pin,
    MessageSquare,
    TrendingUp,
    Clock,
    Eye,
    UserCheck,
    UserX,
    Ban,
    Mail,
    Calendar,
    BarChart3,
    Download,
    RefreshCw
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const { theme } = useTheme();

    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        averageReputation: 0,
        activeToday: 0,
        totalNotes: 0,
        totalIssues: 0,
        totalMessages: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [notes, setNotes] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [activityLogs, setActivityLogs] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            toast.error('Unauthorized Access');
            navigate('/dashboard');
            return;
        }
        fetchData();
    }, [user, navigate]);

    const fetchData = useCallback(async () => {
        try {
            const [usersRes, notesRes] = await Promise.all([
                api.get('/users'),
                api.get('/notes/admin/all')
            ]);

            setUsers(usersRes.data.data);
            setNotes(notesRes.data.data);

            // Calculate comprehensive stats
            const totalRep = usersRes.data.data.reduce((acc, u) => acc + (u.reputation || 0), 0);
            const issuesCount = notesRes.data.data.filter(n => n.type === 'issue').length;

            setStats({
                totalUsers: usersRes.data.count,
                totalNotes: notesRes.data.data.length,
                totalIssues: issuesCount,
                averageReputation: Math.floor(totalRep / usersRes.data.count) || 0,
                activeToday: Math.floor(usersRes.data.count * 0.2),
                totalMessages: 0 // Can be fetched from chat API
            });

            // Mock activity logs (can be fetched from backend)
            setActivityLogs([
                { id: 1, user: 'System', action: 'Database backup completed', time: new Date().toISOString(), type: 'success' },
                { id: 2, user: user.username, action: 'Admin dashboard accessed', time: new Date().toISOString(), type: 'info' },
            ]);

            setIsLoading(false);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load admin data');
            setIsLoading(false);
        }
    }, [user]);

    const handleDeleteUser = useCallback(async (id) => {
        if (window.confirm('Are you sure you want to permanently ban and delete this user?')) {
            try {
                await api.delete(`/users/${id}`);
                toast.success('User removed');
                setUsers(users.filter(u => u._id !== id));
            } catch (error) {
                toast.error('Failed to delete user');
            }
        }
    }, [users]);

    const handleDeleteNote = useCallback(async (id) => {
        if (window.confirm('Delete this content permanently?')) {
            try {
                await api.delete(`/notes/${id}`);
                toast.success('Content purged');
                setNotes(notes.filter(n => n._id !== id));
            } catch (error) {
                toast.error('Failed to delete content');
            }
        }
    }, [notes]);

    const handleTogglePin = useCallback(async (id) => {
        try {
            const { data } = await api.put(`/notes/${id}/pin`, {});
            setNotes(notes.map(n => n._id === id ? { ...n, isPinned: data.data.isPinned } : n));
            toast.success(data.data.isPinned ? 'Content pinned' : 'Content unpinned');
        } catch (error) {
            toast.error('Failed to toggle pin state');
        }
    }, [notes]);

    const handleRoleUpdate = useCallback(async (id, newRole) => {
        try {
            await api.put(`/users/${id}/role`, { role: newRole });
            toast.success('User role updated');
            setUsers(users.map(u => u._id === id ? { ...u, role: newRole } : u));
        } catch (error) {
            toast.error('Failed to update role');
        }
    }, [users]);

    const handleBulkAction = useCallback((action) => {
        toast(`Bulk ${action} - Feature coming soon!`, { icon: 'ℹ️' });
    }, []);

    const exportData = useCallback((type) => {
        const dataToExport = type === 'users' ? users : notes;
        const dataStr = JSON.stringify(dataToExport, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${type}_export_${new Date().toISOString()}.json`;
        link.click();
        toast.success(`${type} data exported successfully`);
    }, [users, notes]);

    const filteredUsers = useMemo(() =>
        users.filter(u =>
            u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase())
        ), [users, searchTerm]
    );

    const filteredNotes = useMemo(() =>
        notes.filter(n => {
            const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase());
            if (activeTab === 'content') {
                return matchesSearch && n.type !== 'issue';
            }
            if (activeTab === 'issues') {
                return matchesSearch && n.type === 'issue';
            }
            return matchesSearch;
        }), [notes, searchTerm, activeTab]
    );

    if (isLoading) return <Spinner fullPage message="Loading Admin Console..." />;

    return (
        <div className="max-w-[1600px] mx-auto p-4 sm:p-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 border-b border-border pb-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-red-500/20 to-red-600/10 text-red-500 rounded-xl">
                        <Shield size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-foreground tracking-tight">System Administration</h1>
                        <p className="text-muted-foreground mt-1 text-sm font-bold uppercase tracking-widest">
                            Security Level: Omega // Authorized Personnel Only
                        </p>
                    </div>
                </div>
                <button
                    onClick={fetchData}
                    className="p-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all"
                    title="Refresh Data"
                >
                    <RefreshCw size={20} />
                </button>
            </div>

            {/* Stats Overview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard
                    icon={<Users size={24} />}
                    label="Total Users"
                    value={stats.totalUsers}
                    color="blue"
                    trend="+12%"
                />
                <StatCard
                    icon={<FileText size={24} />}
                    label="Total Content"
                    value={stats.totalNotes}
                    color="green"
                    trend="+8%"
                />
                <StatCard
                    icon={<AlertTriangle size={24} />}
                    label="Active Issues"
                    value={stats.totalIssues}
                    color="amber"
                    trend="-3%"
                />
                <StatCard
                    icon={<TrendingUp size={24} />}
                    label="Avg Reputation"
                    value={stats.averageReputation}
                    color="purple"
                    trend="+5%"
                />
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar border-b border-border pb-2">
                {['overview', 'users', 'content', 'issues', 'activity'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab
                            ? 'bg-primary text-white shadow-lg'
                            : 'bg-card hover:bg-muted text-muted-foreground'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Search & Actions Bar */}
            {(activeTab === 'users' || activeTab === 'content' || activeTab === 'issues') && (
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-card border border-border rounded-xl pl-12 pr-4 py-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                        />
                    </div>
                    <button
                        onClick={() => exportData(activeTab)}
                        className="px-6 py-3 bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 rounded-xl font-bold text-sm flex items-center gap-2 transition-all"
                    >
                        <Download size={16} />
                        Export Data
                    </button>
                </div>
            )}

            {/* Content Sections */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Activity */}
                    <div className="bg-card border border-border rounded-2xl p-6">
                        <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                            <Activity size={20} className="text-primary" />
                            Recent Activity
                        </h3>
                        <div className="space-y-3">
                            {activityLogs.map(log => (
                                <div key={log.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl">
                                    <div className={`w-2 h-2 rounded-full mt-2 ${log.type === 'success' ? 'bg-green-500' :
                                        log.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                                        }`} />
                                    <div className="flex-1">
                                        <p className="text-sm font-bold">{log.action}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {log.user} • {new Date(log.time).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-card border border-border rounded-2xl p-6">
                        <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                            <Database size={20} className="text-primary" />
                            Quick Actions
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <QuickActionButton
                                icon={<UserCheck size={18} />}
                                label="Verify Users"
                                onClick={() => handleBulkAction('verify')}
                            />
                            <QuickActionButton
                                icon={<Ban size={18} />}
                                label="Ban Users"
                                onClick={() => handleBulkAction('ban')}
                            />
                            <QuickActionButton
                                icon={<Mail size={18} />}
                                label="Send Broadcast"
                                onClick={() => toast('Broadcast feature coming soon', { icon: '📧' })}
                            />
                            <QuickActionButton
                                icon={<BarChart3 size={18} />}
                                label="View Analytics"
                                onClick={() => toast('Analytics coming soon', { icon: '📊' })}
                            />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-muted-foreground">User</th>
                                    <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-muted-foreground">Email</th>
                                    <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-muted-foreground">Role</th>
                                    <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-muted-foreground">Reputation</th>
                                    <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-muted-foreground">Joined</th>
                                    <th className="text-right p-4 text-xs font-black uppercase tracking-wider text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredUsers.map(u => (
                                    <tr key={u._id} className="hover:bg-muted/30 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-black text-primary">
                                                    {u.username[0].toUpperCase()}
                                                </div>
                                                <span className="font-bold">{u.username}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-muted-foreground">{u.email}</td>
                                        <td className="p-4">
                                            <select
                                                value={u.role}
                                                onChange={(e) => handleRoleUpdate(u._id, e.target.value)}
                                                className="bg-muted border border-border rounded-lg px-3 py-1.5 text-sm font-bold outline-none focus:border-primary/50"
                                            >
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-xs font-black">
                                                {u.reputation || 0}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-muted-foreground">
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleDeleteUser(u._id)}
                                                className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                                                title="Delete User"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {(activeTab === 'content' || activeTab === 'issues') && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredNotes.map(note => (
                        <motion.div
                            key={note._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="font-black text-lg line-clamp-2">{note.title}</h3>
                                {note.isPinned && (
                                    <Pin size={16} className="text-primary flex-shrink-0" />
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                                {note.content?.substring(0, 100)}...
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                    By {note.author?.username}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleTogglePin(note._id)}
                                        className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                                        title={note.isPinned ? 'Unpin' : 'Pin'}
                                    >
                                        <Pin size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteNote(note._id)}
                                        className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {activeTab === 'activity' && (
                <div className="bg-card border border-border rounded-2xl p-6">
                    <h3 className="text-xl font-black mb-6">System Activity Logs</h3>
                    <div className="space-y-4">
                        {activityLogs.map(log => (
                            <div key={log.id} className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
                                <div className={`w-3 h-3 rounded-full ${log.type === 'success' ? 'bg-green-500' :
                                    log.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                                    }`} />
                                <div className="flex-1">
                                    <p className="font-bold">{log.action}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {log.user} • {new Date(log.time).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ icon, label, value, color, trend }) => {
    const colorClasses = {
        blue: 'bg-blue-500/10 text-blue-500',
        green: 'bg-green-500/10 text-green-500',
        amber: 'bg-amber-500/10 text-amber-500',
        purple: 'bg-purple-500/10 text-purple-500'
    };

    return (
        <div className="bg-card border border-border/50 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 ${colorClasses[color]} rounded-xl`}>
                    {icon}
                </div>
                {trend && (
                    <span className={`text-xs font-black ${trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                        {trend}
                    </span>
                )}
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
            <h3 className="text-4xl font-black text-foreground">{value}</h3>
        </div>
    );
};

const QuickActionButton = ({ icon, label, onClick }) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center gap-2 p-4 bg-muted/30 hover:bg-primary/10 hover:text-primary rounded-xl transition-all group"
    >
        <div className="p-2 bg-primary/10 group-hover:bg-primary/20 rounded-lg transition-all">
            {icon}
        </div>
        <span className="text-xs font-bold">{label}</span>
    </button>
);

export default AdminDashboard;
