import { useState, useEffect } from "react";

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    return () => {
      window.removeEventListener("resize", checkDevice);
    };
  }, []);

  return isMobile;
}

export function useMobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  // Close sidebar when switching to desktop
  useEffect(() => {
    if (!isMobile) {
      setIsOpen(false);
    }
  }, [isMobile]);

  return {
    isOpen,
    toggleSidebar,
    closeSidebar,
    isMobile
  };
}