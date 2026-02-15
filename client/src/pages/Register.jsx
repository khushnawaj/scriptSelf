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
            {/* Background Decorative Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[20%] left-[10%] w-[30%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-[1000px] w-full flex flex-col md:flex-row gap-8 lg:gap-16 items-center relative z-10"
            >

                {/* Left Side: Value Propositions */}
                <div className="hidden md:block flex-1 space-y-10">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-4"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-[10px] font-black uppercase tracking-widest">
                            <Sparkles size={12} /> Join the Community
                        </div>
                        <h1 className="text-[42px] font-black text-foreground leading-[1.1] tracking-tighter">
                            Save your best <br />
                            <span className="text-primary italic">Code & Ideas</span>
                        </h1>
                    </motion.div>

                    <div className="space-y-6">
                        {[
                            { icon: MessageSquare, text: 'Organize your work', sub: 'Turn messy code snippets into clear, searchable notes.' },
                            { icon: Shield, text: 'Private and secure', sub: 'Your notes are encrypted and for your eyes only.' },
                            { icon: Trophy, text: 'Track your growth', sub: 'Earn points as you document and improve your skills.' },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + i * 0.1 }}
                                className="flex gap-4 group"
                            >
                                <div className="w-12 h-12 shrink-0 bg-secondary/50 border border-border rounded-xl flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/10 transition-all">
                                    <item.icon size={24} />
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[17px] font-bold text-foreground group-hover:text-primary transition-colors">{item.text}</div>
                                    <div className="text-[14px] text-muted-foreground font-light">{item.sub}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Form */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="w-full max-w-[400px]"
                >
                    <div className="bg-card/50 border border-border p-8 md:p-10 rounded-3xl backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                        {/* Subtle inner glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[40px] rounded-full pointer-events-none" />

                        <div className="relative z-10 space-y-8">
                            <div className="text-center md:text-left">
                                <h2 className="text-2xl font-black text-foreground">Create Account</h2>
                                <p className="text-muted-foreground text-sm mt-1">Start your vault in less than a minute.</p>
                            </div>

                            <form onSubmit={onSubmit} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[12px] font-black uppercase tracking-widest text-muted-foreground ml-1">Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={username}
                                        onChange={onChange}
                                        placeholder="Pick a cool name"
                                        className="w-full bg-secondary/50 border border-border rounded-xl py-3 px-4 text-[14px] outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-foreground placeholder:text-muted-foreground/50"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[12px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={email}
                                        onChange={onChange}
                                        placeholder="yourname@gmail.com"
                                        className="w-full bg-secondary/50 border border-border rounded-xl py-3 px-4 text-[14px] outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-foreground placeholder:text-muted-foreground/50"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[12px] font-black uppercase tracking-widest text-muted-foreground ml-1">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={password}
                                        onChange={onChange}
                                        placeholder="At least 8 characters"
                                        className="w-full bg-secondary/50 border border-border rounded-xl py-3 px-4 text-[14px] outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-foreground placeholder:text-muted-foreground/50"
                                        required
                                    />
                                    <p className="text-[10px] text-muted-foreground mt-1.5 italic ml-1 select-none">Use a strong password to keep your code safe.</p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-14 bg-primary rounded-xl font-black text-primary-foreground group flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4 disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    {isLoading ? 'SIGNING UP...' : 'CREATE ACCOUNT'}
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </form>

                            <p className="text-[11px] text-muted-foreground leading-relaxed text-center px-4">
                                By signing up, you agree to our <Link to="/terms" className="text-primary hover:underline cursor-pointer font-bold">Terms</Link> and our <Link to="/terms" className="text-primary hover:underline cursor-pointer font-bold">Privacy Policy</Link>.
                            </p>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-[13px] text-center mt-8 text-muted-foreground"
                    >
                        Already have an account? {' '}
                        <Link to="/login" className="text-primary font-black hover:underline tracking-tight">Login here</Link>
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Register;
