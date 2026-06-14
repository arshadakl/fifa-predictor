'use client';

import { useEffect, useRef } from 'react';

export type EffectType = 'confetti' | 'fireworks' | 'none';

export default function EffectsCanvas({ effectType }: { effectType: EffectType }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resizeCanvas() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class ConfettiParticle {
      x: number;
      y: number;
      size: number;
      color: string;
      alpha: number;
      speed: number;
      rotation: number;
      rotationSpeed: number;
      wobble: number;
      wobbleSpeed: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * -canvas!.height - 20;
        this.size = Math.random() * 10 + 4;
        this.color = ['#00BFFF', '#FFD700', '#FFFFFF', '#FF3E3E', '#00FF66'][
          Math.floor(Math.random() * 5)
        ];
        this.alpha = Math.random() * 0.4 + 0.5;
        this.speed = Math.random() * 3 + 2;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 4 - 2;
        this.wobble = Math.random() * 2;
        this.wobbleSpeed = Math.random() * 0.05 + 0.02;
      }

      update() {
        this.y += this.speed;
        this.rotation += this.rotationSpeed;
        this.x += Math.sin(this.y * this.wobbleSpeed) * this.wobble;
      }

      draw() {
        ctx!.save();
        ctx!.translate(this.x, this.y);
        ctx!.rotate((this.rotation * Math.PI) / 180);
        ctx!.globalAlpha = this.alpha;
        ctx!.fillStyle = this.color;
        ctx!.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx!.restore();
      }
    }

    class FireworkParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      alpha: number;
      decay: number;
      size: number;
      gravity: number;

      constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8 - Math.random() * 3;
        this.color = color;
        this.alpha = 1;
        this.decay = Math.random() * 0.015 + 0.01;
        this.size = Math.random() * 3 + 2;
        this.gravity = 0.08;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.alpha -= this.decay;
      }

      draw() {
        ctx!.save();
        ctx!.globalAlpha = this.alpha;
        ctx!.fillStyle = this.color;
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();
      }
    }

    class FireworkLauncher {
      x: number;
      y: number;
      targetY: number;
      speed: number;
      color: string;
      isDead: boolean;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = canvas!.height;
        this.targetY = Math.random() * (canvas!.height * 0.5) + canvas!.height * 0.15;
        this.speed = Math.random() * 5 + 8;
        this.color = ['#00BFFF', '#FFD700', '#FF3E3E', '#FF00FF', '#00FF66'][
          Math.floor(Math.random() * 5)
        ];
        this.isDead = false;
      }

      update() {
        this.y -= this.speed;
        if (this.y <= this.targetY) {
          this.isDead = true;
          for (let i = 0; i < 40; i++) {
            particles.push(new FireworkParticle(this.x, this.y, this.color));
          }
        }
      }

      draw() {
        ctx!.save();
        ctx!.fillStyle = this.color;
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, 4, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();
      }
    }

    type Particle = ConfettiParticle | FireworkParticle | FireworkLauncher;
    let particles: Particle[] = [];
    let animationFrameId: number | null = null;

    function runEffectsLoop() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      if (effectType === 'confetti') {
        if (particles.length < 90 && Math.random() < 0.24) {
          particles.push(new ConfettiParticle());
        }
      } else if (effectType === 'fireworks') {
        if (
          Math.random() < 0.05 &&
          particles.filter((p) => p instanceof FireworkLauncher).length < 3
        ) {
          particles.push(new FireworkLauncher());
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw();

        if (p instanceof ConfettiParticle && p.y > canvas!.height) {
          particles.splice(i, 1);
        } else if (p instanceof FireworkParticle && p.alpha <= 0) {
          particles.splice(i, 1);
        } else if (p instanceof FireworkLauncher && p.isDead) {
          particles.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(runEffectsLoop);
    }

    particles = [];
    if (effectType !== 'none') {
      runEffectsLoop();
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      particles = [];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [effectType]);

  return <canvas ref={canvasRef} id="effects-canvas" />;
}
