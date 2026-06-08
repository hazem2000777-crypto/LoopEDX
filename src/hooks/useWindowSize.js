import { useState, useEffect } from "react";

export function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    isMobile: window.innerWidth < 640,
    isTablet: window.innerWidth < 1024,
  });

  useEffect(() => {
    const handler = () => setSize({
      width: window.innerWidth,
      isMobile: window.innerWidth < 640,
      isTablet: window.innerWidth < 1024,
    });
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return size;
}