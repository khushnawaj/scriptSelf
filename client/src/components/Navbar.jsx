import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../features/auth/authSlice';
import { useTheme } from '../context/ThemeContext';
import {
    Search,
    Menu,
    X,
    Moon,
    Sun,
    LogOut,
    User,
    Code2,
    ChevronDown,
    Plus
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const Navbar = () => {
    const { user } = useSelector((state) => state.auth);
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);

    // Default Categories (Mocked for now, or match DB)
    // Default Categories
    const defaults = [
        { name: 'HTML', path: '/notes?category=HTML' },
        { name: 'CSS', path: '/notes?category=CSS' },
        { name: 'JavaScript', path: '/notes?category=JavaScript' },
        { name: 'React', path: '/notes?category=React' },
        { name: 'SQL', path: '/notes?category=SQL' },
        { name: 'Python', path: '/notes?category=Python' },
        { name: 'Java', path: '/notes?category=Java' },
        { name: 'Node.js', path: '/notes?category=Node.js' },
        { name: 'C++', path: '/notes?category=Cpp' },
        { name: 'C#', path: '/notes?category=Csharp' },
    ];

    // Split for responsive/dropdown
    const visibleCats = defaults.slice(0, 6);
    const moreCats = defaults.slice(6);
    const [isCatsOpen, setIsCatsOpen] = useState(false);
    const catsRef = useRef(null);

    // Click outside handler for cats
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (catsRef.current && !catsRef.current.contains(event.target)) {
                setIsCatsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        dispatch(reset());
        navigate('/login');
    };

    // Click outside to close profile dropdown
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
        <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border h-16">
            <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">

                {/* Logo & Category Links (Desktop) */}
                <div className="flex items-center gap-8">
                    <div onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer">
                        <div className="p-1.5 bg-primary rounded-lg text-primary-foreground">
                            <Code2 size={20} strokeWidth={2.5} />
                        </div>
                        <span className="text-xl font-bold tracking-tight">ScriptShelf</span>
                    </div>

                    <div className="hidden md:flex items-center gap-1">
                        {visibleCats.map((cat) => (
                            <button
                                key={cat.name}
                                onClick={() => navigate(cat.path)}
                                className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
                            >
                                {cat.name}
                            </button>
                        ))}

                        {/* More Dropdown */}
                        <div className="relative" ref={catsRef}>
                            <button
                                onClick={() => setIsCatsOpen(!isCatsOpen)}
                                className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors flex items-center gap-1"
                            >
                                More <ChevronDown size={14} className={isCatsOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
                            </button>

                            {isCatsOpen && (
                                <div className="absolute left-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-xl py-1 animate-in fade-in slide-in-from-top-2 z-50">
                                    {moreCats.map(cat => (
                                        <button
                                            key={cat.name}
                                            onClick={() => { navigate(cat.path); setIsCatsOpen(false); }}
                                            className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                    <div className="h-px bg-border my-1"></div>
                                    <button
                                        onClick={() => { navigate('/categories'); setIsCatsOpen(false); }}
                                        className="w-full text-left px-4 py-2 text-sm text-primary hover:bg-primary/10 transition-colors flex items-center gap-2 font-medium"
                                    >
                                        <Plus size={14} /> Add Category
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
                    >
                        {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>

                    {/* Search Trigger (Mobile mostly, or global) */}
                    <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors">
                        <Search size={20} />
                    </button>

                    {/* User Profile Dropdown */}
                    {user ? (
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2 hover:bg-muted/50 p-1.5 rounded-full transition-colors"
                            >
                                {user.avatar ? (
                                    <img
                                        src={user.avatar.startsWith('http') ? user.avatar : `/${user.avatar}`}
                                        alt={user.username}
                                        className="w-8 h-8 rounded-full object-cover shadow-sm ring-2 ring-background"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-500 text-white flex items-center justify-center text-xs font-bold shadow-sm ring-2 ring-background">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <ChevronDown size={14} className={`text-muted-foreground transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isProfileOpen && (
                                <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-xl py-2 animate-in fade-in slide-in-from-top-2">
                                    <div className="px-4 py-2 border-b border-border mb-2">
                                        <p className="text-sm font-semibold">{user.username}</p>
                                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                    </div>

                                    <button onClick={() => { navigate('/profile'); setIsProfileOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted flex items-center gap-2">
                                        <User size={16} /> My Profile
                                    </button>
                                    <button onClick={() => { navigate('/dashboard'); setIsProfileOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted flex items-center gap-2">
                                        <Code2 size={16} /> Dashboard
                                    </button>
                                    <button onClick={() => { navigate('/notes'); setIsProfileOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted flex items-center gap-2">
                                        <Code2 size={16} /> My Notes
                                    </button>

                                    <div className="h-px bg-border my-2"></div>

                                    <button onClick={() => handleLogout()} className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2">
                                        <LogOut size={16} /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            className="btn-premium-primary px-6"
                        >
                            Login
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
