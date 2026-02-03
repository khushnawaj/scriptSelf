import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../features/auth/authSlice';
import { useTheme } from '../context/ThemeContext';
import {
    Moon,
    Sun,
    LogOut,
    User,
    Code2,
    ChevronDown,
    Plus,
    Search,
    Inbox,
    Trophy,
    ShieldCheck,
    HelpCircle,
    Menu
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ onMenuClick }) => {
    const { user } = useSelector((state) => state.auth);
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);

    const handleLogout = () => {
        dispatch(logout());
        dispatch(reset());
        navigate('/login');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <nav className="fixed top-0 w-full z-50 glass-morphism bg-background/70 border-b border-border h-[64px] flex items-center transition-all duration-300">
            <div className="max-w-[1500px] mx-auto w-full px-6 flex items-center gap-6">

                {/* Burger Menu for Mobile */}
                <button
                    onClick={onMenuClick}
                    className="p-2 md:hidden text-foreground hover:bg-muted/50 rounded-[6px] transition-colors"
                >
                    <Menu size={22} />
                </button>

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 shrink-0 group">
                    <div className="p-2 bg-primary rounded-[8px] group-hover:rotate-12 transition-transform duration-300">
                        <Code2 size={20} className="text-white" />
                    </div>
                    <span className="text-[20px] font-bold tracking-tight hidden sm:inline text-foreground">
                        script<span className="text-primary">shelf.</span>
                    </span>
                </Link>

                <div className="hidden md:flex gap-1">
                    <Link to="/notes" className="px-4 py-2 text-[14px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-[6px] transition-all">
                        Library
                    </Link>
                </div>

                {/* Search Bar - Premium SO Style */}
                <div className="flex-1 max-w-[600px] relative group cursor-pointer" onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}>
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-hover:text-primary transition-colors" size={16} />
                    <div className="w-full bg-secondary/50 border border-border/50 rounded-[8px] py-2.5 pl-11 pr-4 text-[14px] text-muted-foreground flex justify-between items-center transition-all group-hover:border-primary/50 group-hover:bg-background group-hover:shadow-lg group-hover:shadow-primary/5">
                        <span className="hidden sm:inline">Search your intelligence...</span>
                        <span className="sm:hidden">Search...</span>
                        <div className="hidden md:flex items-center gap-1 opacity-50">
                            <kbd className="px-1.5 py-0.5 rounded-[4px] border border-border bg-background text-[10px] font-bold">⌘</kbd>
                            <kbd className="px-1.5 py-0.5 rounded-[4px] border border-border bg-background text-[10px] font-bold">K</kbd>
                        </div>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3 ml-auto">
                    <button
                        onClick={toggleTheme}
                        className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-[8px] transition-all"
                        title="Toggle appearance"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {user ? (
                        <div className="flex items-center gap-2">
                            <div className="relative" ref={profileRef}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 p-1 pl-2 hover:bg-muted/50 rounded-[10px] border border-transparent hover:border-border transition-all"
                                >
                                    <span className="text-[13px] font-bold text-foreground hidden lg:inline">{user.username}</span>
                                    <div className="w-[32px] h-[32px] bg-primary rounded-[8px] flex items-center justify-center text-white text-[14px] font-bold overflow-hidden shadow-lg shadow-primary/20">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            user.username.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <ChevronDown size={14} className="text-muted-foreground" />
                                </button>

                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                            className="absolute right-0 top-full mt-3 w-64 glass-morphism shadow-2xl p-2 z-[100] text-[14px] rounded-[12px]"
                                        >
                                            <div className="p-4 border-b border-border/50 mb-2">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="font-bold text-foreground">{user.username}</p>
                                                    {user.role === 'admin' && (
                                                        <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/20 flex items-center gap-1">
                                                            <ShieldCheck size={10} /> ADMIN
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[12px] text-muted-foreground truncate">{user.email}</p>
                                            </div>
                                            <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-[8px] transition-all">
                                                <User size={16} /> Profile Settings
                                            </Link>
                                            {user.role === 'admin' && (
                                                <Link to="/admin" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-rose-500 hover:bg-rose-500/10 rounded-[8px] transition-all mt-1">
                                                    <ShieldCheck size={16} /> Admin Console
                                                </Link>
                                            )}
                                            <div className="h-px bg-border/50 my-2" />
                                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-[8px] transition-all">
                                                <LogOut size={16} /> Sign out
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="text-[14px] font-bold text-foreground hover:text-primary transition-colors">Log in</Link>
                            <Link to="/register" className="so-btn so-btn-primary px-5 py-2">Get Started</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
