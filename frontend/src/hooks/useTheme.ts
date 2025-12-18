import { useEffect, useState } from 'react';
import {isProdEnv} from "../util";

type Theme = 'light' | 'dark';

export const useTheme = () => {
    const [theme, setTheme] = useState<Theme>('light');
    const scheme = isProdEnv ? 'prod' : 'dev';

    useEffect(() => {
        const stored = localStorage.getItem('theme') as Theme | null;
        if (stored) setTheme(stored);
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.setAttribute('data-scheme', scheme);
        localStorage.setItem('theme', theme);
    }, [theme, scheme]);

    const toggleTheme = () =>
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

    return { theme, toggleTheme };
};
