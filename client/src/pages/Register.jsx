import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, reset } from '../features/auth/authSlice';
import { toast } from 'react-hot-toast';
import {
    Code2,
    MessageSquare,
    Folders,
    Trophy,
    HelpCircle,
    CheckCircle2
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
        const userData = { username, email, password };
        dispatch(register(userData));
    };

    return (
        <div className="min-h-[calc(100vh-150px)] flex items-center justify-center p-4 animate-in fade-in duration-500">
            <div className="max-w-[800px] w-full flex flex-col md:flex-row gap-12 items-center">

                {/* Value Propositions - SO Style */}
                <div className="hidden md:block flex-1 space-y-6">
                    <h1 className="text-[27px] font-normal text-foreground leading-tight">
                        Join the ScriptShelf community
                    </h1>
                    <div className="space-y-4">
                        {[
                            { icon: MessageSquare, text: 'Explain your logic and technical patterns' },
                            { icon: Folders, text: 'Organize your scripts into reusable archetypes' },
                            { icon: Trophy, text: 'Unlock badges and earn reputation for documentation' },
                            { icon: HelpCircle, text: 'Build your personal technical legacy' }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 text-[15px] text-foreground">
                                <item.icon className="text-primary" size={24} />
                                <span>{item.text}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-[13px] text-muted-foreground">
                        Collaborate with yourself. Create your digital vault.
                    </p>
                </div>

                {/* Form area */}
                <div className="w-full max-w-[320px] flex flex-col gap-6">
                    <div className="bg-card border border-border p-6 rounded-[3px] shadow-lg space-y-4">
                        <form onSubmit={onSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[14px] font-bold text-foreground">Display name</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={username}
                                    onChange={onChange}
                                    className="w-full border border-border bg-background rounded-[3px] py-1.5 px-3 text-[13px] outline-none focus:border-primary focus:ring-4 focus:ring-accent transition-all"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[14px] font-bold text-foreground">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={email}
                                    onChange={onChange}
                                    className="w-full border border-border bg-background rounded-[3px] py-1.5 px-3 text-[13px] outline-none focus:border-primary focus:ring-4 focus:ring-accent transition-all"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[14px] font-bold text-foreground">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={password}
                                    onChange={onChange}
                                    className="w-full border border-border bg-background rounded-[3px] py-1.5 px-3 text-[13px] outline-none focus:border-primary focus:ring-4 focus:ring-accent transition-all"
                                    required
                                />
                                <p className="text-[11px] text-muted-foreground mt-1">Passwords must contain at least eight characters.</p>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full so-btn so-btn-primary py-2.5 mt-2"
                            >
                                {isLoading ? 'Signing up...' : 'Sign up'}
                            </button>
                        </form>
                        <p className="text-[11px] text-muted-foreground leading-normal">
                            By clicking “Sign up”, you agree to our <span className="text-primary hover:underline cursor-pointer">terms of service</span> and acknowledge the <span className="text-primary hover:underline cursor-pointer">privacy policy</span>.
                        </p>
                    </div>

                    <div className="text-[13px] text-center text-foreground">
                        Already have an account? {' '}
                        <Link to="/login" className="text-[#0074cc] hover:underline">Log in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
