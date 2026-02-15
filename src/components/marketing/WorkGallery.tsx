import React from 'react';
import { ParallaxSection } from './ParallaxSection';

interface WorkGalleryProps {
  title?: string;
  projects?: { name: string; category: string; image: string }[];
}

export const WorkGallery: React.FC<WorkGalleryProps> = ({
  title = 'Work Gallery',
  projects = [
    { name: 'Project Alpha', category: 'Security', image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=400&fit=crop' },
    { name: 'Project Beta', category: 'Analytics', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop' },
    { name: 'Project Gamma', category: 'Automation', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop' },
  ]
}) => {
  return (
    <ParallaxSection className="py-20 px-8 bg-bg" offset={3}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center" style={{ fontSize: 'var(--vault-t-56)' }}>
          {title}
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {projects.map((project, idx) => (
            <div
              key={idx}
              className="vault-hover-lift group relative overflow-hidden rounded-3xl cursor-pointer"
              style={{ borderRadius: 'var(--vault-radius-24)' }}
            >
              <img
                src={project.image}
                alt={project.name}
                className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                <div>
                  <div className="text-sm opacity-70 uppercase tracking-wider mb-1">{project.category}</div>
                  <div className="text-xl font-semibold text-white">{project.name}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ParallaxSection>
  );
};

export default WorkGallery;