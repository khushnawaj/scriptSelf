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
        if (isError) {
            toast.error(message);
        }

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
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#020617] overflow-hidden relative">
            {/* Background Decorative Gradients */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[130px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[130px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-[420px] relative z-10"
            >
                {/* Status Badge */}
                <div className="flex justify-center mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 backdrop-blur-md">
                        <Terminal size={12} className="text-primary" /> Welcome Back
                    </div>
                </div>

                {/* Main Auth Card */}
                <div className="bg-white/5 border border-white/10 p-8 md:p-12 rounded-[2.5rem] backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                    {/* Inner highlight */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[60px] rounded-full pointer-events-none transition-transform group-hover:scale-125 duration-700" />

                    <div className="relative z-10 space-y-10">
                        <div className="text-center">
                            <h1 className="text-3xl font-black text-white tracking-tight">Login to Vault</h1>
                            <p className="text-zinc-500 text-sm mt-2">Access your saved notes and code.</p>
                        </div>

                        <form onSubmit={onSubmit} className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-400 ml-1">Email Address</label>
                                <div className="relative group">
                                    <input
                                        type="email"
                                        name="email"
                                        value={email}
                                        onChange={onChange}
                                        placeholder="yourname@gmail.com"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-5 text-[15px] outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-white placeholder:text-zinc-600"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-400">Password</label>
                                    <Link to="/forgot-password" title="Forgot Password" className="text-[10px] uppercase font-black tracking-widest text-primary hover:text-blue-400 transition-colors">Forgot?</Link>
                                </div>
                                <div className="relative group">
                                    <input
                                        type="password"
                                        name="password"
                                        value={password}
                                        onChange={onChange}
                                        placeholder="••••••••"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-5 text-[15px] outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-white placeholder:text-zinc-600"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-14 bg-primary rounded-2xl font-black text-white group flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4 shadow-xl shadow-primary/20 disabled:opacity-50"
                            >
                                {isLoading ? 'LOGGING IN...' : 'OPEN VAULT'}
                                <ShieldCheck size={20} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </form>

                        <div className="pt-4 flex flex-col items-center gap-4 text-[13px] text-zinc-400">
                            <p>
                                Need an account? {' '}
                                <Link to="/register" className="text-primary font-black hover:underline tracking-tight">Create one here</Link>
                            </p>
                            <Link to="/notes" className="text-[12px] text-zinc-500 font-bold uppercase tracking-widest hover:text-white transition-colors border-b border-transparent hover:border-white pb-0.5">
                                Continue as Guest
                            </Link>

                            <div className="flex items-center gap-2 mt-4 px-4 py-1.5 bg-white/5 rounded-full border border-white/10 text-[10px] font-bold uppercase text-zinc-600">
                                <Cpu size={12} /> SECURE CODE STORAGE
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
