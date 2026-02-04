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
    Gamepad2
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = () => {
    const location = useLocation();
    const { notes } = useSelector((state) => state.notes);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    const NavItem = ({ to, icon: Icon, label, exact = false }) => {
        const isActive = exact ? location.pathname === to : location.pathname.startsWith(to);
        return (
            <Link
                to={to}
                className={`flex items-center gap-2 py-2 px-2 text-[13px] border-r-4 transition-all ${isActive
                    ? 'bg-accent text-foreground font-bold border-r-primary'
                    : 'text-muted-foreground border-r-transparent hover:text-foreground'
                    }`}
            >
                {Icon && <Icon size={14} />}
                <span>{label}</span>
            </Link>
        );
    };

    const SidebarContent = () => (
        <div className="flex flex-col">
            <NavItem to="/" label="Home" exact icon={Globe} />

            <div className="mt-4 mb-2 px-2 text-[11px] font-bold uppercase text-muted-foreground/60 tracking-widest">
                Public
            </div>
            <NavItem to="/notes" label="Library" icon={FileText} />
            <NavItem to="/categories" label="Tags" icon={LayoutGrid} />
            <NavItem to="/dashboard" label="Stats" icon={Flag} />

            <div className="mt-4 mb-2 px-2 text-[11px] font-bold uppercase text-muted-foreground/60 tracking-widest">
                Personal
            </div>
            <NavItem to="/profile" label="Profile" icon={Users} />
            <NavItem to="/notes/new" label="New Record" icon={Zap} />
            <NavItem to="/arcade" label="Arcade" icon={Gamepad2} />
            <NavItem to="/guide" label="Learn" icon={BookOpen} />
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col transition-all duration-500">
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
                                <span className="font-bold text-primary flex items-center gap-2 text-lg">
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
                <aside className="hidden md:block w-[200px] shrink-0 border-r border-border/50 pt-8 sticky top-[64px] h-[calc(100vh-64px)] overflow-y-auto sidebar-glass">
                    <div className="px-4">
                        <SidebarContent />
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 p-4 sm:p-8 border-l border-border/10 min-w-0 bg-background/30 backdrop-blur-3xl">
                    <Outlet />
                </main>

                {/* Right Sidebar - System Intelligence Wing */}
                <aside className="hidden xl:block w-[340px] shrink-0 p-8 space-y-8 sticky top-[64px] h-[calc(100vh-64px)] overflow-y-auto border-l border-border/30">
                    {/* System Blog/News Card */}
                    <div className="glass-morphism rounded-[12px] overflow-hidden shadow-xl shadow-primary/5">
                        <div className="px-5 py-3 bg-primary/5 border-b border-border/50 text-[11px] font-bold text-primary flex items-center gap-2 uppercase tracking-[0.2em]">
                            <Terminal size={14} /> Intelligence Feed
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="group cursor-pointer">
                                <p className="text-[14px] text-foreground font-bold group-hover:text-primary transition-colors leading-tight mb-1">Advanced Knowledge Graph</p>
                                <p className="text-[12px] text-muted-foreground leading-relaxed">Bidirectional links allow you to map logic like a neural network.</p>
                            </div>
                            <div className="group cursor-pointer">
                                <p className="text-[14px] text-foreground font-bold group-hover:text-primary transition-colors leading-tight mb-1">Pro Search Operators</p>
                                <p className="text-[12px] text-muted-foreground leading-relaxed">Combine tags and specific ADR statuses for surgical search precision.</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats/Metrics Preview */}
                    <div className="space-y-4">
                        <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">Memory Stream</h4>
                        <div className="space-y-2">
                            {notes?.slice(0, 4).map((note, i) => (
                                <Link key={i} to={`/notes/${note._id}`} className="flex flex-col gap-1 p-3 hover:bg-muted/50 rounded-[10px] border border-transparent hover:border-border transition-all group">
                                    <p className="text-[13px] font-bold text-foreground group-hover:text-primary transition-colors truncate">{note.title}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground uppercase font-bold">{note.type || 'DOC'}</span>
                                        <span className="text-[11px] text-muted-foreground/50">{new Date(note.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <Link to="/notes" className="block text-[12px] font-bold text-primary hover:underline px-1 mt-2">Access Full Archive →</Link>
                    </div>

                    {/* Quick Help */}
                    <div className="p-5 bg-secondary/30 border border-border/50 rounded-[12px]">
                        <h4 className="text-[13px] font-bold mb-3 flex items-center gap-2 text-foreground">
                            <MessageSquare size={16} className="text-primary" /> Core Shortcuts
                        </h4>
                        <ul className="text-[12px] text-muted-foreground space-y-3">
                            <li className="flex items-center justify-between">
                                <span>Global Search</span>
                                <kbd className="px-2 py-0.5 bg-background border border-border rounded-[4px] text-[10px] font-bold shadow-sm">⌘K</kbd>
                            </li>
                            <li className="flex items-center justify-between">
                                <span>Close Active UI</span>
                                <kbd className="px-2 py-0.5 bg-background border border-border rounded-[4px] text-[10px] font-bold shadow-sm">ESC</kbd>
                            </li>
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default Layout;
