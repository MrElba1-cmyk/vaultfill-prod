import React from 'react';
export const ParallaxSection: React.FC<{offset?:number}> = ({children}) => {
  return <section className='vault-parallax-section'>{children}</section>
};
export default ParallaxSection;
