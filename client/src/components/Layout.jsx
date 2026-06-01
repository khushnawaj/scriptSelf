import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import {
    Globe,
    LayoutGrid,
    FileText,
    Settings,
    Info,
    Users,
    Flag,
    MessageSquare,
    Terminal,
    Zap,
    X,
    BookOpen,
    Gamepad2,
    MessageCircle,
    Network,
    Rss,
    Trophy,
    ChevronLeft,
    ChevronRight,
    Activity,
    BarChart3,
    Command,
    Compass,
    Briefcase,
    HardDrive
} from 'lucide-react';

import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import TerminalConsole from './TerminalConsole';

const Layout = () => {
    const location = useLocation();
    const { user } = useSelector((state) => state.auth);
    const { notes } = useSelector((state) => state.notes);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isTerminalOpen, setIsTerminalOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(() => {
        return localStorage.getItem('sidebarCollapsed') === 'true';
    });
    const [isRightCollapsed, setIsRightCollapsed] = useState(() => {
        return localStorage.getItem('rightSidebarCollapsed') === 'true';
    });

    const toggleCollapse = () => {
        setIsCollapsed(prev => {
            const next = !prev;
            localStorage.setItem('sidebarCollapsed', next);
            return next;
        });
    };

    const toggleRightCollapse = () => {
        setIsRightCollapsed(prev => {
            const next = !prev;
            localStorage.setItem('rightSidebarCollapsed', next);
            return next;
        });
    };

    // Global Hotkeys
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Terminal shortcut
            if (e.altKey && e.key === 'Enter') {
                e.preventDefault();
                setIsTerminalOpen(prev => !prev);
            }
            // Sidebar collapse shortcut
            if (e.altKey && e.key === 's') {
                e.preventDefault();
                toggleCollapse();
            }
            // Right sidebar collapse shortcut
            if (e.altKey && e.key === 'i') {
                e.preventDefault();
                toggleRightCollapse();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    const NavItem = ({ to, icon: Icon, label, exact = false }) => {
        const isActive = exact ? location.pathname === to : location.pathname.startsWith(to);
        return (
            <Link
                to={to}
                title={isCollapsed ? label : ''}
                className={`flex items-center gap-3 py-2 px-3 text-[13px] border-r-4 transition-all ${isActive
                    ? 'bg-accent text-foreground font-semibold border-r-primary'
                    : 'text-muted-foreground border-r-transparent hover:text-foreground hover:bg-muted/30'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
                {Icon && <Icon size={18} className={`${isActive ? 'text-primary' : ''}`} />}
                {!isCollapsed && <span className="truncate">
                    {label}
                </span>}
            </Link>
        );
    };

    const IntelligenceWing = () => {
        const [leaders, setLeaders] = useState([]);
        const [loadingLeaders, setLoadingLeaders] = useState(false);

        useEffect(() => {
            const fetchLeaders = async () => {
                try {
                    setLoadingLeaders(true);
                    const res = await fetch('/api/v1/users/arcade/leaders/memory');
                    const json = await res.json();
                    if (json.success) {
                        setLeaders(json.data);
                    }
                } catch (err) {
                    console.error("Leaderboard fetch failed", err);
                } finally {
                    setLoadingLeaders(false);
                }
            };
            fetchLeaders();
        }, []);

        const isDashboard = location.pathname === '/dashboard';
        const isProfile = location.pathname === '/profile';
        const isArcade = location.pathname === '/arcade';
        const isCommunity = location.pathname === '/community';

        return (
            <div className="space-y-8">
                {/* Contextual Widget 1 */}
                {isDashboard || isProfile ? (
                    <div className="bg-primary/5 rounded-[1.5rem] p-5 border border-primary/10 space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-semibold text-primary  tracking-[0.2em]">Neural Output</h4>
                            <Activity size={14} className="text-primary " />
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <span className="text-[11px] text-muted-foreground font-semibold">Sync Rate</span>
                                <span className="text-[13px] font-semibold text-foreground">98.4%</span>
                            </div>
                            <div className="h-1 w-full bg-primary/10 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: '98.4%' }} className="h-full bg-primary" />
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-[11px] text-muted-foreground font-semibold">Node Uptime</span>
                                <span className="text-[13px] font-semibold text-foreground">12d 4h</span>
                            </div>
                        </div>
                    </div>
                ) : isArcade ? (
                    <div className="bg-orange-500/5 rounded-[1.5rem] p-5 border border-orange-500/10 space-y-4 overflow-hidden relative group">
                        
                        <div className="flex items-center justify-between relative z-10">
                            <h4 className="text-[10px] font-semibold text-orange-500  tracking-[0.2em]">Arcade Status</h4>
                            <Gamepad2 size={14} className="text-orange-500 " />
                        </div>
                        <div className="space-y-4 relative z-10">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-background/40 p-2 rounded-xl border border-white/5">
                                    <p className="text-[8px] text-muted-foreground font-semibold  tracking-widest">Active_Streak</p>
                                    <p className="text-[14px] font-semibold text-foreground">{user?.arcade?.streak || 0}d</p>
                                </div>
                                <div className="bg-background/40 p-2 rounded-xl border border-white/5">
                                    <p className="text-[8px] text-muted-foreground font-semibold  tracking-widest">Total_XP</p>
                                    <p className="text-[14px] font-semibold text-foreground">{user?.arcade?.points || 0}</p>
                                </div>
                            </div>
                            <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 group-hover:bg-primary/10 transition-colors">
                                <p className="text-[9px] font-semibold text-primary  mb-1">Global Rank</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-[14px] font-semibold">#142</span>
                                    <span className="text-[10px] text-emerald-500 font-semibold">Top 5%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : isCommunity ? (
                    <div className="bg-emerald-500/5 rounded-[1.5rem] p-5 border border-emerald-500/10 space-y-4 relative group">
                         
                         <div className="flex items-center justify-between relative z-10">
                            <h4 className="text-[10px] font-semibold text-emerald-500  tracking-[0.2em]">Community Pulse</h4>
                            <Activity size={14} className="text-emerald-500 " />
                        </div>
                        <div className="space-y-3 relative z-10">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] text-muted-foreground font-semibold">Signals / min</span>
                                <span className="text-[13px] font-semibold text-emerald-500">42</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] text-muted-foreground font-semibold">Active Syncs</span>
                                <span className="text-[13px] font-semibold text-foreground">1.2k</span>
                            </div>
                            <div className="flex -space-x-2 pt-2">
                                {[1,2,3,4,5].map(i => (
                                    <div key={i} className="w-7 h-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-semibold text-primary group-hover:scale-110 transition-transform">
                                        {String.fromCharCode(64 + i)}
                                    </div>
                                ))}
                                <div className="w-7 h-7 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[8px] font-semibold text-muted-foreground">
                                    +1k
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white/5 rounded-[1.5rem] overflow-hidden border border-white/10 group">
                        <div className="px-5 py-3 bg-primary/5 border-b border-white/5 text-[10px] font-semibold text-primary flex items-center gap-2  tracking-[0.2em]">
                            <Compass size={14} /> Discovery
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="group/item cursor-pointer">
                                <p className="text-[14px] text-foreground font-semibold group-hover/item:text-primary transition-colors leading-tight mb-1">Smart Connections</p>
                                <p className="text-[12px] text-muted-foreground leading-relaxed">Use brackets to link your notes together like a brain.</p>
                            </div>
                            <div className="group/item cursor-pointer">
                                <p className="text-[14px] text-foreground font-semibold group-hover/item:text-primary transition-colors leading-tight mb-1">Pro Search</p>
                                <p className="text-[12px] text-muted-foreground leading-relaxed">Combine tags to find any code snippet in milliseconds.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Second Widget */}
                {isArcade ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h4 className="text-[10px] font-semibold text-muted-foreground/40  tracking-[0.2em]">Top Players</h4>
                            <Trophy size={14} className="text-muted-foreground/30" />
                        </div>
                        <div className="space-y-2">
                            {leaders.length > 0 ? leaders.map((player, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-secondary/20 rounded-xl border border-transparent hover:border-border transition-all">
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[11px] font-semibold ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-slate-400' : 'text-orange-500'}`}>0{i+1}</span>
                                        <span className="text-[12px] font-semibold text-foreground">{player.username}</span>
                                    </div>
                                    <span className="text-[11px] font-semibold text-primary">{player.points > 999 ? `${(player.points/1000).toFixed(1)}k` : player.points}</span>
                                </div>
                            )) : loadingLeaders ? (
                                <div className="text-[11px] text-muted-foreground/50 italic px-3">Loading leaders...</div>
                            ) : (
                                <div className="text-[11px] text-muted-foreground/50 italic px-3">No data available.</div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h4 className="text-[10px] font-semibold text-muted-foreground/40  tracking-[0.2em]">Recent Access</h4>
                            <BarChart3 size={14} className="text-muted-foreground/30" />
                        </div>
                        <div className="space-y-2">
                            {notes?.slice(0, 4).map((note, i) => (
                                <Link key={i} to={`/notes/${note._id}`} className="flex flex-col gap-1 p-3 hover:bg-muted/30 rounded-[12px] border border-transparent hover:border-border transition-all group">
                                    <p className="text-[13px] font-semibold text-foreground group-hover:text-primary transition-colors truncate">{note.title}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold tracking-tighter ">{note.type || 'DOC'}</span>
                                        <span className="text-[10px] text-muted-foreground/50 font-medium">{new Date(note.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </Link>
                            ))}
                            {(!notes || notes.length === 0) && (
                                <p className="text-[11px] text-muted-foreground/50 italic px-3">No recent logs found.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Shortcuts Card */}
                <div className="p-6 bg-secondary/30 border border-border/50 rounded-[1.5rem] relative overflow-hidden group">
                    <Command size={40} className="absolute -right-4 -bottom-4 text-primary/5 group-hover:text-primary/10 transition-colors" />
                    <h4 className="text-[13px] font-semibold mb-4 flex items-center gap-2 text-foreground  tracking-tight">
                        <MessageSquare size={16} className="text-primary" /> Command Key
                    </h4>
                    <ul className="text-[12px] text-muted-foreground space-y-3.5 relative z-10">
                        <li className="flex items-center justify-between">
                            <span className="font-medium">Global Search</span>
                            <kbd className="px-2 py-0.5 bg-background border border-border rounded-[4px] text-[10px] font-semibold shadow-sm">CTRL+K</kbd>
                        </li>
                        <li className="flex items-center justify-between">
                            <span className="font-medium">Toggle Sidebar</span>
                            <kbd className="px-2 py-0.5 bg-background border border-border rounded-[4px] text-[10px] font-semibold shadow-sm">ALT+S</kbd>
                        </li>
                        <li className="flex items-center justify-between">
                            <span className="font-medium">Toggle Intelligence</span>
                            <kbd className="px-2 py-0.5 bg-background border border-border rounded-[4px] text-[10px] font-semibold shadow-sm">ALT+I</kbd>
                        </li>
                        <li className="flex items-center justify-between group/launch cursor-pointer" onClick={() => setIsTerminalOpen(true)}>
                            <span className="text-primary font-semibold group-hover/launch:underline">Neural Console</span>
                            <kbd className="px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-[4px] text-[10px] font-semibold shadow-sm">ALT+⏎</kbd>
                        </li>
                    </ul>
                </div>
            </div>
        );
    };

    const SidebarContent = () => (
        <div className="flex flex-col space-y-0.5">
            <NavItem to="/" label="Home" exact icon={Globe} />
            <NavItem to="/dashboard" label="Overview" icon={LayoutGrid} />

            {!isCollapsed ? (
                <div className="mt-6 mb-1 px-3 text-[10px] font-semibold  text-muted-foreground/40 tracking-[0.2em]">
                    Library
                </div>
            ) : (
                <div className="h-px bg-border/30 my-4 mx-4" />
            )}
            <NavItem to="/notes" label="All Notes" icon={FileText} />
            {user && <NavItem to="/files" label="Files" icon={HardDrive} />}
            {user && <NavItem to="/notes/new" label="New Note" icon={Zap} />}

            <NavItem to="/roadmap" label="Roadmap" icon={Network} />
            <NavItem to="/issues" label="Issues" icon={Flag} />


            {!isCollapsed ? (
                <div className="mt-6 mb-1 px-3 text-[10px] font-semibold  text-muted-foreground/40 tracking-[0.2em]">
                    Studio
                </div>
            ) : (
                <div className="h-px bg-border/30 my-4 mx-4" />
            )}
            <NavItem to="/playground" label="Playground" icon={Terminal} />
            <NavItem to="/arcade" label="Arcade" icon={Gamepad2} />
            <NavItem to="/jobs" label="Jobs" icon={Briefcase} />
            <NavItem to="/careers" label="Careers" icon={Users} />



            {!isCollapsed ? (
                <div className="mt-6 mb-1 px-3 text-[10px] font-semibold  text-muted-foreground/40 tracking-[0.2em]">
                    Connect
                </div>
            ) : (
                <div className="h-px bg-border/30 my-4 mx-4" />
            )}
            <NavItem to="/community" label="Community" icon={Globe} />
            <NavItem to="/network" label="Pulse Feed" icon={Rss} />
            {user && <NavItem to="/chat" label="Messages" icon={MessageCircle} />}

            {!isCollapsed ? (
                <div className="mt-6 mb-1 px-3 text-[10px] font-semibold  text-muted-foreground/40 tracking-[0.2em]">
                    System
                </div>
            ) : (
                <div className="h-px bg-border/30 my-4 mx-4" />
            )}
            {user && <NavItem to="/profile" label="Profile" icon={Users} />}
            {user?.role === 'admin' && <NavItem to="/admin" label="Console" icon={Settings} />}
            <NavItem to="/guide" label="Guide" icon={Info} />
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            key="overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] md:hidden"
                        />
                        <motion.div
                            key="sidebar"
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-[280px] bg-card border-r border-border z-[110] md:hidden p-6 pt-6 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                                <span className="font-semibold text-primary flex items-center gap-2 text-lg">
                                    <Zap size={22} /> script<span className="text-foreground">shelf.</span>
                                </span>
                                <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-muted/50 rounded-full transition-colors">
                                    <X size={20} className="text-muted-foreground" />
                                </button>
                            </div>
                            <SidebarContent />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <div className="max-w-[1800px] mx-auto w-full flex-1 flex mt-[64px]">
                {/* Desktop Sidebar */}
                <motion.aside
                    initial={false}
                    animate={{ width: isCollapsed ? 68 : 240 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="hidden md:block shrink-0 border-r border-border/50 sticky top-[64px] h-[calc(100vh-64px)] overflow-y-auto sidebar-glass z-40 group relative"
                >
                    {/* Holographic Overlays */}
                    
                    

                    <div className="flex flex-col h-full relative z-10">
                        {/* Collapse Toggle Button */}
                        <div className={`p-4 flex ${isCollapsed ? 'justify-center' : 'justify-end'} border-b border-border/10 mb-2`}>
                            <button
                                onClick={toggleCollapse}
                                className="p-1.5 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-lg transition-all"
                                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                            >
                                {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                            </button>
                        </div>

                        <div className={`${isCollapsed ? 'px-0' : 'px-4'} flex-1`}>
                            <SidebarContent />
                        </div>

                        {!isCollapsed && (
                            <div className="p-6 mt-auto border-t border-border/10">
                                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 relative overflow-hidden group/status">
                                    
                                    <p className="text-[10px] font-semibold text-primary  mb-1 relative z-10">Status</p>
                                    <div className="flex items-center gap-2 relative z-10">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 " />
                                        <span className="text-[11px] font-medium text-foreground">Neural Link Active</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.aside>

                {/* Main Content Area */}
                <main className={`flex-1 min-w-0 bg-background/30 backdrop-blur-3xl relative overflow-hidden ${location.pathname === '/playground' ? 'layout-full-width' : ''}`}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
                            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                            className="p-4 sm:p-8 h-full overflow-y-auto"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>

                {/* Right Sidebar - System Intelligence Wing */}
                <motion.aside
                    initial={false}
                    animate={{ 
                        width: isRightCollapsed ? 0 : 340,
                        opacity: isRightCollapsed ? 0 : 1,
                        padding: isRightCollapsed ? 0 : 32
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="hidden xl:block shrink-0 sticky top-[64px] h-[calc(100vh-64px)] overflow-y-auto border-l border-border/30 bg-background/20 backdrop-blur-sm z-30 relative group"
                >
                    {/* Holographic Overlays */}
                    
                    
                    
                    <div className="relative z-10 h-full">
                        <IntelligenceWing />
                    </div>
                </motion.aside>

                {/* Right Collapse Toggle (Floating) */}
                <div className="hidden xl:block fixed right-4 bottom-4 z-50">
                    <button
                        onClick={toggleRightCollapse}
                        className="p-3 bg-card border border-border shadow-2xl rounded-full text-muted-foreground hover:text-primary transition-all hover:scale-110 active:scale-95"
                        title={isRightCollapsed ? "Show Intelligence" : "Hide Intelligence"}
                    >
                        {isRightCollapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </button>
                </div>
            </div>
            <TerminalConsole isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} />
        </div>
    );
};

export default Layout;
