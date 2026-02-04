import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword, reset } from '../features/auth/authSlice';
import { Link } from 'react-router-dom';
import Spinner from '../components/Spinner';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const dispatch = useDispatch();
    const { isLoading, isError, message } = useSelector((state) => state.auth);

    const onSubmit = (e) => {
        e.preventDefault();
        dispatch(forgotPassword(email));
    };

    return (
        <div className="max-w-[400px] mx-auto mt-20 p-8 glass-frost rounded-[3px] border border-border/50 animate-in fade-in duration-500">
            <h1 className="text-[28px] font-bold text-center mb-2">Forgot Password</h1>
            <p className="text-center text-muted-foreground mb-8 text-[14px]">
                Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={onSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-[13px] font-bold text-foreground mb-2 uppercase tracking-wide">
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full bg-background border border-border rounded-[3px] p-3 text-[14px] text-foreground focus:border-primary outline-none transition-all"
                        required
                    />
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full so-btn so-btn-primary py-3 font-bold tracking-wide"
                    >
                        {isLoading ? 'Sending Link...' : 'Send Reset Link'}
                    </button>
                </div>
            </form>

            <div className="mt-6 text-center">
                <Link to="/login" className="text-[13px] text-primary hover:underline font-bold">
                    Back to Login
                </Link>
            </div>
        </div>
    );
};

export default ForgotPassword;
