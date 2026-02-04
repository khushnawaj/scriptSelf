import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword } from '../features/auth/authSlice';
import { toast } from 'react-hot-toast';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { resetToken } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isLoading, isError, message } = useSelector((state) => state.auth);

    const onSubmit = (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        dispatch(resetPassword({ resetToken, password }))
            .unwrap()
            .then(() => {
                toast.success('Password reset via success');
                navigate('/login');
            })
            .catch(toast.error);
    };

    return (
        <div className="max-w-[400px] mx-auto mt-20 p-8 glass-frost rounded-[3px] border border-border/50 animate-in fade-in duration-500">
            <h1 className="text-[28px] font-bold text-center mb-2">Reset Password</h1>
            <p className="text-center text-muted-foreground mb-8 text-[14px]">
                Create a new password for your account.
            </p>

            <form onSubmit={onSubmit} className="space-y-6">
                <div>
                    <label htmlFor="password" className="block text-[13px] font-bold text-foreground mb-2 uppercase tracking-wide">
                        New Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full bg-background border border-border rounded-[3px] p-3 text-[14px] text-foreground focus:border-primary outline-none transition-all"
                        required
                        minLength={6}
                    />
                </div>
                <div>
                    <label htmlFor="confirmPassword" className="block text-[13px] font-bold text-foreground mb-2 uppercase tracking-wide">
                        Confirm New Password
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full bg-background border border-border rounded-[3px] p-3 text-[14px] text-foreground focus:border-primary outline-none transition-all"
                        required
                        minLength={6}
                    />
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full so-btn so-btn-primary py-3 font-bold tracking-wide"
                    >
                        {isLoading ? 'Updating...' : 'Update Password'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ResetPassword;
