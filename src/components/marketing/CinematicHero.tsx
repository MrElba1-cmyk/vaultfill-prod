import React, { useEffect, useRef } from 'react';

interface CinematicHeroProps {
  videoSrc?: string;
  headline?: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
}

export const CinematicHero: React.FC<CinematicHeroProps> = ({
  videoSrc = 'https://cdn.coverr.co/videos/coverr-abstract-digital-waves-5824/1080p.mp4',
  headline = 'Vaultfill',
  subtitle = 'The future of secure data',
  ctaText = 'Get Started',
  ctaHref = '/demo'
}) => {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (hero) {
      hero.classList.add('vault-reveal');
    }
  }, []);

  return (
    <section ref={heroRef} className="vault-cinematic-hero" aria-label="Video background hero">
      <div className="vault-video-bg">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          aria-label="Background video"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      </div>
      <div className="vault-hero-content">
        <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight" style={{ fontSize: 'var(--vault-t-56)' }}>
          {headline}
        </h1>
        <p className="text-xl md:text-2xl mb-8 opacity-90" style={{ fontSize: 'var(--vault-t-32)' }}>
          {subtitle}
        </p>
        <a
          href={ctaHref}
          className="vault-hover-lift inline-block px-8 py-4 rounded-full font-semibold text-lg"
          style={{ backgroundColor: 'var(--vault-blue)', borderRadius: 'var(--vault-radius-48)' }}
        >
          {ctaText}
        </a>
      </div>
    </section>
  );
};

export default CinematicHero;