import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    ArrowRight,
    Layers,
    Shield,
    Search,
    Terminal,
    Cpu,
    Zap,
    Code2,
    Database,
    ChevronRight,
    Activity,
    Lock
} from "lucide-react";

/* ---------------------------------------
   Animations
--------------------------------------- */
const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

/* ---------------------------------------
   Small reusable feature card component
--------------------------------------- */
const FeatureCard = ({ icon: Icon, title, desc, delay = 0 }) => (
    <motion.div
        variants={fadeInUp}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        transition={{ delay }}
        className="group relative bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-xl hover:border-primary/40 hover:-translate-y-2 transition-all duration-500 overflow-hidden"
    >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-all">
                <Icon size={24} />
            </div>
            <h3 className="font-bold text-xl mb-3 text-white group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-zinc-400 text-[15px] leading-relaxed">{desc}</p>
            <div className="mt-6 flex items-center gap-2 text-[12px] font-black text-primary uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all">
                Learn More <ChevronRight size={14} />
            </div>
        </div>
    </motion.div>
);

/* ---------------------------------------
   HOME
--------------------------------------- */
const Home = () => {
    const { isAuthenticated } = useSelector((state) => state.auth);

    return (
        <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden selection:bg-primary/30 selection:text-primary">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[60%] bg-primary/20 blur-[150px] rounded-full opacity-40 animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full opacity-30" />
            </div>

            {/* Hero Section */}
            <section className="relative pt-24 sm:pt-32 lg:pt-48 pb-20 px-4 sm:px-6">
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="max-w-7xl mx-auto text-center space-y-12"
                >
                    <motion.div variants={fadeInUp} className="flex justify-center">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            <span className="text-[10px] md:text-[11px] font-black tracking-[0.3em] uppercase text-zinc-400">
                                Your Secure Code Vault
                            </span>
                        </div>
                    </motion.div>

                    <motion.h1
                        variants={fadeInUp}
                        className="font-black leading-[1.05] tracking-tight text-[clamp(2.5rem,8vw,6.5rem)]"
                    >
                        Store your <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-cyan-400 italic">best ideas</span>
                    </motion.h1>

                    <motion.p
                        variants={fadeInUp}
                        className="max-w-2xl mx-auto text-zinc-400 text-[clamp(1rem,2.8vw,1.35rem)] font-light leading-relaxed px-4"
                    >
                        Stop losing your best code in random notes. Store, link, and
                        protect your work in one fast, private repository.
                    </motion.p>

                    <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                        {isAuthenticated ? (
                            <Link to="/dashboard" className="group h-14 px-10 rounded-2xl bg-primary flex items-center justify-center gap-3 font-bold text-[16px] shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)] hover:scale-105 transition-all">
                                Go to Dashboard <ArrowRight size={20} />
                            </Link>
                        ) : (
                            <>
                                <Link to="/register" className="h-14 px-10 rounded-2xl bg-white text-black font-bold text-[16px] flex items-center justify-center hover:scale-105 transition-all">
                                    Get Started
                                </Link>
                                <Link to="/guide" className="h-14 px-10 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 font-bold text-[16px] flex items-center justify-center transition-all">
                                    How it Works
                                </Link>
                            </>
                        )}
                    </motion.div>

                    {/* Mockup */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="mt-24 relative max-w-5xl mx-auto px-2"
                    >
                        <div className="absolute -inset-4 bg-primary/20 blur-[80px] rounded-full opacity-30 -z-10" />
                        <div className="rounded-3xl bg-[#0b1120]/90 border border-white/10 shadow-2xl overflow-hidden backdrop-blur-3xl aspect-[16/10] md:aspect-video">
                            <div className="h-10 md:h-12 bg-white/5 border-b border-white/10 flex items-center justify-between px-4 md:px-6">
                                <div className="flex gap-2">
                                    <span className="w-2.5 h-2.5 bg-rose-500/80 rounded-full" />
                                    <span className="w-2.5 h-2.5 bg-amber-400/80 rounded-full" />
                                    <span className="w-2.5 h-2.5 bg-emerald-400/80 rounded-full" />
                                </div>
                                <div className="text-[9px] md:text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase">Preview Mode // console.sh</div>
                            </div>

                            <div className="grid grid-cols-12 h-full">
                                <div className="hidden md:block col-span-3 border-r border-white/5 p-6 space-y-4 text-left">
                                    {[
                                        { icon: Activity, label: "Status" },
                                        { icon: Layers, label: "Your Nodes" },
                                        { icon: Search, label: "Search" },
                                        { icon: Lock, label: "Vault" }
                                    ].map((item, i) => (
                                        <div key={i} className={`flex items-center gap-3 text-[11px] font-bold ${i === 0 ? 'text-primary' : 'text-zinc-500'}`}>
                                            <item.icon size={14} /> {item.label}
                                        </div>
                                    ))}
                                    <div className="pt-10">
                                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary w-[65%] animate-pulse" />
                                        </div>
                                        <div className="text-[8px] text-zinc-600 mt-2 text-left">SYNCING DATA... 65%</div>
                                    </div>
                                </div>
                                <div className="col-span-12 md:col-span-9 p-6 md:p-10 font-mono text-[12px] md:text-[15px] text-zinc-300 space-y-4 overflow-hidden text-left">
                                    <div className="flex items-center gap-4 text-emerald-400">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                                        <span># SYSTEM: CONNECTED</span>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-zinc-500 italic">// Starting your session...</p>
                                        <p>$ scriptshelf --start --sync-all</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-primary font-bold">{">>"}</span>
                                            <span className="animate-pulse">Fetching your notes... [12,482 items]</span>
                                        </div>
                                        <p className="pt-4">Everything is ready. Your vault is safe.</p>
                                        <p className="text-zinc-500">Security check: <span className="text-primary font-bold">PASSED</span></p>
                                    </div>
                                    <div className="pt-8 grid grid-cols-2 gap-4">
                                        <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                                            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Search Speed</div>
                                            <div className="text-2xl font-black text-white italic">0.01s</div>
                                        </div>
                                        <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                                            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Total Vaults</div>
                                            <div className="text-2xl font-black text-primary italic">10GB+</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section className="py-32 px-4 sm:px-6 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="max-w-7xl mx-auto space-y-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center space-y-4"
                    >
                        <h2 className="font-black text-[clamp(2rem,5vw,3.5rem)] tracking-tight text-white">What you can do</h2>
                        <div className="h-1.5 w-24 bg-primary mx-auto rounded-full" />
                    </motion.div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 text-left">
                        <FeatureCard icon={Layers} title="Linked Notes" desc="Connect your notes together using simple links. Build your own brain of knowledge that grows with you." delay={0.1} />
                        <FeatureCard icon={Shield} title="Private Vaults" desc="Keep your most important code and documents hidden. Your data is encrypted and completely private." delay={0.2} />
                        <FeatureCard icon={Search} title="Instant Search" desc="Find any note or code snippet in milliseconds. Stop wasting time looking for that one old script." delay={0.3} />
                        <FeatureCard icon={Zap} title="Earn Rewards" desc="Build a profile that shows off your knowledge. Level up as you document more and share with others." delay={0.4} />
                        <FeatureCard icon={Database} title="Easy Templates" desc="Don't start from scratch. Use templates to organize your thoughts and save time on every task." delay={0.5} />
                        <FeatureCard icon={Code2} title="Smart Editor" desc="Write beautiful notes with code support, images, and live previews. Built for people who love to build." delay={0.6} />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-32 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative rounded-[2rem] md:rounded-[3rem] bg-gradient-to-br from-primary/20 via-[#0b1120]/80 to-blue-900/10 border border-white/10 p-10 md:p-24 overflow-hidden text-center backdrop-blur-3xl"
                    >
                        <div className="relative z-10 space-y-10">
                            <h2 className="font-black text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.9] tracking-tighter text-white">Build your <br /><span className="text-primary italic">digital legacy</span></h2>
                            <p className="max-w-xl mx-auto text-zinc-400 text-lg md:text-xl font-light">Your ideas deserve a permanent home. Join a community of developers building the future of knowledge.</p>
                            <div className="pt-6">
                                <Link to="/register" className="inline-flex h-16 px-12 rounded-2xl bg-white text-black font-black text-lg items-center justify-center hover:scale-110 shadow-2xl transition-all">
                                    Join Now <Zap className="ml-3 text-primary" size={20} />
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative pt-20 pb-12 px-4 sm:px-6 border-t border-white/5 bg-[#020617]">
                <div className="max-w-7xl mx-auto space-y-16">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-24 text-left">
                        <div className="sm:col-span-2 space-y-8 text-left">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black text-xl shadow-lg">S</div>
                                <span className="text-2xl font-black tracking-tighter">ScriptShelf<span className="text-primary">.</span></span>
                            </div>
                            <p className="text-zinc-500 max-w-sm leading-relaxed text-[16px] text-left">
                                The best place to store and organize your code. Built for developers who want to keep their knowledge safe and easy to find.
                            </p>
                        </div>
                        <div className="space-y-6 text-left">
                            <h4 className="text-[12px] font-black uppercase tracking-[0.3em] text-zinc-300 text-left">Quick Links</h4>
                            <ul className="space-y-4 text-[15px] text-zinc-500 text-left">
                                <li><Link to="/guide" className="hover:text-primary transition-colors">How it works</Link></li>
                                <li><Link to="/notes" className="hover:text-primary transition-colors">Archive</Link></li>
                                <li><Link to="/arcade" className="hover:text-primary transition-colors">Arcade</Link></li>
                            </ul>
                        </div>
                        <div className="space-y-6 text-left">
                            <h4 className="text-[12px] font-black uppercase tracking-[0.3em] text-zinc-300 text-left">Company</h4>
                            <ul className="space-y-4 text-[15px] text-zinc-500 text-left">
                                <li><Link to="/terms" className="hover:text-primary transition-colors">Terms</Link></li>
                                <li><Link to="/terms" className="hover:text-primary transition-colors">Privacy</Link></li>
                                <li><Link to="/terms" className="hover:text-primary transition-colors">Security</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-10 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6 text-[12px] text-zinc-600 font-medium">
                        <p>© 2026 ScriptShelf. All your code is safe.</p>
                        <div className="flex items-center gap-8 font-mono">
                            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />SYSTEM: READY</span>
                            <span className="flex items-center gap-2"><Terminal size={14} /> SCRIPTSHELF_V2</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
