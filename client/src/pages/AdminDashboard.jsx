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
    RefreshCw,
    UserPlus,
    FlaskConical,
    Zap,
    Settings2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

import Pagination from '../components/Pagination';

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
    const [selectedUser, setSelectedUser] = useState(null);
    const [globalThemeVersion, setGlobalThemeVersion] = useState('v1');
    const { toggleDesignSystem, themeAssets } = useTheme();
    const ThemeIcon = themeAssets?.icons?.hero || Shield;

    // Pagination States
    const [userPage, setUserPage] = useState(1);
    const [userTotal, setUserTotal] = useState(0);
    const [notePage, setNotePage] = useState(1);
    const [noteTotal, setNoteTotal] = useState(0);
    const limit = 10;

    // Broadcast States
    const [broadcastForm, setBroadcastForm] = useState({ subject: '', message: '', recipientType: 'all', specificUserId: '' });
    const [isSending, setIsSending] = useState(false);

    // Email Templates
    const emailTemplates = [
        {
            name: '🚀 New Feature',
            subject: 'Exciting New Feature Launch!',
            message: 'We\'re thrilled to announce a new feature that will enhance your ScriptShelf experience.\n\n[Describe the feature here]\n\nTry it out today and let us know what you think!'
        },
        {
            name: '🔧 Maintenance',
            subject: 'Scheduled Maintenance Notice',
            message: 'We will be performing scheduled maintenance on [DATE] at [TIME].\n\nExpected downtime: [DURATION]\n\nWe apologize for any inconvenience this may cause.'
        },
        {
            name: '🎉 Update',
            subject: 'Platform Updates & Improvements',
            message: 'We\'ve made some improvements to make your experience better:\n\n• [Update 1]\n• [Update 2]\n• [Update 3]\n\nThank you for being part of our community!'
        },
        {
            name: '📢 Announcement',
            subject: 'Important Announcement',
            message: 'We have an important update to share with you.\n\n[Your announcement here]\n\nIf you have any questions, feel free to reach out.'
        },
        {
            name: '⚠️ Security Alert',
            subject: 'Security Update Required',
            message: 'We\'ve detected a security concern that requires your attention.\n\n[Details here]\n\nPlease update your password and review your account settings.'
        }
    ];


    useEffect(() => {
        if (!user || user.role !== 'admin') {
            toast.error('Unauthorized Access');
            navigate('/dashboard');
            return;
        }
        fetchOverviewStats();
        fetchGlobalSettings();
    }, [user, navigate]);

    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'content' || activeTab === 'issues') fetchNotes();
    }, [userPage, notePage, activeTab]);

    const fetchOverviewStats = async () => {
        try {
            const [usersRes, notesRes, statsRes] = await Promise.all([
                api.get('/users?limit=5'),
                api.get('/notes/admin/all?limit=5'),
                api.get('/users/admin/stats')
            ]);
            setUsers(usersRes.data.data);
            setNotes(notesRes.data.data);

            const statsData = statsRes.data.data;
            setStats({
                totalUsers: statsData.totalUsers,
                totalNotes: statsData.totalNotes,
                totalIssues: statsData.totalIssues,
                averageReputation: statsData.averageReputation,
                activeToday: statsData.activeToday,
                totalMessages: statsData.totalMessages
            });
        } catch (error) {
            console.error('Overview fetch failed', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const { data } = await api.get(`/users?page=${userPage}&limit=${limit}`);
            setUsers(data.data);
            setUserTotal(data.total);
        } catch (error) {
            toast.error('Failed to load users');
        }
    };

    const fetchNotes = async () => {
        try {
            const { data } = await api.get(`/notes/admin/all?page=${notePage}&limit=${limit}`);
            setNotes(data.data);
            setNoteTotal(data.total);
        } catch (error) {
            toast.error('Failed to load content');
        }
    };

    const fetchGlobalSettings = async () => {
        try {
            const { data } = await api.get('/system/settings/theme_version');
            if (data.success) {
                setGlobalThemeVersion(data.data.value);
            }
        } catch (error) {
            console.error('Failed to fetch system settings');
        }
    };

    const handleToggleGlobalTheme = async () => {
        const nextVersion = globalThemeVersion === 'v1' ? 'v2' : 'v1';
        try {
            await api.put('/system/settings/theme_version', { value: nextVersion });
            setGlobalThemeVersion(nextVersion);
            toggleDesignSystem(nextVersion);
            toast.success(`System Theme updated to ${nextVersion.toUpperCase()}`);
        } catch (error) {
            toast.error('Failed to update system theme');
        }
    };


    const fetchData = useCallback(async () => {
        setIsLoading(true);
        await fetchOverviewStats();
        if (activeTab === 'users') await fetchUsers();
        if (activeTab === 'content' || activeTab === 'issues') await fetchNotes();
        setIsLoading(false);
    }, [activeTab]);

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

    const handleBroadcast = async (e) => {
        e.preventDefault();
        if (!broadcastForm.subject || !broadcastForm.message) {
            toast.error('Please fill in both subject and message');
            return;
        }

        if (broadcastForm.recipientType === 'single' && !broadcastForm.specificUserId) {
            toast.error('Please select a user');
            return;
        }

        setIsSending(true);
        try {
            if (broadcastForm.recipientType === 'all') {
                const { data } = await api.post('/users/admin/broadcast', {
                    subject: broadcastForm.subject,
                    message: broadcastForm.message
                });
                toast.success(`Email sent to ${data.data.totalUsers} users!`);
            } else {
                // Send to single user
                const selectedUser = users.find(u => u._id === broadcastForm.specificUserId);
                await api.post('/users/admin/broadcast', {
                    subject: broadcastForm.subject,
                    message: broadcastForm.message,
                    recipientEmail: selectedUser.email
                });
                toast.success(`Email sent to ${selectedUser.username}!`);
            }
            setBroadcastForm({ subject: '', message: '', recipientType: 'all', specificUserId: '' });
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to send email');
        } finally {
            setIsSending(false);
        }
    };

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
        toast(`Bulk ${action} - Feature coming soon!`);
    }, []);

    const handleGroupUpdate = async (id, group) => {
        try {
            await api.put(`/users/${id}/group`, { group });
            toast.success('User group updated');
            setUsers(users.map(u => u._id === id ? { ...u, experimentGroup: group } : u));
        } catch (error) {
            toast.error('Failed to update group');
        }
    };

    const handleFlagUpdate = async (id, flagName, value) => {
        try {
            const user = users.find(u => u._id === id);
            const currentFlags = user.featureFlags || {};
            const newFlags = { ...currentFlags, [flagName]: value };

            await api.put(`/users/${id}/flags`, { flags: newFlags });
            toast.success(`Feature flag '${flagName}' updated`);
            setUsers(users.map(u => u._id === id ? { ...u, featureFlags: newFlags } : u));
        } catch (error) {
            toast.error('Failed to update feature flags');
        }
    };

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
        <div className={`max-w-[1600px] mx-auto p-4 sm:p-8 ${themeAssets?.animation}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-8 border-b border-border pb-6">

                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl transition-all duration-500 scale-110">
                        <ThemeIcon size={32} className="text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground tracking-tight">System Administration</h1>
                        <p className="text-muted-foreground mt-1 text-sm font-medium uppercase tracking-widest">
                            Security Level: Omega // Authorized Personnel Only
                        </p>
                    </div>
                </div>
                <button
                    onClick={fetchData}
                    className="so-btn"
                    title="Refresh Data"
                >
                    <RefreshCw size={16} />
                    Refresh
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
                {['overview', 'users', 'content', 'issues', 'experiments', 'broadcast', 'system'].map(tab => (

                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2.5 rounded-2xl text-[13px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${activeTab === tab
                            ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                            : 'bg-secondary/50 text-muted-foreground border-transparent hover:bg-secondary hover:text-foreground'
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
                        className="so-btn so-btn-primary"
                    >
                        <Download size={16} />
                        Export Data
                    </button>
                </div>
            )}

            {/* Content Sections */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Latest Signups */}
                    <div className="bg-card border border-border rounded-2xl p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <UserPlus size={20} className="text-primary" />
                            Latest Signups
                        </h3>
                        <div className="space-y-3">
                            {users.slice(0, 5).map(u => (
                                <div key={u._id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                                        {u.username[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold">{u.username}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                            Joined {new Date(u.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-[10px] font-bold bg-secondary px-2 py-1 rounded text-muted-foreground uppercase">
                                        {u.role}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Content */}
                    <div className="bg-card border border-border rounded-2xl p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <FileText size={20} className="text-primary" />
                            New Content
                        </h3>
                        <div className="space-y-3">
                            {notes.slice(0, 5).map(n => (
                                <div key={n._id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                        {n.type === 'issue' ? <AlertTriangle size={14} /> : <FileText size={14} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold truncate">{n.title}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                            By {n.author?.username || 'Unknown'}
                                        </p>
                                    </div>
                                    <span className="text-[10px] bg-background border border-border px-2 py-0.5 rounded font-mono">
                                        {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
                                    </span>
                                </div>
                            ))}
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
                                    <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">User</th>
                                    <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</th>
                                    <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Role</th>
                                    <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Reputation</th>
                                    <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Group</th>
                                    <th className="text-right p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredUsers.map(u => (
                                    <React.Fragment key={u._id}>
                                        <tr className="hover:bg-muted/30 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-black text-primary text-xs">
                                                        {u.username[0].toUpperCase()}
                                                    </div>
                                                    <span className="font-bold text-sm">{u.username}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-muted-foreground">{u.email}</td>
                                            <td className="p-4">
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => handleRoleUpdate(u._id, e.target.value)}
                                                    className="bg-muted border border-border rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:border-primary/50"
                                                >
                                                    <option value="user">User</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </td>
                                            <td className="p-4">
                                                <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-black">
                                                    {u.reputation || 0}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className={`text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-md border ${u.experimentGroup === 'A' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                                                    {u.experimentGroup || 'A'}
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setSelectedUser(selectedUser?._id === u._id ? null : u)}
                                                        className={`p-2 rounded-lg transition-colors ${selectedUser?._id === u._id ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10 text-primary'}`}
                                                        title="Manage Flags"
                                                    >
                                                        <Settings2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(u._id)}
                                                        className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {selectedUser?._id === u._id && (
                                            <tr className="bg-muted/10">
                                                <td colSpan="6" className="p-4 border-b border-border/50">
                                                    <div className="flex flex-col gap-4 animate-in slide-in-from-top-2 duration-300">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                                <Zap size={10} className="text-primary" /> User Settings Override
                                                            </h4>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-bold text-muted-foreground">COHORT:</span>
                                                                <select
                                                                    value={u.experimentGroup || 'A'}
                                                                    onChange={(e) => handleGroupUpdate(u._id, e.target.value)}
                                                                    className="bg-background border border-border rounded px-2 py-1 text-[10px] font-black outline-none focus:border-primary/50"
                                                                >
                                                                    <option value="A">Group_Alpha</option>
                                                                    <option value="B">Group_Beta</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                            {['v2_bars', 'dark_mode_experimental', 'new_editor', 'global_chat'].map(flag => (
                                                                <div key={flag} className="flex items-center justify-between p-2 bg-background border border-border/50 rounded-lg">
                                                                    <span className="text-[9px] font-mono font-bold truncate pr-2 text-muted-foreground uppercase">{flag.replace(/_/g, ' ')}</span>
                                                                    <button
                                                                        onClick={() => handleFlagUpdate(u._id, flag, !u.featureFlags?.[flag])}
                                                                        className={`w-7 h-3.5 rounded-full relative transition-all ${u.featureFlags?.[flag] ? 'bg-primary' : 'bg-muted'}`}
                                                                    >
                                                                        <div className={`absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full transition-all ${u.featureFlags?.[flag] ? 'right-0.5' : 'left-0.5'}`} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination
                        currentPage={userPage}
                        totalPages={Math.ceil(userTotal / limit)}
                        onPageChange={setUserPage}
                    />
                </div>
            )}

            {(activeTab === 'content' || activeTab === 'issues') && (
                <>
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
                    <Pagination
                        currentPage={notePage}
                        totalPages={Math.ceil(noteTotal / limit)}
                        onPageChange={setNotePage}
                    />
                </>
            )}

            {activeTab === 'experiments' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-primary/10 text-primary rounded-xl"><FlaskConical size={20} /></div>
                                <h3 className="font-black text-sm uppercase tracking-wider">Cohort Distribution</h3>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-[11px] font-black uppercase tracking-tighter mb-2">
                                        <span className="text-muted-foreground">Group_Alpha</span>
                                        <span className="text-primary">{users.filter(u => u.experimentGroup === 'A' || !u.experimentGroup).length} Units</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(users.filter(u => u.experimentGroup === 'A' || !u.experimentGroup).length / users.length) * 100}%` }}
                                            className="h-full bg-primary"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-[11px] font-black uppercase tracking-tighter mb-2">
                                        <span className="text-muted-foreground">Group_Beta</span>
                                        <span className="text-blue-500">{users.filter(u => u.experimentGroup === 'B').length} Units</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(users.filter(u => u.experimentGroup === 'B').length / users.length) * 100}%` }}
                                            className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl"><Zap size={20} /></div>
                                <h3 className="font-black text-sm uppercase tracking-wider">Active Experiment Status</h3>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { name: 'V2_BARS_ROLLOUT', status: 'RUNNING', color: 'text-green-500 bg-green-500/10' },
                                    { name: 'DARK_MODE_V3', status: 'PROPOSED', color: 'text-muted-foreground bg-muted/50' },
                                    { name: 'GLOBAL_CHAT', status: 'ARCHIVED', color: 'text-muted-foreground bg-muted/50' }
                                ].map((exp, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/20 border border-border/50 rounded-xl">
                                        <span className="text-[10px] font-black tracking-widest">{exp.name}</span>
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded ${exp.color}`}>{exp.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden group">
                            <div className="relative z-10 h-full flex flex-col">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl"><BarChart3 size={20} /></div>
                                    <h3 className="font-black text-sm uppercase tracking-wider">Telemetry</h3>
                                </div>
                                <p className="text-[11px] text-muted-foreground font-medium leading-relaxed mb-4">
                                    Real-time engagement metrics are being aggregated. Beta cohort shows 12% higher interaction on XP visualization sub-modules.
                                </p>
                                <button className="mt-auto w-full py-2 bg-secondary/50 text-muted-foreground text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-primary hover:text-white transition-all">
                                    View Detailed Analytics
                                </button>
                            </div>
                            <motion.div
                                className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity"
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
                            >
                                <Database size={120} />
                            </motion.div>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-6 border-l-4 border-l-primary/50 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Settings2 size={18} className="text-primary" /> Master System Protocol
                            </h3>
                            <p className="text-xs text-muted-foreground leading-relaxed max-w-4xl">
                                A/B group assignments are permanently bound to user identities upon initialization. Manual overrides are available via the <span className="text-foreground font-bold italic">User Management</span> matrix. All feature flags are hot-swappable and require no system reboot. Telemetry data is synchronized across all nodes every 300 seconds.
                            </p>
                        </div>
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <Shield size={40} />
                        </div>
                    </div>
                </div>
            )
            }

            {
                activeTab === 'broadcast' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-400"
                    >
                        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                            <div className="space-y-2 mb-6">
                                <h3 className="text-2xl font-bold text-foreground flex items-center gap-3">
                                    <Mail size={28} className="text-primary" />
                                    Email Broadcast
                                </h3>
                                <p className="text-[13px] text-muted-foreground">
                                    Send important updates, announcements, or information to all registered users.
                                </p>
                            </div>

                            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl mb-6">
                                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold uppercase mb-1 flex items-center gap-2">
                                    <AlertTriangle size={14} /> Warning
                                </p>
                                <p className="text-[12px] text-muted-foreground">
                                    This will send an email to ALL users with registered email addresses. Use responsibly.
                                </p>
                            </div>

                            {/* Quick Templates */}
                            <div className="mb-6">
                                <label className="block text-[13px] font-bold mb-3 text-foreground">Quick Templates</label>
                                <div className="flex flex-wrap gap-2">
                                    {emailTemplates.map((template, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => setBroadcastForm(prev => ({
                                                ...prev,
                                                subject: template.subject,
                                                message: template.message
                                            }))}
                                            className="px-3 py-1.5 text-xs font-bold bg-secondary/50 hover:bg-secondary border border-border rounded-lg transition-all hover:scale-105"
                                        >
                                            {template.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Recipient Selection */}
                            <div className="mb-6 p-4 bg-muted/20 border border-border rounded-xl">
                                <label className="block text-[13px] font-bold mb-3 text-foreground">Send To</label>
                                <div className="flex gap-4 mb-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="recipientType"
                                            value="all"
                                            checked={broadcastForm.recipientType === 'all'}
                                            onChange={(e) => setBroadcastForm({ ...broadcastForm, recipientType: e.target.value, specificUserId: '' })}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm font-medium">All Users ({stats.totalUsers})</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="recipientType"
                                            value="single"
                                            checked={broadcastForm.recipientType === 'single'}
                                            onChange={(e) => setBroadcastForm({ ...broadcastForm, recipientType: e.target.value })}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm font-medium">Specific User</span>
                                    </label>
                                </div>

                                {broadcastForm.recipientType === 'single' && (
                                    <select
                                        value={broadcastForm.specificUserId}
                                        onChange={(e) => setBroadcastForm({ ...broadcastForm, specificUserId: e.target.value })}
                                        className="w-full border border-border bg-background rounded-xl py-2.5 px-4 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        required={broadcastForm.recipientType === 'single'}
                                    >
                                        <option value="">Select a user...</option>
                                        {users.map(user => (
                                            <option key={user._id} value={user._id}>
                                                {user.username} ({user.email})
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <form onSubmit={handleBroadcast} className="space-y-5">
                                <div>
                                    <label className="block text-[13px] font-bold mb-2 text-foreground">Email Subject</label>
                                    <input
                                        type="text"
                                        className="w-full border border-border bg-background rounded-xl py-3 px-4 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                        placeholder="e.g., New Feature Launch: Dark Mode"
                                        value={broadcastForm.subject}
                                        onChange={(e) => setBroadcastForm({ ...broadcastForm, subject: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-[13px] font-bold mb-2 text-foreground">Message Body</label>
                                    <textarea
                                        className="w-full border border-border bg-background rounded-xl py-3 px-4 text-[13px] min-h-[200px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                                        placeholder="Write your message here..."
                                        value={broadcastForm.message}
                                        onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                                        required
                                    />
                                    <p className="text-[11px] text-muted-foreground mt-2">
                                        The message will be automatically formatted with a greeting and signature.
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSending}
                                        className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm uppercase tracking-wider hover:scale-105 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                    >
                                        {isSending ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                {broadcastForm.recipientType === 'all' ? (
                                                    <>
                                                        <Users size={16} />
                                                        Send to All Users ({stats.totalUsers})
                                                    </>
                                                ) : (
                                                    <>
                                                        <Mail size={16} />
                                                        {broadcastForm.specificUserId
                                                            ? `Send to ${users.find(u => u._id === broadcastForm.specificUserId)?.username || 'User'}`
                                                            : 'Send to User'
                                                        }
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setBroadcastForm({ subject: '', message: '' })}
                                        className="px-4 py-3 border border-border hover:bg-muted/50 rounded-xl font-bold text-sm uppercase tracking-wider transition-all"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </form>

                            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl mt-6">
                                <p className="text-[11px] text-primary font-bold uppercase mb-2 flex items-center gap-2">
                                    <Mail size={14} /> Email Preview
                                </p>
                                <div className="text-[12px] text-muted-foreground space-y-1 font-mono bg-background p-4 rounded-lg border border-border">
                                    <p className="font-bold">Hi [username],</p>
                                    <p className="pl-4 whitespace-pre-wrap">{broadcastForm.message || '(Your message will appear here)'}</p>
                                    <p className="mt-3 font-bold">Best regards,<br />ScriptShelf Team</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )
            }

            {
                activeTab === 'system' && (

                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm relative overflow-hidden">
                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold mb-2 flex items-center gap-3">
                                        <Zap size={24} className="text-primary" />
                                        Global Theme Management
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-8 max-w-md">
                                        Switch the entire project design system. Theme V1 uses the original Olive/GitHub aesthetic. Theme V2 introduces a modern Indigo/Slate vibrant design with softer edges.
                                    </p>

                                    <div className="flex items-center gap-6 p-4 bg-muted/20 border border-border/50 rounded-2xl">
                                        <div className="flex-1">
                                            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">Active Design System</p>
                                            <p className="text-lg font-bold text-primary">{globalThemeVersion.toUpperCase()}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            {[
                                                { id: 'v1', name: 'Script Classic' },
                                                { id: 'v2', name: 'Shelf Modern' },
                                                { id: 'v3', name: 'Logic Pro' },
                                                { id: 'v4', name: 'Learning Lab' },
                                                { id: 'v5', name: 'Stack Dev' }
                                            ].map(v => (

                                                <button
                                                    key={v.id}
                                                    onClick={() => {
                                                        const nextVersion = v.id;
                                                        api.put('/system/settings/theme_version', { value: nextVersion });
                                                        setGlobalThemeVersion(nextVersion);
                                                        toggleDesignSystem(nextVersion);
                                                        toast.success(`System Theme updated to ${v.name}`);
                                                    }}
                                                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${globalThemeVersion === v.id ? 'bg-primary text-white scale-105' : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'}`}
                                                >
                                                    {v.name}
                                                </button>
                                            ))}
                                        </div>

                                    </div>

                                </div>
                                <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
                                    <Zap size={200} />
                                </div>
                            </div>

                            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                                    <Shield size={24} className="text-primary" />
                                    Security & Infrastructure
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl border border-border/50">
                                        <span className="text-xs font-bold">API Status</span>
                                        <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[10px] font-black rounded uppercase">Operational</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl border border-border/50">
                                        <span className="text-xs font-bold">Database Mode</span>
                                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[10px] font-black rounded uppercase">Encrypted</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl border border-border/50">
                                        <span className="text-xs font-bold">Auth Provider</span>
                                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[10px] font-black rounded uppercase">Passport.js / JWT</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-primary/5 to-transparent border border-primary/20 rounded-2xl p-6">
                            <h4 className="font-black text-[10px] uppercase tracking-[0.3em] mb-4 text-primary">System Notice</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Theme changes are propagated instantly to all active sessions via the context provider. The Design System flag controls CSS variable injections and layout utility classes. No functional changes are performed during theme hot-swaps.
                            </p>
                        </div>
                    </div>
                )
            }



        </div >
    );
};

