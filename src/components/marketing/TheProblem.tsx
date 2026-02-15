import React from 'react';
import { ParallaxSection } from './ParallaxSection';

interface TheProblemProps {
  title?: string;
  problems?: { icon: string; text: string }[];
}

export const TheProblem: React.FC<TheProblemProps> = ({
  title = 'The Problem',
  problems = [
    { icon: '⚠️', text: 'Data fragmentation across multiple platforms' },
    { icon: '🔓', text: 'Security vulnerabilities in legacy systems' },
    { icon: '📉', text: 'Lost productivity due to inefficient workflows' },
  ]
}) => {
  return (
    <ParallaxSection className="py-20 px-8 bg-bg" offset={4}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center" style={{ fontSize: 'var(--vault-t-56)' }}>
          {title}
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {problems.map((problem, idx) => (
            <div
              key={idx}
              className="vault-hover-lift p-6 rounded-3xl"
              style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--vault-radius-24)' }}
            >
              <div className="text-4xl mb-4">{problem.icon}</div>
              <p className="text-lg" style={{ fontSize: 'var(--vault-t-18)' }}>{problem.text}</p>
            </div>
          ))}
        </div>
      </div>
    </ParallaxSection>
  );
};

export default TheProblem;