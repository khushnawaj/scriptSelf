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
        <nav className="fixed top-0 w-full z-50 bg-secondary border-t-4 border-t-primary border-b border-b-border h-[50px] flex items-center transition-colors">
            <div className="max-w-[1500px] mx-auto w-full px-4 flex items-center gap-2">

                {/* Burger Menu for Mobile */}
                <button
                    onClick={onMenuClick}
                    className="p-2 md:hidden text-muted-foreground hover:bg-muted/50 rounded transition-colors"
                >
                    <Menu size={20} />
                </button>

                {/* Logo */}
                <Link to="/" className="flex items-center gap-1 shrink-0 px-2 py-1 hover:bg-muted/50 rounded transition-colors">
                    <Code2 size={24} className="text-primary" />
                    <span className="text-[18px] font-normal tracking-tight hidden sm:inline text-foreground">
                        script<span className="font-bold">shelf</span>
                    </span>
                </Link>

                <Link to="/notes" className="hidden md:flex px-3 py-4 text-[13px] text-muted-foreground hover:bg-muted/50 transition-colors">
                    Library
                </Link>

                {/* Search Bar - SO Style */}
                <div className="flex-1 max-w-[700px] relative px-2 group cursor-pointer" onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}>
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <div className="w-full bg-background border border-border rounded-[3px] py-1.5 pl-9 pr-4 text-[13px] text-muted-foreground flex justify-between items-center transition-all group-hover:border-primary">
                        <span>Search your library...</span>
                        <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded-[3px] border border-border bg-secondary text-[10px] font-bold">Ctrl+K</kbd>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-1 ml-auto">
                    <button
                        onClick={toggleTheme}
                        className="p-2 text-muted-foreground hover:bg-muted/50 rounded transition-colors"
                        title="Toggle appearance"
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    {user ? (
                        <div className="flex items-center gap-1">
                            <button className="p-2 text-muted-foreground hover:bg-muted/50 rounded transition-colors">
                                <Inbox size={18} />
                            </button>
                            <button className="p-2 text-muted-foreground hover:bg-muted/50 rounded transition-colors">
                                <Trophy size={18} />
                            </button>

                            <div className="relative ml-2" ref={profileRef}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-1 p-1 hover:bg-muted/50 rounded transition-colors"
                                >
                                    <div className="w-[26px] h-[26px] bg-primary rounded-[3px] flex items-center justify-center text-white text-[12px] font-bold overflow-hidden shadow-sm">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            user.username.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <ChevronDown size={12} className="text-muted-foreground" />
                                </button>

                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute right-0 top-full mt-2 w-48 bg-card border border-border shadow-lg py-1 z-[100] text-[13px] rounded-[3px]"
                                        >
                                            <div className="px-4 py-2 border-b border-border mb-1">
                                                <p className="font-bold text-foreground">{user.username}</p>
                                                <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                                            </div>
                                            <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="block px-4 py-1.5 text-foreground hover:bg-muted/50">
                                                Profile
                                            </Link>
                                            <button onClick={handleLogout} className="w-full text-left px-4 py-1.5 text-foreground hover:bg-muted/50">
                                                Log out
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link to="/login" className="px-3 py-1.5 text-[13px] text-primary hover:bg-primary/10 rounded transition-colors">Log in</Link>
                            <Link to="/register" className="so-btn so-btn-primary px-3 py-1.5">Sign up</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