const StatCard = ({ icon, label, value, color, trend }) => {
    const colorClasses = {
        blue: 'text-blue-500 bg-blue-500/10',
        green: 'text-teal-500 bg-teal-500/10',
        amber: 'text-amber-500 bg-amber-500/10',
        purple: 'text-purple-500 bg-purple-500/10'
    };

    return (
        <div className="group bg-card border border-border/50 p-6 rounded-[2rem] hover:border-primary/40 hover:-translate-y-2 transition-all duration-500 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div className={`p-4 rounded-2xl ${colorClasses[color]} group-hover:scale-110 transition-transform duration-500`}>
                    {icon}
                </div>
                {trend && (
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${trend.startsWith('+') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2">{label}</p>
                <h3 className="text-4xl font-bold text-foreground tracking-tight group-hover:text-primary transition-colors duration-500">{value}</h3>
            </div>
        </div>
    );
};



const QuickActionButton = ({ icon, label, onClick }) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center gap-2 p-4 bg-secondary/30 hover:bg-primary/10 hover:text-primary rounded-xl transition-all group border border-transparent hover:border-primary/20"
    >
        <div className="p-2 bg-background border border-border group-hover:bg-primary/20 rounded-lg transition-all shadow-sm">
            {icon}
        </div>
        <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground">{label}</span>
    </button>
);

export default AdminDashboard;
