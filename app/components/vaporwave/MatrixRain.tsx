import { useEffect, useRef } from 'react';

export function MatrixRain() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const columns = Math.floor(window.innerWidth / 20);
    const drops: number[] = [];

    // Initialize drops
    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    const createMatrixChar = () => {
      const char = document.createElement('div');
      char.className = 'matrix-char';
      char.textContent = chars[Math.floor(Math.random() * chars.length)];
      char.style.left = Math.random() * window.innerWidth + 'px';
      char.style.animationDuration = (Math.random() * 3 + 2) + 's';
      char.style.fontSize = (Math.random() * 10 + 10) + 'px';
      char.style.opacity = (Math.random() * 0.5 + 0.5).toString();
      
      container.appendChild(char);

      // Remove after animation
      setTimeout(() => {
        if (container.contains(char)) {
          container.removeChild(char);
        }
      }, 5000);
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        createMatrixChar();
      }
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="matrix-rain fixed inset-0 pointer-events-none z-5"
      style={{ zIndex: 5 }}
    />
  );
}
