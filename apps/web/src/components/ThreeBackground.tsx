import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number;
  ox: number; // original x
  oy: number; // original y
  oz: number; // original z
  vx: number;
  vy: number;
  vz: number;
  color: string;
}

export const ThreeBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // 3D Projection parameters
    const focalLength = 400;
    const centerX = width / 2;
    const centerY = height / 2;

    // Mouse interaction
    const mouse = { x: 0, y: 0, tx: 0, ty: 0, radius: 150 };
    
    // Generate particles
    const particleCount = 120;
    const particles: Particle[] = [];
    const colors = ['#8b5cf6', '#a78bfa', '#6366f1', '#818cf8', '#3b82f6'];

    for (let i = 0; i < particleCount; i++) {
      // Position particles in a 3D sphere/cylinder shell
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 250 + Math.random() * 150;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      particles.push({
        x,
        y,
        z,
        ox: x,
        oy: y,
        oz: z,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        vz: (Math.random() - 0.5) * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse coordinates around center
      mouse.tx = e.clientX - centerX;
      mouse.ty = e.clientY - centerY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let angleX = 0.001;
    let angleY = 0.001;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Dark background with gradient
      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        10,
        width / 2,
        height / 2,
        Math.max(width, height)
      );
      bgGrad.addColorStop(0, '#0f0c1b');
      bgGrad.addColorStop(1, '#05020a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Smooth mouse easing
      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;

      // Rotation angles based on mouse drag/drift
      const rx = angleX + mouse.y * 0.00002;
      const ry = angleY + mouse.x * 0.00002;

      const cosX = Math.cos(rx);
      const sinX = Math.sin(rx);
      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);

      // Project and draw particles
      const projected: { sx: number; sy: number; sz: number; scale: number; alpha: number; color: string }[] = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Slowly drift original coordinates
        p.ox += p.vx;
        p.oy += p.vy;
        p.oz += p.vz;

        // Bounce from sphere boundary
        const dist = Math.sqrt(p.ox * p.ox + p.oy * p.oy + p.oz * p.oz);
        if (dist > 450 || dist < 150) {
          p.vx *= -1;
          p.vy *= -1;
          p.vz *= -1;
        }

        // Apply 3D Rotation (Y axis)
        let x1 = p.ox * cosY - p.oz * sinY;
        let z1 = p.oz * cosY + p.ox * sinY;

        // Apply 3D Rotation (X axis)
        let y2 = p.oy * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.oy * sinX;

        // Perspective Projection
        const zOffset = 300; // Push depth
        const scale = focalLength / (focalLength + z2 + zOffset);
        const sx = centerX + x1 * scale;
        const sy = centerY + y2 * scale;

        // Fading based on depth
        const alpha = Math.max(0.1, Math.min(1, scale * 0.8));

        projected.push({ sx, sy, sz: z2, scale, alpha, color: p.color });
      }

      // Draw Connection lines (constellation effect)
      ctx.lineWidth = 0.5;
      for (let i = 0; i < projected.length; i++) {
        const p1 = projected[i];
        for (let j = i + 1; j < projected.length; j++) {
          const p2 = projected[j];

          // Calculate 2D distance
          const dx = p1.sx - p2.sx;
          const dy = p1.sy - p2.sy;
          const dist2D = Math.sqrt(dx * dx + dy * dy);

          // Draw lines for close nodes
          if (dist2D < 95) {
            const lineAlpha = (1 - dist2D / 95) * 0.15 * Math.min(p1.alpha, p2.alpha);
            ctx.strokeStyle = `rgba(139, 92, 246, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.sx, p1.sy);
            ctx.lineTo(p2.sx, p2.sy);
            ctx.stroke();
          }
        }
      }

      // Draw particle nodes
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        const radius = Math.max(1, p.scale * 3);

        // Add soft glow to larger/closer particles
        if (p.scale > 0.8) {
          ctx.shadowBlur = p.scale * 8;
          ctx.shadowColor = p.color;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1.0;

      // Slow constant drift
      angleX += 0.0005;
      angleY += 0.0003;

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block z-0" />;
};
