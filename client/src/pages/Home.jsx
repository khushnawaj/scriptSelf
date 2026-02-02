import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Code2,
    MessageSquare,
    Layers,
    Globe,
    Cpu,
    ShieldCheck,
    Quote,
    ArrowRight
} from 'lucide-react';

const Home = () => {
    const { isAuthenticated } = useSelector((state) => state.auth);

    return (
        <div className="flex flex-col -m-6 min-h-screen">
            {/* Hero Section - Dynamic & Theme Aware */}
            <div className="bg-[#2d2d2d] dark:bg-[#1b1b1b] text-white py-24 px-6 text-center relative overflow-hidden transition-colors duration-500">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-[50%] h-full bg-[#808000] opacity-10 blur-[120px] rounded-full translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[30%] h-full bg-[#808000] opacity-5 blur-[100px] rounded-full -translate-x-1/2" />

                <div className="relative z-10 max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#808000]/20 border border-[#808000]/30 rounded-full text-[#c5c58d] text-[12px] font-bold uppercase tracking-widest mb-6 animate-pulse">
                        <Cpu size={14} /> The Future of Documentation
                    </div>
                    <h1 className="text-[48px] sm:text-[64px] font-bold leading-[1.1] mb-8 tracking-tight">
                        Every <span className="text-[#808000]">logic</span> deserves <br className="hidden sm:block" />
                        permanent storage.
                    </h1>
                    <p className="text-[19px] sm:text-[21px] text-zinc-300 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
                        ScriptShelf is a documentation-first platform for technical archetypes.
                        Capture your logic once, retrieve it everywhere.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        {isAuthenticated ? (
                            <Link to="/dashboard" className="so-btn so-btn-primary py-4 px-10 text-[16px] font-bold shadow-xl shadow-[#808000]/20 transition-all hover:-translate-y-1">
                                Go to System Console <ArrowRight size={18} className="ml-2" />
                            </Link>
                        ) : (
                            <>
                                <Link to="/register" className="so-btn so-btn-primary py-4 px-10 text-[16px] font-bold shadow-xl shadow-[#808000]/20 transition-all hover:-translate-y-1">
                                    Initialize My Vault
                                </Link>
                                <Link to="/login" className="so-btn bg-white text-[#1b1b1b] hover:bg-zinc-100 py-4 px-10 text-[16px] font-bold transition-all hover:-translate-y-1">
                                    Access Archive
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Feature Blocks */}
            <div className="max-w-7xl mx-auto py-24 px-6 grid grid-cols-1 md:grid-cols-3 gap-16">
                <div className="group">
                    <div className="w-14 h-14 bg-[#eff1e1] dark:bg-[#2d2d2d] text-[#808000] rounded-[3px] flex items-center justify-center mb-6 group-hover:bg-[#808000] group-hover:text-white transition-all transform group-hover:rotate-6 shadow-sm border border-border">
                        <MessageSquare size={28} />
                    </div>
                    <h3 className="text-[21px] font-bold mb-4 text-foreground">Pattern Explanation</h3>
                    <p className="text-[15px] text-muted-foreground leading-relaxed">
                        Don't just paste code. Document the *rationale* behind every architectural decision. Our Markdown engine is optimized for developer context.
                    </p>
                </div>
                <div className="group">
                    <div className="w-14 h-14 bg-[#eff1e1] dark:bg-[#2d2d2d] text-[#808000] rounded-[3px] flex items-center justify-center mb-6 group-hover:bg-[#808000] group-hover:text-white transition-all transform group-hover:rotate-6 shadow-sm border border-border">
                        <Layers size={28} />
                    </div>
                    <h3 className="text-[21px] font-bold mb-4 text-foreground">Tag Categorization</h3>
                    <p className="text-[15px] text-muted-foreground leading-relaxed">
                        Structure your knowledge into reusable patterns. Filter by tags to find implementation details for Auth, DB, or API layers in milliseconds.
                    </p>
                </div>
                <div className="group">
                    <div className="w-14 h-14 bg-[#eff1e1] dark:bg-[#2d2d2d] text-[#808000] rounded-[3px] flex items-center justify-center mb-6 group-hover:bg-[#808000] group-hover:text-white transition-all transform group-hover:rotate-6 shadow-sm border border-border">
                        <ShieldCheck size={28} />
                    </div>
                    <h3 className="text-[21px] font-bold mb-4 text-foreground">Private Archival</h3>
                    <p className="text-[15px] text-muted-foreground leading-relaxed">
                        Secure your proprietary logic. Choose between public sharing for community reputation or private vaulting for your own technical legacy.
                    </p>
                </div>
            </div>

            {/* Content Divider */}
            <div className="bg-muted/30 border-y border-border py-24">
                <div className="max-w-5xl mx-auto px-6 flex flex-col items-center text-center space-y-8">
                    <Globe size={48} className="text-[#808000]" />
                    <h2 className="text-[38px] font-bold text-foreground max-w-3xl leading-tight">
                        The ultimate repository for <br className="hidden sm:block" /> high-searchability technical logic.
                    </h2>
                    <p className="text-[18px] text-muted-foreground max-w-2xl font-light">
                        Stop hunting through old commits and Slack history. ScriptShelf provides a clinical,
                        high-speed environment for recalling your best work anytime, anywhere.
                    </p>
                    <div className="pt-6">
                        <Link to="/register" className="text-[16px] font-bold text-link hover:text-link-hover flex items-center gap-2 transition-colors">
                            Build your legacy today <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
