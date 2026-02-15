import React from 'react';
import { ParallaxSection } from './ParallaxSection';

interface TheImpactProps {
  title?: string;
  metrics?: { value: string; label: string }[];
}

export const TheImpact: React.FC<TheImpactProps> = ({
  title = 'The Impact',
  metrics = [
    { value: '10x', label: 'Faster Workflows' },
    { value: '99.9%', label: 'Uptime Guarantee' },
    { value: '256-bit', label: 'Encryption' },
  ]
}) => {
  return (
    <ParallaxSection className="py-20 px-8" style={{ backgroundColor: 'var(--card-2)' }} offset={5}>
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-12" style={{ fontSize: 'var(--vault-t-56)' }}>
          {title}
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {metrics.map((metric, idx) => (
            <div key={idx} className="vault-hover-lift p-8 rounded-3xl" style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--vault-radius-48)' }}>
              <div className="text-5xl md:text-6xl font-bold mb-2" style={{ color: 'var(--vault-blue)' }}>
                {metric.value}
              </div>
              <div className="text-lg opacity-80" style={{ fontSize: 'var(--vault-t-18)' }}>{metric.label}</div>
            </div>
          ))}
        </div>
      </div>
    </ParallaxSection>
  );
};

export default TheImpact;