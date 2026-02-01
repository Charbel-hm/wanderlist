import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Prevent browser's default scroll restoration
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }

        window.scrollTo(0, 0);

        // Optional: Restore default if needed, but for this app sticking to top/manual seems safer for consistent UX
        return () => {
            if ('scrollRestoration' in window.history) {
                window.history.scrollRestoration = 'auto';
            }
        };
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
};

export default ScrollToTop;
