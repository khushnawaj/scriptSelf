import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../features/auth/authSlice';
import { useTheme } from '../context/ThemeContext';
import {
    LayoutDashboard,
    FileText,
    FolderOpen,
    Settings,
    LogOut,
    Code2,
    Moon,
    Sun,
    Terminal
} from 'lucide-react';
import clsx from 'clsx';

const Sidebar = () => {
    const { user } = useSelector((state) => state.auth);
    const { theme, toggleTheme } = useTheme();

    const dispatch = useDispatch();
    const location = useLocation();

    const handleLogout = () => {
        dispatch(logout());
        dispatch(reset());
    };

    const navItems = [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'My Notes', path: '/notes', icon: FileText },
        { label: 'Categories', path: '/categories', icon: FolderOpen },
        { label: 'Playground', path: '/playground', icon: Terminal },
    ];

    if (user?.role === 'admin') {
        navItems.push({ label: 'Admin Panel', path: '/admin', icon: Settings });
    }

    return (
        <div className="h-screen w-64 bg-card border-r border-border flex flex-col fixed left-0 top-0 transition-colors duration-300">
            <div className="p-6 flex items-center gap-2 border-b border-border">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                    <Code2 className="text-primary h-6 w-6" />
                </div>
                <h1 className="text-lg font-semibold tracking-tight">ScriptShelf</h1>
            </div>

            <nav className="flex-1 p-3 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                'group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-semibold overflow-hidden',
                                isActive
                                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                    : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                            )}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white opacity-40 rounded-r-full" />
                            )}
                            <Icon size={19} className={clsx("transition-transform duration-300", !isActive && "group-hover:scale-110")} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Theme Toggle & User Profile */}
            <div className="p-3 border-t border-border space-y-2">
                <button
                    onClick={toggleTheme}
                    className="btn-premium-ghost w-full justify-between"
                >
                    <span className="flex items-center gap-2">
                        {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                        {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                    </span>
                </button>

                <div className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate leading-none">{user?.username}</p>
                        <p className="text-[11px] text-muted-foreground truncate mt-1">{user?.email}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="btn-premium-ghost p-1.5 hover:text-destructive"
                        title="Logout"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
