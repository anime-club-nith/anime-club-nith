import React, { useEffect, useRef, useCallback } from 'react';

const AnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const nodesRef = useRef<{ x: number; y: number; vx: number; vy: number }[]>([]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    resizeCanvas();

    const isMobile = window.innerWidth < 768;
    const isLowEnd = (navigator.hardwareConcurrency || 4) <= 4;
    const nodeCount = isMobile ? (isLowEnd ? 8 : 12) : (isLowEnd ? 20 : 30);

    // Initialize nodes only once
    if (nodesRef.current.length === 0) {
      for (let i = 0; i < nodeCount; i++) {
        nodesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * (isMobile ? 0.12 : 0.25),
          vy: (Math.random() - 0.5) * (isMobile ? 0.12 : 0.25),
        });
      }
    }

    const animate = () => {
      // Clear with full transparency to support both light and dark modes
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const nodes = nodesRef.current;
      const maxDistance = isMobile ? 60 : 100;
      const nodeOpacity = isMobile ? 0.12 : 0.25;
      const connectionOpacity = isMobile ? 0.05 : 0.12;

      // Color scheme matches existing pink theme: #E56DB1 (rgba: 229, 109, 177)
      const pinkColor = '229, 109, 177';

      nodes.forEach((node, i) => {
        // Update position
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x < 0 || node.x > canvas.width) {
          node.vx *= -1;
          node.x = Math.max(0, Math.min(canvas.width, node.x));
        }
        if (node.y < 0 || node.y > canvas.height) {
          node.vy *= -1;
          node.y = Math.max(0, Math.min(canvas.height, node.y));
        }

        // Draw node
        ctx.fillStyle = `rgba(${pinkColor}, ${nodeOpacity})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, isMobile ? 1 : 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Draw connections
        nodes.slice(i + 1).forEach((otherNode) => {
          const dx = node.x - otherNode.x;
          const dy = node.y - otherNode.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            const opacity = connectionOpacity * (1 - distance / maxDistance);
            ctx.strokeStyle = `rgba(${pinkColor}, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(otherNode.x, otherNode.y);
            ctx.stroke();
          }
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      resizeCanvas();
      // Update node positions to stay within bounds
      nodesRef.current.forEach(node => {
        if (canvasRef.current) {
          node.x = Math.min(node.x, canvasRef.current.width);
          node.y = Math.min(node.y, canvasRef.current.height);
        }
      });
    };

    window.addEventListener('resize', handleResize, { passive: true });
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [resizeCanvas]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ 
        background: 'transparent',
        willChange: 'transform'
      }}
    />
  );
};

export default React.memo(AnimatedBackground);
