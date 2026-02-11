import { createContext, useContext, useEffect, useState } from 'react';
import {
    Zap, Terminal, Flame, ShieldCheck,
    Book, Coffee, Lightbulb, Rocket,
    Cpu, Command, Activity, Gauge
} from 'lucide-react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error("useTheme must be used within a ThemeProvider");
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) return savedTheme;
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
    });

    const [designSystem, setDesignSystem] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('designSystem') || 'v1';
        }
        return 'v1';
    });





    useEffect(() => {
        const fetchGlobalDesign = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const userRes = await fetch(`${import.meta.env.VITE_API_URL || '/api/v1'}/auth/me`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const userData = await userRes.json();
                    if (userData.success && userData.data.preferences?.designSystem) {
                        setDesignSystem(userData.data.preferences.designSystem);
                        localStorage.setItem('designSystem', userData.data.preferences.designSystem);
                        return;
                    }
                }
                const res = await fetch(`${import.meta.env.VITE_API_URL || '/api/v1'}/system/settings/theme_version`);
                const data = await res.json();
                if (data.success && data.data.value) {
                    if (!localStorage.getItem('designSystem')) {
                        setDesignSystem(data.data.value);
                    }
                }
            } catch (err) {
                console.warn("Could not sync global theme", err);
            }
        };
        fetchGlobalDesign();
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark', 'theme-v1', 'theme-v2', 'theme-v3', 'theme-v4', 'theme-v5');
        root.classList.add(theme);
        root.classList.add(`theme-${designSystem}`);
        root.setAttribute('data-theme', theme);

        const font = getComputedStyle(root).getPropertyValue('--font-main').trim();
        if (font) {
            root.style.fontFamily = font;
        } else {
            root.style.fontFamily = '';
        }

        localStorage.setItem('theme', theme);
        localStorage.setItem('designSystem', designSystem);
    }, [theme, designSystem]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const toggleDesignSystem = (v) => {
        setDesignSystem(v || (designSystem === 'v1' ? 'v2' : 'v1'));
    };

    const saveDesignSystem = async (v) => {
        setDesignSystem(v);

        localStorage.setItem('designSystem', v);
        try {
            const token = localStorage.getItem('token');
            if (token) {
                await fetch(`${import.meta.env.VITE_API_URL || '/api/v1'}/users/preferences`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ preferences: { designSystem: v } })
                });
            }
        } catch (err) {
            console.error("Failed to sync personal theme to profile", err);
        }
    };

    const themeAssets = {
        v1: {
            id: 'v1', name: 'Script Classic', color: '#6b6b00',
            animation: 'animate-theme-entry',
            accent: 'olive',
            font: 'Script Classic (Standard)',
            icons: { hero: Zap, brand: Terminal, active: Flame }
        },
        v2: {
            id: 'v2', name: 'Shelf Modern', color: '#0d9488',
            animation: 'animate-theme-entry',
            accent: 'teal',
            font: 'Shelf Modern (Inter)',
            icons: { hero: ShieldCheck, brand: Book, active: Activity }
        },
        v3: {
            id: 'v3', name: 'Logic Pro', color: '#2f8d46',
            animation: 'animate-theme-entry',
            accent: 'green',
            font: 'Logic Pro (Technical)',
            icons: { hero: Cpu, brand: Command, active: Gauge }
        },
        v4: {
            id: 'v4', name: 'Learning Lab', color: '#1456d3',
            animation: 'animate-theme-entry',
            accent: 'blue',
            font: 'Learning Lab (Rounded)',
            icons: { hero: Lightbulb, brand: Book, active: Rocket }
        },
        v5: {
            id: 'v5', name: 'Stack Dev', color: '#f97316',
            animation: 'animate-theme-entry',
            accent: 'orange',
            font: 'Stack Dev (Noir)',
            icons: { hero: Zap, brand: Command, active: Flame }
        }
    };

    return (
        <ThemeContext.Provider value={{
            theme,
            toggleTheme,
            designSystem,
            toggleDesignSystem,
            saveDesignSystem,
            themeAssets: themeAssets[designSystem],
            allThemes: Object.values(themeAssets)
        }}>
            {children}
        </ThemeContext.Provider>
    );
};
