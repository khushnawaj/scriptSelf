import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, Command, Zap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ShortcutManager = () => {
    const navigate = useNavigate();
    const { toggleTheme, theme } = useTheme();
    const [showHelp, setShowHelp] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Don't trigger if user is typing in an input or textarea
            if (
                document.activeElement.tagName === 'INPUT' ||
                document.activeElement.tagName === 'TEXTAREA' ||
                document.activeElement.isContentEditable
            ) {
                return;
            }

            // Alt + Key Shortcuts
            if (e.altKey) {
                switch (e.key.toLowerCase()) {
                    case 'd':
                        e.preventDefault();
                        navigate('/dashboard');
                        break;
                    case 'n':
                        e.preventDefault();
                        navigate('/notes/new');
                        break;
                    case 'l':
                        e.preventDefault();
                        navigate('/notes');
                        break;
                    case 'a':
                        e.preventDefault();
                        navigate('/arcade');
                        break;
                    case 'p':
                        e.preventDefault();
                        navigate('/profile');
                        break;
                    case 'g':
                        e.preventDefault();
                        navigate('/guide');
                        break;
                    case 'x':
                        e.preventDefault();
                        navigate('/playground');
                        break;
                    case 'c':
                        e.preventDefault();
                        navigate('/chat');
                        break;
                    case 'm':
                        e.preventDefault();
                        navigate('/community');
                        break;
                    case 'i':
                        e.preventDefault();
                        navigate('/issues');
                        break;
                    case 'z':
                        e.preventDefault();
                        const isZen = document.body.classList.toggle('zen-mode');
                        // Fire resize events repeatedly to catch end of transitions
                        [10, 100, 300, 500].forEach(t => setTimeout(() => window.dispatchEvent(new Event('resize')), t));
                        toast.success(isZen ? 'Zen Mode Enabled' : 'Normal View Restored');
                        break;
                    case 't':
                        e.preventDefault();
                        toggleTheme();
                        toast.success(`Theme switched to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`);
                        break;
                    default:
                        break;
                }
            }

            // Global Help Shortcut (?)
            if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
                e.preventDefault();
                setShowHelp(prev => !prev);
            }

            if (e.key === 'Escape') {
                setShowHelp(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigate, toggleTheme, theme]);

    const shortcuts = [
        { key: 'Alt + D', desc: 'Navigate to Dashboard' },
        { key: 'Alt + N', desc: 'Create New Record' },
        { key: 'Alt + L', desc: 'Open Knowledge Library' },
        { key: 'Alt + A', desc: 'Initialize Arcade' },
        { key: 'Alt + Z', desc: 'Toggle Zen Mode (Hider)' },
        { key: 'Alt + P', desc: 'View Profile Status' },
        { key: 'Alt + G', desc: 'Open Document Guide' },
        { key: 'Alt + X', desc: 'Launch Playground' },
        { key: 'Alt + C', desc: 'Open Global Chat' },
        { key: 'Alt + M', desc: 'View Community Feed' },
        { key: 'Alt + I', desc: 'Report Issues' },
        { key: 'Alt + T', desc: 'Toggle System Theme' },
        { key: '?', desc: 'Toggle this Help Menu' },
    ];

    return (
        <AnimatePresence>
            {showHelp && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-full max-w-lg bg-card border border-border rounded-[4px] shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-border bg-muted/20 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-[2px] text-primary">
                                    <Keyboard size={20} />
                                </div>
                                <div>
                                    <h3 className="text-[14px] font-black uppercase tracking-widest">Tactical_Shortcuts</h3>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">Accelerate your navigation protocol</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowHelp(false)}
                                className="text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest border border-border px-2 py-1 rounded-[2px] transition-colors"
                            >
                                Esc_to_Close
                            </button>
                        </div>

                        {/* List */}
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {shortcuts.map((s, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-muted/10 border border-border/50 rounded-[3px] group hover:border-primary/30 transition-colors">
                                    <span className="text-[12px] text-muted-foreground group-hover:text-foreground transition-colors">{s.desc}</span>
                                    <kbd className="px-2 py-1 bg-background border border-border rounded-[4px] text-[10px] font-black text-primary shadow-sm min-w-[60px] text-center">
                                        {s.key}
                                    </kbd>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-primary/5 border-t border-border flex items-center justify-center gap-2">
                            <Zap size={14} className="text-primary" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80">Pro_WorkflowActive</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ShortcutManager;
