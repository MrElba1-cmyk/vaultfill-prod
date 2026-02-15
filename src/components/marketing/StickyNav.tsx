import React, { useEffect, useState, ReactNode } from 'react';

interface StickyNavProps {
  children: ReactNode;
}

export const StickyNav: React.FC<StickyNavProps> = ({ children }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`vault-sticky-nav ${scrolled ? 'scrolled' : ''}`} aria-label="Main navigation">
      {children}
    </nav>
  );
};

export default StickyNav;