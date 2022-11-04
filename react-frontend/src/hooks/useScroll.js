import React, {useState, useEffect} from 'react';

const useScroll = (props) => {
    const [scrollPos, setScrollPos] = useState({x: 0,y: 0})
    const [scrollDir, setScrollDir] = useState("up"); //현재 스크롤이 어디를 향하는지 up or down

    useEffect(() => {
        const threshold = 0;
        let lastScrollY = window.pageYOffset;
        let ticking = false;

        const updateScrollDir = () => {
            const scrollY = window.pageYOffset;

            if (Math.abs(scrollY - lastScrollY) < threshold) {
                ticking = false;
                return;
            }

            setScrollPos({x: window.scrollX, y: window.scrollY})
            setScrollDir(scrollY > lastScrollY ? "down" : "up");

            lastScrollY = scrollY > 0 ? scrollY : 0;
            ticking = false;
        };

        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(updateScrollDir);
                ticking = true;
            }
        };

        window.addEventListener("scroll", onScroll);

        return () => window.removeEventListener("scroll", onScroll);
    }, [scrollDir]);

    return {
        x: scrollPos.x, y: scrollPos.y, scrollDir
    }
}

export default useScroll;
