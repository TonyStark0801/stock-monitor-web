'use client';

import { useEffect, useRef } from 'react';

interface FloatingElement {
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
  opacity: number;
  type: 'chart' | 'arrow' | 'dollar' | 'trend';
  rotation: number;
  rotationSpeed: number;
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const elementsRef = useRef<FloatingElement[]>([]);
  const animationRef = useRef<number>(0);
  const lastFrameTime = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize floating elements
    const initElements = () => {
      elementsRef.current = [];
      // Reduce element count for better performance
      const elementCount = Math.min(Math.floor((canvas.width * canvas.height) / 25000), 30);

      for (let i = 0; i < elementCount; i++) {
        elementsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          dx: (Math.random() - 0.5) * 0.5,
          dy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 20 + 10,
          opacity: Math.random() * 0.3 + 0.1,
          type: ['chart', 'arrow', 'dollar', 'trend'][Math.floor(Math.random() * 4)] as FloatingElement['type'],
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.02,
        });
      }
    };

    initElements();

    // Draw functions for different element types
    const drawChart = (ctx: CanvasRenderingContext2D, element: FloatingElement) => {
      const { x, y, size, opacity } = element;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(element.rotation);
      ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`;
      ctx.lineWidth = 2;
      
      // Draw mini chart
      ctx.beginPath();
      const points = 5;
      for (let i = 0; i < points; i++) {
        const px = (i - points/2) * (size / points);
        const py = (Math.random() - 0.5) * size * 0.6;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();
    };

    const drawArrow = (ctx: CanvasRenderingContext2D, element: FloatingElement) => {
      const { x, y, size, opacity } = element;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(element.rotation);
      ctx.strokeStyle = `rgba(34, 197, 94, ${opacity})`;
      ctx.fillStyle = `rgba(34, 197, 94, ${opacity})`;
      ctx.lineWidth = 2;
      
      // Draw arrow
      ctx.beginPath();
      ctx.moveTo(-size/2, 0);
      ctx.lineTo(size/2, 0);
      ctx.moveTo(size/3, -size/3);
      ctx.lineTo(size/2, 0);
      ctx.lineTo(size/3, size/3);
      ctx.stroke();
      ctx.restore();
    };

    const drawDollar = (ctx: CanvasRenderingContext2D, element: FloatingElement) => {
      const { x, y, size, opacity } = element;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(element.rotation);
      ctx.strokeStyle = `rgba(168, 85, 247, ${opacity})`;
      ctx.lineWidth = 2;
      ctx.font = `${size}px Arial`;
      ctx.fillStyle = `rgba(168, 85, 247, ${opacity})`;
      ctx.textAlign = 'center';
      ctx.fillText('$', 0, size/3);
      ctx.restore();
    };

    const drawTrend = (ctx: CanvasRenderingContext2D, element: FloatingElement) => {
      const { x, y, size, opacity } = element;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(element.rotation);
      ctx.strokeStyle = `rgba(249, 115, 22, ${opacity})`;
      ctx.lineWidth = 2;
      
      // Draw trend line with dots
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const px = (i - 1.5) * (size / 3);
        const py = (i % 2 === 0 ? -1 : 1) * size * 0.3;
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.moveTo(px + 2, py);
      }
      ctx.stroke();
      ctx.restore();
    };

    // Animation loop with frame rate throttling
    const animate = (currentTime: number) => {
      // Throttle to ~30 FPS for better performance
      if (currentTime - lastFrameTime.current < 33) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastFrameTime.current = currentTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      elementsRef.current.forEach((element) => {
        // Update position
        element.x += element.dx;
        element.y += element.dy;
        element.rotation += element.rotationSpeed;

        // Wrap around screen
        if (element.x < -50) element.x = canvas.width + 50;
        if (element.x > canvas.width + 50) element.x = -50;
        if (element.y < -50) element.y = canvas.height + 50;
        if (element.y > canvas.height + 50) element.y = -50;

        // Draw based on type
        switch (element.type) {
          case 'chart':
            drawChart(ctx, element);
            break;
          case 'arrow':
            drawArrow(ctx, element);
            break;
          case 'dollar':
            drawDollar(ctx, element);
            break;
          case 'trend':
            drawTrend(ctx, element);
            break;
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation with initial timestamp
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b  50%, #334155 100%)' }}
    />
  );
}