import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import Spinner from './Spinner';

const AdminRoute = () => {
    const { user, isLoading } = useSelector((state) => state.auth);

    if (isLoading) {
        return <Spinner fullPage message="Verifying Admin Access..." />;
    }

    if (user && user.role === 'admin') {
        return <Outlet />;
    }

    // Redirect to dashboard if logged in but not admin, or login if not logged in
    return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

export default AdminRoute;
