import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Users, Trash2, Shield, ShieldAlert, BarChart3, ArrowRight, UserCheck, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Spinner from '../components/Spinner';

const Admin = () => {
    const { user } = useSelector((state) => state.auth);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    if (user?.role !== 'admin') {
        return <Navigate to="/dashboard" />;
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            setUsers(data.data);
        } catch (error) {
            toast.error('Failed to bridge user database');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Erase this operator from the system? This action is permanent.')) return;

        try {
            await api.delete(`/users/${id}`);
            setUsers(users.filter(u => u._id !== id));
            toast.success('User purged from matrix');
        } catch (error) {
            toast.error('Purge protocol failed');
        }
    };

    if (loading) return <Spinner />;

    return (
        <div className="space-y-12 pb-24">
            {/* Admin Hero */}
            <header className="relative p-12 md:p-16 rounded-[3rem] bg-slate-950 text-white overflow-hidden shadow-2xl border border-white/5">
                <div className="absolute top-0 right-0 w-[50%] h-full bg-indigo-500/20 blur-[100px] rounded-full translate-x-1/3" />
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-rose-500/20 text-rose-500 rounded-2xl border border-rose-500/30">
                            <ShieldAlert size={32} />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight">System Core</h1>
                    </div>
                    <p className="text-slate-400 text-lg font-medium max-w-2xl">Master authority console for user orchestration and platform integrity.</p>
                </div>
            </header>

            {/* Global Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: 'Network Operators', value: users.length, icon: Users, tint: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                    { label: 'Admin Authority', value: users.filter(u => u.role === 'admin').length, icon: Shield, tint: 'text-purple-500', bg: 'bg-purple-500/10' },
                    { label: 'System Uptime', value: '100%', icon: Activity, tint: 'text-emerald-500', bg: 'bg-emerald-500/10' }
                ].map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        key={i}
                        className="glass p-8 rounded-[2rem] hover:scale-105 transition-all"
                    >
                        <div className={`p-4 ${stat.bg} ${stat.tint} rounded-2xl w-fit mb-6 shadow-lg`}>
                            <stat.icon size={28} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-black">{stat.value}</h3>
                    </motion.div>
                ))}
            </div>

            {/* Operator Directory */}
            <section className="glass rounded-[3rem] overflow-hidden shadow-2xl border border-border/50">
                <div className="p-10 border-b border-border/50 flex justify-between items-center bg-secondary/30">
                    <h2 className="text-2xl font-black flex items-center gap-3">
                        <UserCheck className="text-primary" /> Operator Directory
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-border/50 text-muted-foreground">
                                <th className="px-10 py-6 font-black uppercase tracking-widest text-[10px]">Identity</th>
                                <th className="px-10 py-6 font-black uppercase tracking-widest text-[10px]">Email Endpoint</th>
                                <th className="px-10 py-6 font-black uppercase tracking-widest text-[10px]">Privilege</th>
                                <th className="px-10 py-6 font-black uppercase tracking-widest text-[10px]">Deployment</th>
                                <th className="px-10 py-6 font-black uppercase tracking-widest text-[10px] text-right">Protocol</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {users.map((u, i) => (
                                <motion.tr
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                                    key={u._id}
                                    className="hover:bg-primary/5 transition-all group"
                                >
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-black shadow-lg">
                                                {u.username.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-bold text-base">{u.username}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6 text-muted-foreground font-medium">{u.email}</td>
                                    <td className="px-10 py-6">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${u.role === 'admin' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-10 py-6 text-muted-foreground font-medium">
                                        {new Date(u.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-10 py-6 text-right">
                                        {u.role !== 'admin' && (
                                            <button
                                                onClick={() => handleDeleteUser(u._id)}
                                                className="p-3 bg-secondary text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition-all shadow-sm"
                                                title="Erase Operator"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default Admin;
