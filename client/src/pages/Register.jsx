import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { register, reset } from '../features/auth/authSlice';
import { Lock, Mail, User, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });

    const { username, email, password } = formData;

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user, isLoading, isError, isAuthenticated, message } = useSelector(
        (state) => state.auth
    );

    useEffect(() => {
        if (isError) {
            toast.error(message);
        }

        if (isAuthenticated || user) {
            navigate('/dashboard');
        }

        dispatch(reset());
    }, [user, isError, isAuthenticated, message, navigate, dispatch]);

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(register({ username, email, password }));
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-card border border-border p-8 rounded-xl shadow-lg"
            >
                <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Create Account</h2>
                <p className="text-muted-foreground text-center mb-8">Start organizing your snippets today</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Username</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-muted-foreground" size={18} />
                            <input
                                type="text"
                                name="username"
                                value={username}
                                onChange={onChange}
                                className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                placeholder="johndoe"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-muted-foreground" size={18} />
                            <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={onChange}
                                className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-muted-foreground" size={18} />
                            <input
                                type="password"
                                name="password"
                                value={password}
                                onChange={onChange}
                                className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-premium-primary w-full mt-2"
                    >
                        {isLoading ? 'Creating Account...' : (
                            <>Create Account <ArrowRight size={18} /></>
                        )}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary hover:underline font-medium">
                        Sign in
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;
