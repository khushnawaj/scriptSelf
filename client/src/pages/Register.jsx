import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, reset } from '../features/auth/authSlice';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
    Code2,
    MessageSquare,
    Folders,
    Trophy,
    HelpCircle,
    CheckCircle2,
    ArrowRight,
    Sparkles,
    Shield
} from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });

    const { username, email, password } = formData;
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user, isLoading, isError, isSuccess, message } = useSelector(
        (state) => state.auth
    );

    useEffect(() => {
        if (isSuccess || user) {
            navigate('/dashboard');
        }

        dispatch(reset());
    }, [user, isError, isSuccess, message, navigate, dispatch]);

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        const userData = { username, email, password };
        dispatch(register(userData));
    };
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background overflow-hidden relative">
            {/* Immersive Background System */}
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
                <div className="absolute top-[10%] right-[10%] w-[40%] h-[50%] bg-primary/10 blur-[130px] rounded-full " />
                <div className="absolute bottom-[10%] left-[10%] w-[40%] h-[50%] bg-blue-500/5 blur-[130px] rounded-full " style={{ animationDelay: '2s' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="max-w-[1100px] w-full flex flex-col md:flex-row gap-12 lg:gap-24 items-center relative z-10"
            >
                {/* Left Side: Technical Value Propositions */}
                <div className="hidden md:block flex-1 space-y-12">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-6"
                    >
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-2xl text-[10px] font-bold  tracking-[0.3em] backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                            
                            <Sparkles size={14} className=" relative z-10" /> 
                            <span className="relative z-10">Start Your Journey</span>
                        </div>
                        <h1 className="text-xl font-bold text-foreground leading-[1] tracking-tighter ">
                            Build your <br />
                            <span className="text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.3)]">Code Vault</span>
                        </h1>
                    </motion.div>

                    <div className="space-y-8">
                        {[
                            { icon: MessageSquare, text: 'Smart Organization', sub: 'Transform chaotic snippets into structured system logs.' },
                            { icon: Shield, text: 'Secure Encryption', sub: 'Your intellectual assets are protected by advanced security protocols.' },
                            { icon: Trophy, text: 'Achievement Tracking', sub: 'Evolve your engineering reputation with every contribution.' },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + i * 0.1 }}
                                className="flex gap-6 group"
                            >
                                <div className="w-14 h-14 shrink-0 bg-card/20 backdrop-blur-xl border border-border/50 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500 shadow-2xl">
                                    <item.icon size={28} strokeWidth={2.5} />
                                </div>
                                <div className="space-y-2">
                                    <div className="text-[14px] font-bold text-foreground  tracking-[0.2em] group-hover:text-primary transition-colors">{item.text}</div>
                                    <div className="text-[12px] text-muted-foreground/60 font-medium italic leading-relaxed">{item.sub}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Identity Creation Terminal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="w-full max-w-[450px]"
                >
                    <div className="bg-card/20 border border-border/50 p-10 md:p-14 rounded-[3.5rem] backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.3)] relative overflow-hidden group">
                        
                        <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none group-hover:scale-125 transition-transform duration-1000" />

                        <div className="relative z-10 space-y-10">
                            <div className="text-center md:text-left">
                                <h2 className="text-xl font-bold text-foreground  tracking-tighter leading-none mb-2">Register</h2>
                                <p className="text-muted-foreground/60 text-[11px] font-bold  tracking-[0.2em]">Join ScriptShelf Today</p>
                            </div>

                            <form onSubmit={onSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold  tracking-[0.3em] text-muted-foreground/40 ml-2">Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={username}
                                        onChange={onChange}
                                        placeholder="ALPHANUMERIC ID"
                                        className="w-full bg-background/50 border border-border/50 rounded-2xl py-4 px-6 text-[14px] outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-foreground placeholder:text-muted-foreground/20 font-mono shadow-inner"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold  tracking-[0.3em] text-muted-foreground/40 ml-2">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={email}
                                        onChange={onChange}
                                        placeholder="USER@SCRIPTSHELF.COM"
                                        className="w-full bg-background/50 border border-border/50 rounded-2xl py-4 px-6 text-[14px] outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-foreground placeholder:text-muted-foreground/20 font-mono shadow-inner"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold  tracking-[0.3em] text-muted-foreground/40 ml-2">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={password}
                                        onChange={onChange}
                                        placeholder="••••••••••••"
                                        className="w-full bg-background/50 border border-border/50 rounded-2xl py-4 px-6 text-[14px] outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-foreground placeholder:text-muted-foreground/20 font-mono shadow-inner"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-16 bg-primary rounded-2xl font-bold text-white text-[11px]  tracking-[0.4em] group flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all mt-6 shadow-2xl shadow-primary/20 disabled:opacity-50 relative overflow-hidden"
                                >
                                    
                                    {isLoading ? 'Creating...' : 'Create Account'}
                                    <ArrowRight size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </form>

                            <p className="text-[10px] text-muted-foreground/40 leading-relaxed text-center font-bold  tracking-widest px-4">
                                By signing up you agree to our <Link to="/terms" className="text-primary hover:underline font-bold">Terms</Link> & <Link to="/terms" className="text-primary hover:underline font-bold">Privacy</Link>.
                            </p>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-[11px] font-bold  tracking-[0.2em] text-center mt-10 text-muted-foreground/60"
                    >
                        Already have an account? {' '}
                        <Link to="/login" className="text-primary hover:text-blue-400 transition-colors">Login Now</Link>
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Register;
