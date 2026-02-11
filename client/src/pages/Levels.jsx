
import { motion } from 'framer-motion';
import {
    Trophy, Zap, Star, Shield,
    ChevronRight, ArrowLeft, Info,
    Flame, Target, Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { REPUTATION_TIERS } from '../utils/reputation';

export default function Levels() {
    const xpRules = [
        { action: 'Create a Note', points: '+10 XP', desc: 'Capture new intelligence in your vault.' },
        { action: 'Go Public', points: '+5 XP', desc: 'Share a note with the community archive.' },
        { action: 'Arcade Victory', points: '+20 XP', desc: 'Win a session in the DevArcade.' },
        { action: 'Daily Streak', points: '+5 XP', desc: 'Maintain active brain-sync for 3+ days.' },
        { action: 'Collaboration', points: '+15 XP', desc: 'Forge a new connection with a developer.' }
    ];

    return (
        <div className="max-w-5xl mx-auto px-4 py-12 space-y-16 animate-in fade-in duration-700">
            {/* Header */}
            <header className="space-y-4 text-center sm:text-left">
                <Link to="/guide" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary text-[10px] font-black uppercase tracking-[0.2em] transition-all group mb-4">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> BACK TO GUIDE
                </Link>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-[10px] font-black uppercase tracking-[0.2em]">
                            <Trophy size={14} /> System Hierarchy
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-foreground uppercase">Reputation & Tiers</h1>
                        <p className="text-muted-foreground text-sm font-medium italic opacity-70">The rules of engagement for the ScriptShelf neural network.</p>
                    </div>
                </div>
            </header>

            {/* XP Section */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-4 space-y-8">
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold flex items-center gap-3">
                            <Zap size={24} className="text-primary" /> Earning Points
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Points (XP) represent your technical contribution and mastery. They are automatically calculated as you interact with the archive.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {xpRules.map((rule, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-4 bg-card border border-border rounded-xl flex items-center justify-between group hover:border-primary/30 transition-all hover:bg-primary/5"
                            >
                                <div className="space-y-0.5">
                                    <h4 className="font-bold text-xs uppercase tracking-wider">{rule.action}</h4>
                                    <p className="text-[10px] text-muted-foreground">{rule.desc}</p>
                                </div>
                                <span className="text-primary font-black text-xs">{rule.points}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Tiers Visualized */}
                <div className="lg:col-span-8 space-y-8">
                    <h3 className="text-xl font-bold flex items-center gap-3">
                        <Shield size={24} className="text-primary" /> Contributor Tiers
                    </h3>

                    <div className="space-y-4">
                        {REPUTATION_TIERS.map((tier, i) => (
                            <div key={i} className={`p-6 bg-card border border-border rounded-2xl relative overflow-hidden group hover:border-primary/40 transition-all ${tier.animate ? 'border-2 border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.1)]' : ''}`}>
                                <div className={`absolute top-0 right-0 w-32 h-full ${tier.bg} blur-3xl opacity-10 group-hover:opacity-20 transition-opacity`} />

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-2xl ${tier.bg} ${tier.border} border-2 flex items-center justify-center font-black text-2xl ${tier.color} shadow-lg`}>
                                            {tier.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className={`text-lg font-black uppercase tracking-tight ${tier.color}`}>{tier.name}</h4>
                                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                                Range: {tier.min} - {tier.max === Infinity ? '∞' : tier.max} XP
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                                        <div className="flex gap-2">
                                            {i >= 1 && <span className="bg-emerald-500/10 text-emerald-500 text-[8px] font-black px-2 py-0.5 rounded border border-emerald-500/20 uppercase">Network Access</span>}
                                            {i >= 3 && <span className="bg-primary/10 text-primary text-[8px] font-black px-2 py-0.5 rounded border border-primary/20 uppercase">Neural Graph</span>}
                                            {i === 4 && <span className="bg-rose-500/10 text-rose-500 text-[8px] font-black px-2 py-0.5 rounded border border-rose-500/20 uppercase">Custom FX</span>}
                                        </div>
                                        <p className="text-[11px] text-muted-foreground/60 italic font-medium">
                                            {i === 0 && "Your journey as an archivist begins here."}
                                            {i === 1 && "Unlocked social linking and profile personalization."}
                                            {i === 2 && "Advanced recognition in the community feed."}
                                            {i === 3 && "Full access to visual intelligence mapping."}
                                            {i === 4 && "The highest honor. Master of the Neural Archive."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Rewards System */}
            <section className="bg-primary/5 border border-primary/20 rounded-3xl p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -translate-y-1/2 translate-x-1/2" />

                <div className="max-w-2xl space-y-6 relative z-10 text-left">
                    <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">Reward Protocol</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                        <div className="space-y-3">
                            <h4 className="flex items-center gap-2 font-bold text-primary italic">
                                <Target size={16} /> Digital Status
                            </h4>
                            <p className="text-muted-foreground leading-relaxed">
                                Levels are permanent. Once you unlock a tier, your status is etched into the blockchain-style archive.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <h4 className="flex items-center gap-2 font-bold text-primary italic">
                                <Award size={16} /> Technical Credits
                            </h4>
                            <p className="text-muted-foreground leading-relaxed">
                                High-tier users (Expert+) gain priority listing in the global directory and enhanced visual presence.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <div className="flex flex-col items-center gap-4 py-8 border-t border-border/50">
                <Info size={24} className="text-muted-foreground opacity-20" />
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest text-center">
                    Questions? Check the official <Link to="/guide" className="text-primary hover:underline">Documentation Guide</Link>
                </p>
            </div>
        </div>
    );
}
