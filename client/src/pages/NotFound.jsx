import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFound = () => {
    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full text-center space-y-8"
            >
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                    <AlertCircle size={120} className="text-primary relative z-10 mx-auto animate-bounce" />
                </div>

                <div className="space-y-4">
                    <h1 className="text-[80px] font-black text-foreground leading-none tracking-tighter">404</h1>
                    <h2 className="text-[24px] font-bold text-foreground">Record Not Found</h2>
                    <p className="text-muted-foreground text-[15px] leading-relaxed">
                        The technical documentation you are looking for has been moved, deleted, or never existed in this logic vault.
                    </p>
                </div>

                <div className="pt-6">
                    <Link
                        to="/dashboard"
                        className="so-btn so-btn-primary py-3 px-8 text-[15px] font-bold shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all"
                    >
                        <Home size={18} className="mr-2" /> Return to Command Center
                    </Link>
                </div>

                <p className="text-[11px] text-muted-foreground/50 uppercase tracking-[0.2em] font-bold">
                    System Error: ERR_LOGIC_VOID
                </p>
            </motion.div>
        </div>
    );
};

export default NotFound;
