import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Users, Trash2, Shield, ShieldAlert, BarChart3 } from 'lucide-react';
import { toast } from 'react-hot-toast'; // Corrected import
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

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
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure? This allows cannot be undone.')) return;

        try {
            await api.delete(`/users/${id}`);
            setUsers(users.filter(u => u._id !== id));
            toast.success('User deleted');
        } catch (error) {
            toast.error('Failed to delete user');
        }
    };

    if (loading) return <div>Loading Admin Panel...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold flex items-center gap-2">
                <ShieldAlert className="text-destructive" /> Admin Console
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats Placeholder */}
                <div className="bg-card border border-border p-6 rounded-xl">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 text-primary rounded-lg">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Users</p>
                            <h3 className="text-2xl font-bold">{users.length}</h3>
                        </div>
                    </div>
                </div>
                {/* Can add more global stats here later */}
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-6 border-b border-border">
                    <h2 className="text-xl font-bold">User Management</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted text-muted-foreground">
                            <tr>
                                <th className="px-6 py-3 font-medium">User</th>
                                <th className="px-6 py-3 font-medium">Email</th>
                                <th className="px-6 py-3 font-medium">Role</th>
                                <th className="px-6 py-3 font-medium">Joined</th>
                                <th className="px-6 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {users.map((u) => (
                                <tr key={u._id} className="hover:bg-muted/50 transition-colors">
                                    <td className="px-6 py-4 font-medium flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold">
                                            {u.username.charAt(0).toUpperCase()}
                                        </div>
                                        {u.username}
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${u.role === 'admin' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                            {u.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        {new Date(u.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {u.role !== 'admin' && (
                                            <button
                                                onClick={() => handleDeleteUser(u._id)}
                                                className="text-muted-foreground hover:text-destructive transition-colors"
                                                title="Delete User"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Admin;
