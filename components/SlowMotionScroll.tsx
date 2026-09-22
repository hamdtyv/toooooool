import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SlowMotionScroll: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Reset to top smoothly on route navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return null;
};

export default SlowMotionScroll;

