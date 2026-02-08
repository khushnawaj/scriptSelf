import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { loadUser } from './features/auth/authSlice';
import { useEffect, lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';

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
  const { user, isLoading } = useSelector((state) => state.auth);

  if (isLoading) return <Spinner fullPage message="Authenticating Session" />;

  return user ? children : <Navigate to="/login" />;
};

// Public Route Component (redirects if already logged in)
const PublicRoute = ({ children }) => {
  const { user, isLoading } = useSelector((state) => state.auth);
  if (isLoading) return <Spinner fullPage />;
  return user ? <Navigate to="/dashboard" /> : children;
}

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  return (
    <Router>
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
