import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, reset } from '../features/auth/authSlice';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
    Code2,
    ArrowRight,
    Lock,
    ShieldCheck,
    Terminal,
    Sparkles,
    Cpu
} from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const { email, password } = formData;
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
        const userData = { email, password };
        dispatch(login(userData));
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background overflow-hidden relative">
            {/* Immersive Background System */}
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-primary/10 blur-[150px] rounded-full " />
                <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-blue-500/5 blur-[150px] rounded-full " style={{ animationDelay: '1s' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="w-full max-w-[450px] relative z-10"
            >
                {/* Protocol Header */}
                <div className="flex justify-center mb-10">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-card/40 border border-border/50 rounded-2xl text-[10px] font-bold  tracking-[0.3em] text-primary backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                        
                        <Terminal size={14} className=" relative z-10" /> 
                        <span className="relative z-10">Secure Connection Established</span>
                    </div>
                </div>

                {/* Main Auth Terminal */}
                <div className="bg-card/20 border border-border/50 p-10 md:p-14 rounded-[3.5rem] backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.3)] relative overflow-hidden group">
                    
                    <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none group-hover:scale-125 transition-transform duration-1000" />

                    <div className="relative z-10 space-y-12">
                        <div className="text-center">
                            <h1 className="text-xl font-bold text-foreground tracking-tighter  leading-none mb-3">Login</h1>
                            <p className="text-muted-foreground/60 text-[11px] font-bold  tracking-[0.2em]">Enter your vault</p>
                        </div>

                        <form onSubmit={onSubmit} className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold  tracking-[0.3em] text-muted-foreground/40 ml-2">Email Address</label>
                                <div className="relative group">
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
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center px-2">
                                    <label className="text-[10px] font-bold  tracking-[0.3em] text-muted-foreground/40">Password</label>
                                    <Link to="/forgot-password" title="Forgot Password" className="text-[9px]  font-bold tracking-widest text-primary hover:text-blue-400 transition-colors">Forgot?</Link>
                                </div>
                                <div className="relative group">
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
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-16 bg-primary rounded-2xl font-bold text-white text-[11px]  tracking-[0.4em] group flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all mt-6 shadow-2xl shadow-primary/20 disabled:opacity-50 relative overflow-hidden"
                            >
                                
                                {isLoading ? 'Verifying...' : 'Sign In'}
                                <ShieldCheck size={18} strokeWidth={3} className="group-hover:rotate-12 transition-transform" />
                            </button>
                        </form>

                        <div className="pt-6 flex flex-col items-center gap-6 text-[11px] font-bold  tracking-[0.2em] text-muted-foreground/60">
                            <p>
                                Need an account? {' '}
                                <Link to="/register" className="text-primary hover:text-blue-400 transition-colors">Create one</Link>
                            </p>
                            
                            <div className="w-full flex items-center gap-4">
                                <div className="h-px flex-1 bg-border/20" />
                                <span className="text-[9px] text-muted-foreground/20">OR</span>
                                <div className="h-px flex-1 bg-border/20" />
                            </div>

                            <Link to="/notes" className="hover:text-foreground transition-colors flex items-center gap-2 group">
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /> Continue as Guest
                            </Link>

                            <div className="flex items-center gap-3 mt-4 px-5 py-2 bg-secondary/20 rounded-xl border border-border/50 text-[9px] font-bold  text-muted-foreground/40 shadow-inner">
                                <Cpu size={12} className="text-primary" /> Secure Encryption Active
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
