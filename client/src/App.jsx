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
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Notes from './pages/Notes';
import NoteEditor from './pages/NoteEditor';
import NoteDetails from './pages/NoteDetails';
import Categories from './pages/Categories';
import Admin from './pages/Admin';

// Private Route Component
const PrivateRoute = ({ children }) => {
  const { user, isLoading } = useSelector((state) => state.auth);

  // We need to allow initial loading state to pass or show spinner
  if (isLoading) return <div className="h-screen flex items-center justify-center text-primary">Loading...</div>;

  return user ? children : <Navigate to="/login" />;
};

// Public Route Component (redirects if already logged in)
const PublicRoute = ({ children }) => {
  const { user, isLoading } = useSelector((state) => state.auth);
  if (isLoading) return null; // Avoid flicker
  return user ? <Navigate to="/notes" /> : children;
}

import CommandPalette from './components/CommandPalette';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  return (
    <Router>
      <CommandPalette />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155'
          }
        }}
      />
      <Routes>
        <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

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
          <Route path="/admin" element={<Admin />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
