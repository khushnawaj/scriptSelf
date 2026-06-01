import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, reset } from '../features/auth/authSlice';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';

const getStrength = (pw) => {
  if (!pw)         return { val: 0, label: '',       color: '' };
  if (pw.length < 6)   return { val: 1, label: 'Weak',   color: 'bg-red-500'    };
  if (pw.length < 10)  return { val: 2, label: 'Good',   color: 'bg-yellow-400' };
  return                      { val: 3, label: 'Strong', color: 'bg-green-500'  };
};

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [showPass, setShowPass]  = useState(false);
  const { username, email, password } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoading, isError, isSuccess, message } = useSelector((s) => s.auth);

  useEffect(() => {
    if (isSuccess || user) navigate('/dashboard');
    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  const onSubmit = (e) => { e.preventDefault(); dispatch(register({ username, email, password })); };

  const strength = getStrength(password);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden py-12 px-4">

      {/* ── Gradient mesh bg ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-primary/6 to-transparent" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[560px] h-[560px] bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-border/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-border/15" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-primary/15" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >

        {/* ── Brand ── */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.08, duration: 0.55 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground shadow-[0_8px_32px_rgba(var(--color-primary)/0.4)] mb-5"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
            </svg>
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Create your account</h1>
          <p className="text-base text-muted-foreground mt-2">Join ScriptShelf — free forever</p>
        </div>

        {/* ── Form ── */}
        <form onSubmit={onSubmit} className="space-y-4">

          {/* Username */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Username</label>
            <div className="flex items-center h-12 rounded-xl border border-border/70 bg-card/60 backdrop-blur-sm px-4 gap-3 transition-all focus-within:border-primary/70 focus-within:ring-2 focus-within:ring-primary/10 focus-within:bg-card/80">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/60 shrink-0">
                <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>
              </svg>
              <input
                type="text" name="username" value={username} onChange={onChange}
                placeholder="your_handle" required autoComplete="username"
                className="flex-1 h-full bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/40"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Email address</label>
            <div className="flex items-center h-12 rounded-xl border border-border/70 bg-card/60 backdrop-blur-sm px-4 gap-3 transition-all focus-within:border-primary/70 focus-within:ring-2 focus-within:ring-primary/10 focus-within:bg-card/80">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/60 shrink-0">
                <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              <input
                type="email" name="email" value={email} onChange={onChange}
                placeholder="you@example.com" required autoComplete="email"
                className="flex-1 h-full bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/40"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Password</label>
            <div className="flex items-center h-12 rounded-xl border border-border/70 bg-card/60 backdrop-blur-sm px-4 gap-3 transition-all focus-within:border-primary/70 focus-within:ring-2 focus-within:ring-primary/10 focus-within:bg-card/80">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/60 shrink-0">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                type={showPass ? 'text' : 'password'} name="password" value={password} onChange={onChange}
                placeholder="Min. 6 characters" required minLength={6} autoComplete="new-password"
                className="flex-1 h-full bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/40"
              />
              <button type="button" onClick={() => setShowPass(v => !v)} className="shrink-0 text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Strength */}
            {password.length > 0 && (
              <div className="space-y-1.5 pt-0.5">
                <div className="flex gap-1.5">
                  {[1,2,3].map(s => (
                    <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-300 ${strength.val >= s ? strength.color : 'bg-border/30'}`} />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Password strength:{' '}
                  <span className={`font-semibold ${strength.val===1?'text-red-400':strength.val===2?'text-yellow-400':'text-green-400'}`}>
                    {strength.label}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit" disabled={isLoading}
            className="w-full h-12 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_4px_20px_rgba(var(--color-primary)/0.35)] disabled:opacity-50 mt-2"
          >
            {isLoading
              ? <><span className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full animate-spin" />Creating account…</>
              : <><CheckCircle2 size={16} strokeWidth={2.5} />Create Account<ArrowRight size={15} className="ml-auto opacity-60" /></>
            }
          </button>
        </form>

        {/* ── Terms ── */}
        <p className="text-xs text-muted-foreground/50 text-center mt-5 leading-relaxed">
          By signing up you agree to our{' '}
          <Link to="/terms" className="text-primary/80 hover:text-primary underline underline-offset-2">Terms</Link>
          {' '}&amp;{' '}
          <Link to="/terms" className="text-primary/80 hover:text-primary underline underline-offset-2">Privacy Policy</Link>.
        </p>

        {/* ── Footer ── */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">Sign in →</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
