import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, reset } from '../features/auth/authSlice';
import { toast } from 'react-hot-toast';
import { Code2, ExternalLink, Info, Lock } from 'lucide-react';

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
        <div className="min-h-[calc(100vh-150px)] flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
            {/* Logo area */}
            <div className="mb-8 flex flex-col items-center">
                <Code2 size={42} className="text-primary mb-4" />
                <h1 className="text-[21px] font-normal text-foreground">Log in to ScriptShelf</h1>
            </div>

            <div className="w-full max-w-[300px] flex flex-col gap-6">
                {/* Form Card */}
                <form onSubmit={onSubmit} className="bg-card border border-border p-6 rounded-[3px] shadow-lg space-y-4">
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
                        <div className="flex justify-between items-center">
                            <label className="text-[14px] font-bold text-foreground">Password</label>
                            <Link to="/forgot-password" className="text-[11px] text-[#0074cc] hover:underline cursor-pointer">Forgot password?</Link>
                        </div>
                        <input
                            type="password"
                            name="password"
                            value={password}
                            onChange={onChange}
                            className="w-full border border-border bg-background rounded-[3px] py-1.5 px-3 text-[13px] outline-none focus:border-primary focus:ring-4 focus:ring-accent transition-all"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full so-btn so-btn-primary py-2.5 mt-2"
                    >
                        {isLoading ? 'Logging in...' : 'Log in'}
                    </button>
                </form>

                {/* Switch to Register */}
                <div className="text-[13px] text-center text-muted-foreground">
                    Don't have an account? {' '}
                    <Link to="/register" className="text-[#0074cc] hover:underline">Sign up</Link>
                </div>

                <div className="text-[13px] text-center flex items-center justify-center gap-1 text-muted-foreground">
                    Are you an employer? <ExternalLink size={12} />
                </div>
            </div>
        </div>
    );
};

export default Login;
