import { Link } from 'react-router-dom';
import { ArrowRight, Code2, Database, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <header className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-2">
                    <Code2 className="text-primary h-8 w-8" />
                    <span className="text-xl font-bold">ScriptShelf</span>
                </div>
                <div className="flex gap-4">
                    <Link to="/login" className="px-4 py-2 hover:text-primary transition-colors">Login</Link>
                    <Link to="/register" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-white/90 transition-colors font-medium">Get Started</Link>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent"
                >
                    Your Code. Organized.
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl text-muted-foreground max-w-2xl mb-10"
                >
                    Store your snippets, documentation, and cheat sheets in one developer-centric platform.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex gap-4"
                >
                    <Link to="/register" className="px-8 py-3 bg-primary text-primary-foreground text-lg rounded-lg hover:bg-white/90 transition-colors flex items-center gap-2 font-bold">
                        Start for Free <ArrowRight size={20} />
                    </Link>
                    <Link to="/login" className="px-8 py-3 bg-secondary text-secondary-foreground text-lg rounded-lg hover:bg-secondary/80 transition-colors font-medium">
                        Live Demo
                    </Link>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-5xl text-left">
                    <div className="p-6 bg-card border border-border rounded-xl">
                        <Code2 className="text-primary mb-4 h-10 w-10" />
                        <h3 className="text-xl font-bold mb-2">Syntax Highlighting</h3>
                        <p className="text-muted-foreground">Built-in support for all major languages to keep your snippets readable.</p>
                    </div>
                    <div className="p-6 bg-card border border-border rounded-xl">
                        <Database className="text-primary mb-4 h-10 w-10" />
                        <h3 className="text-xl font-bold mb-2">Categorized Storage</h3>
                        <p className="text-muted-foreground">Organize by project, language, or topic with our flexible category system.</p>
                    </div>
                    <div className="p-6 bg-card border border-border rounded-xl">
                        <ShieldCheck className="text-primary mb-4 h-10 w-10" />
                        <h3 className="text-xl font-bold mb-2">Secure & Private</h3>
                        <p className="text-muted-foreground">Your notes are private by default, secured with enterprise-grade encryption.</p>
                    </div>
                </div>
            </main>

            <footer className="p-6 text-center text-muted-foreground border-t border-border">
                &copy; 2026 ScriptShelf. Built for Developers.
            </footer>
        </div>
    );
};

export default Home;
