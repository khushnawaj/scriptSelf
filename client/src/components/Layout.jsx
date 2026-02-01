import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />
            <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 mt-16 animate-in fade-in">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
