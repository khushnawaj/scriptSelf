import React from 'react';
import { motion } from 'framer-motion';
import { Users, Sparkles, Code2, Heart } from 'lucide-react';

const Careers = () => {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl min-h-[calc(100vh-100px)] flex flex-col items-center justify-center text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-10 md:p-16 shadow-lg max-w-2xl w-full relative overflow-hidden"
      >
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-b from-[var(--primary)]/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <motion.div 
            animate={{ 
              y: [0, -10, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            className="w-24 h-24 bg-[var(--background)] rounded-2xl flex items-center justify-center shadow-inner border border-[var(--border)] mb-8"
          >
            <Users className="w-12 h-12 text-[var(--primary)]" />
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-4 tracking-tight">
            We Are Hiring!
          </h1>
          
          <div className="inline-flex items-center gap-2 bg-[var(--primary)]/10 text-[var(--primary)] px-4 py-1.5 rounded-full text-sm font-bold border border-[var(--primary)]/20 mb-8 uppercase tracking-widest">
            <Sparkles className="w-4 h-4" /> Feature Upcoming
          </div>

          <p className="text-lg text-[var(--text-muted)] mb-10 max-w-lg leading-relaxed">
            We're building the future of engineering workflows. Soon, we'll be opening up applications for roles across engineering, product, and design. Stay tuned to join our mission!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <div className="bg-[var(--background)] p-4 rounded-xl border border-[var(--border)] flex items-center gap-3 text-left">
              <div className="p-2 bg-[var(--card)] rounded-lg text-emerald-500"><Code2 className="w-5 h-5" /></div>
              <div>
                <div className="font-bold text-[var(--foreground)] text-sm">Engineering Hub</div>
                <div className="text-xs text-[var(--text-muted)]">Work on complex challenges</div>
              </div>
            </div>
            <div className="bg-[var(--background)] p-4 rounded-xl border border-[var(--border)] flex items-center gap-3 text-left">
              <div className="p-2 bg-[var(--card)] rounded-lg text-rose-500"><Heart className="w-5 h-5" /></div>
              <div>
                <div className="font-bold text-[var(--foreground)] text-sm">Great Culture</div>
                <div className="text-xs text-[var(--text-muted)]">Remote-first & inclusive</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Careers;
