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
    X
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
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-200">
            <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] md:hidden"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-[240px] bg-card border-r border-border z-[70] md:hidden p-4 pt-4 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                                <span className="font-bold text-primary flex items-center gap-2">
                                    <Zap size={18} /> ScriptShelf
                                </span>
                                <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-muted/50 rounded transition-colors">
                                    <X size={20} className="text-muted-foreground" />
                                </button>
                            </div>
                            <SidebarContent />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <div className="max-w-[1500px] mx-auto w-full flex-1 flex mt-[50px]">
                {/* Desktop Sidebar */}
                <aside className="hidden md:block w-[170px] shrink-0 border-r border-border pt-6 sticky top-[50px] h-[calc(100vh-50px)] overflow-y-auto">
                    <SidebarContent />
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 p-6 border-l border-border min-w-0 bg-background/50">
                    <Outlet />
                </main>

                {/* Right Sidebar */}
                <aside className="hidden lg:block w-[300px] shrink-0 p-6 space-y-6">
                    {/* System Blog/News Card */}
                    <div className="bg-accent/40 border border-primary/20 rounded-[3px] shadow-sm">
                        <div className="px-3 py-2 bg-primary/10 border-b border-primary/20 text-[12px] font-bold text-foreground flex items-center gap-2 uppercase tracking-wide">
                            <Terminal size={12} className="text-primary" /> System Broadcast
                        </div>
                        <div className="p-3 text-[12px] text-muted-foreground space-y-3">
                            <div className="group cursor-pointer">
                                <p className="text-foreground font-medium group-hover:text-primary transition-colors">Markdown Mastery</p>
                                <p className="text-[11px] opacity-70">Use Split View for real-time logic documentation.</p>
                            </div>
                            <div className="group cursor-pointer">
                                <p className="text-foreground font-medium group-hover:text-primary transition-colors">Vault Isolation</p>
                                <p className="text-[11px] opacity-70">Unchecked 'Public Post' keeps data in your private vault.</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats/Metrics Preview */}
                    <div className="border border-border rounded-[3px] overflow-hidden">
                        <h4 className="px-3 py-2 bg-muted/30 text-[12px] font-bold text-foreground border-b border-border uppercase tracking-wide">Recent Context</h4>
                        <div className="p-3 space-y-3">
                            {notes?.slice(0, 3).map((note, i) => (
                                <Link key={i} to={`/notes/${note._id}`} className="block group">
                                    <p className="text-[13px] text-link group-hover:underline truncate">{note.title}</p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">{new Date(note.createdAt).toLocaleDateString()}</p>
                                </Link>
                            ))}
                            <Link to="/notes" className="block text-[11px] text-link hover:underline mt-2">View full archive →</Link>
                        </div>
                    </div>

                    {/* Quick Help */}
                    <div className="p-4 bg-muted/20 border border-dashed border-border rounded-[3px]">
                        <h4 className="text-[13px] font-bold mb-2 flex items-center gap-2">
                            <MessageSquare size={14} className="text-primary" /> Shortcut Tips
                        </h4>
                        <ul className="text-[11px] text-muted-foreground space-y-1 ml-4 list-disc">
                            <li>Press <kbd className="px-1 bg-card border border-border rounded">Ctrl+K</kbd> to search anywhere.</li>
                            <li>Use <kbd className="px-1 bg-card border border-border rounded">Esc</kbd> to exit modals.</li>
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default Layout;
