import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { loadUser } from './features/auth/authSlice';
import { useEffect, lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { Analytics } from "@vercel/analytics/react";

import Layout from './components/Layout';
import Spinner from './components/Spinner';

// Eager load critical pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Lazy load heavy/less-critical pages
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const PublicProfile = lazy(() => import('./pages/PublicProfile'));
const Notes = lazy(() => import('./pages/Notes'));
const NoteEditor = lazy(() => import('./pages/NoteEditor'));
const NoteDetails = lazy(() => import('./pages/NoteDetails'));
const Categories = lazy(() => import('./pages/Categories'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Guide = lazy(() => import('./pages/Guide'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Arcade = lazy(() => import('./pages/Arcade'));
const Issues = lazy(() => import('./pages/Issues'));
const Terms = lazy(() => import('./pages/Terms'));
const Community = lazy(() => import('./pages/Community'));
const Chat = lazy(() => import('./pages/Chat'));
const AdminRoute = lazy(() => import('./components/AdminRoute'));
const CommandPalette = lazy(() => import('./components/CommandPalette'));
const ShortcutManager = lazy(() => import('./components/ShortcutManager'));
const Playground = lazy(() => import('./pages/Playground'));

// Private Route Component
const PrivateRoute = ({ children }) => {
  const { user, isInitialized } = useSelector((state) => state.auth);

  // Still show spinner for private routes because we MUST know if user is logged in
  if (!isInitialized) return <Spinner fullPage message="Authenticating Session" />;

  return user ? children : <Navigate to="/login" />;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { user, isInitialized } = useSelector((state) => state.auth);
  const path = window.location.pathname;

  // Pages where showing a spinner is acceptable to prevent flashes (Login/Register)
  // We EXCLUDE the root path '/' so the landing page loads instantly
  const isAuthFormPage = path === '/login' || path === '/register' || path === '/forgot-password' || path === '/reset-password';

  if (isAuthFormPage && !isInitialized) return <Spinner fullPage />;

  // If initialized and user is logged in, redirect away from Home or Auth forms
  if (isInitialized && user && (isAuthFormPage || path === '/')) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUser());

    // Global Error & Rejection Toasting Setup
    const handleGlobalError = (event) => {
      // Filter out safe/expected errors
      if (
        event.message?.includes('401') ||
        event.message?.includes('Unauthorized') ||
        event.message?.includes('Insights')
      ) return;

      toast.error(`System Signal Error: ${event.message || 'Unknown Execution Fault'}`, {
        icon: '⚠️',
        duration: 4000
      });
    };

    const handleUnhandledRejection = (event) => {
      // Filter out standard 401 rejections from auth checks
      if (
        event.reason?.response?.status === 401 ||
        event.reason === 'Not authorized' ||
        String(event.reason)?.includes('Insights')
      ) return;

      toast.error(`Neural Link Refused: ${event.reason?.message || event.reason || 'Unhandled Async Fault'}`, {
        icon: '🛑',
        duration: 5000
      });
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [dispatch]);

  return (
    <Router>
      {import.meta.env.PROD && <Analytics />}
      <Suspense fallback={<Spinner fullPage message="Loading..." />}>
        <CommandPalette />
        <ShortcutManager />
      </Suspense>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--card)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
            fontSize: '13px',
            fontWeight: '600',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }
        }}
      />
      <Suspense fallback={<Spinner fullPage message="Loading page..." />}>
        <Routes>
          <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/reset-password/:resetToken" element={<PublicRoute><ResetPassword /></PublicRoute>} />

          <Route element={<Layout />}>
            {/* Public Access Routes */}
            <Route path="/guide" element={<Guide />} />
            <Route path="/arcade" element={<Arcade />} />
            <Route path="/issues" element={<Issues />} />
            <Route path="/notes/:id" element={<NoteDetails />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/u/:username" element={<PublicProfile />} />
            <Route path="/community" element={<Community />} />
            <Route path="/playground" element={<Playground />} />

            {/* Validated Access Routes */}
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
            <Route path="/notes/new" element={<PrivateRoute><NoteEditor /></PrivateRoute>} />
            <Route path="/notes/edit/:id" element={<PrivateRoute><NoteEditor /></PrivateRoute>} />

            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>

          </Route>

          <Route path="/terms" element={<Terms />} />

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
