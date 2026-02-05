import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { loadUser } from './features/auth/authSlice';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';

import Layout from './components/Layout';
// We will update PrivateRoute to use redux, but we can also inline it here for simplicity
// or import a Redux-aware PrivateRoute. Let's inline/refactor here.

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import Notes from './pages/Notes';
import NoteEditor from './pages/NoteEditor';
import NoteDetails from './pages/NoteDetails';
import Categories from './pages/Categories';
import Admin from './pages/Admin';
import Guide from './pages/Guide';
import NotFound from './pages/NotFound';
import Arcade from './pages/Arcade';
import Terms from './pages/Terms';
import Spinner from './components/Spinner';

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

import AdminRoute from './components/AdminRoute';
import CommandPalette from './components/CommandPalette';
import ShortcutManager from './components/ShortcutManager';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  return (
    <Router>
      <CommandPalette />
      <ShortcutManager />
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
      <Routes>
        <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/reset-password/:resetToken" element={<PublicRoute><ResetPassword /></PublicRoute>} />

        <Route element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/notes/new" element={<NoteEditor />} />
          <Route path="/notes/:id" element={<NoteDetails />} />
          <Route path="/notes/edit/:id" element={<NoteEditor />} />
          <Route path="/categories" element={<Categories />} />

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin" element={<Admin />} />
          </Route>

          <Route path="/guide" element={<Guide />} />
          <Route path="/arcade" element={<Arcade />} />
        </Route>

        <Route path="/u/:username" element={<PublicProfile />} />
        <Route path="/terms" element={<Terms />} />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
