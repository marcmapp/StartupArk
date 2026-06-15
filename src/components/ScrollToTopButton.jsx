import { useState, useEffect } from 'react';
import { FiArrowUp } from 'react-icons/fi';

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
      className="fixed bottom-24 right-4 z-50 w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
    >
      <FiArrowUp size={18} />
    </button>
  );
};

export default ScrollToTopButton;
