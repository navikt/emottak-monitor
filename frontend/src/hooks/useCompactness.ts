import { useEffect, useState } from 'react';

type Compactness = 'tight' | 'loose';

export const useCompactness = () => {
    const [compactness, setCompactness] = useState<Compactness>('loose');

    useEffect(() => {
        const stored = localStorage.getItem('compactness') as Compactness | null;
        if (stored) setCompactness(stored);
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-compactness', compactness);
        localStorage.setItem('compactness', compactness);
    }, [compactness]);

    const toggleCompactness = () =>
        setCompactness(prev => (prev === 'tight' ? 'loose' : 'tight'));

    return { compactness, toggleCompactness };
};
