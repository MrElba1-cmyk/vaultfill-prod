import React, { useEffect, useRef, useState, ReactNode } from 'react';

interface ParallaxSectionProps {
  children: ReactNode;
  offset?: number; // max parallax offset in % of viewport
  className?: string;
}

export const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  children,
  offset = 5,
  className = ''
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Parallax on scroll
    const handleScroll = () => {
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const maxOffset = (viewportHeight * offset) / 100;
      // Calculate scroll progress (0 to 1 as it enters viewport)
      const scrollProgress = Math.max(0, Math.min(1, (viewportHeight - rect.top) / (viewportHeight + rect.height)));
      // Apply subtle parallax: translateY varies from 0 to -maxOffset
      const parallaxY = -maxOffset * scrollProgress;
      section.style.transform = `translateY(${parallaxY}px)`;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Scroll reveal
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(section);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [offset]);

  return (
    <section
      ref={sectionRef}
      className={`vault-parallax-section ${className}`}
    >
      <div className={`vault-scroll-reveal ${isRevealed ? 'visible' : ''}`}>
        {children}
      </div>
    </section>
  );
};

export default ParallaxSection;