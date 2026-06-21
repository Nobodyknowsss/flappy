"use client";
import { useRef, useEffect, useState } from "react";
import { GameEngine } from "@/lib/gameEngine";

interface FlappyGameProps {
  avatarImg: string;
  jumpscareImages: string[];
  onGameOver: (score: number) => void;
}

export default function FlappyGame({
  avatarImg,
  jumpscareImages,
  onGameOver,
}: FlappyGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [score, setScore] = useState(0);

  const bgOffsetRef = useRef({ jeepneys: 0, street: 0 });

  useEffect(() => {
    const img = new Image();
    img.src = avatarImg;
    imageRef.current = img;
  }, [avatarImg]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      engineRef.current = new GameEngine(canvas.width, canvas.height);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const handleInput = (e: Event) => {
      e.preventDefault();
      engineRef.current?.flap();
    };

    canvas.addEventListener("touchstart", handleInput, { passive: false });
    canvas.addEventListener("touchmove", handleInput, { passive: false });

    window.addEventListener("keydown", (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        engineRef.current?.flap();
      }
    });
    canvas.addEventListener("mousedown", handleInput);

    // Preload jumpscare images
    const jumpScareImgs = jumpscareImages.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });

    // Random Jumpscare Timer Variables
    let jumpScareTimer = 0;
    let nextJumpScareThreshold = 3 + Math.random() * 12; // Random time between 3s and 15s
    // FIX: Explicitly type as HTMLImageElement or null to fix Vercel TypeScript error
    let activeJumpScareImg: HTMLImageElement | null = null;
    let jumpScareAlpha = 0;
    let jumpScareActiveTime = 0;
    let redFlashAlpha = 0;

    let lastTime = performance.now();
    let animationFrameId: number;

    const drawJeepney = (x: number, y: number, scale: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      ctx.fillStyle = "#FFD700";
      ctx.beginPath();
      ctx.moveTo(0, 20);
      ctx.lineTo(10, 0);
      ctx.lineTo(80, 0);
      ctx.lineTo(90, 20);
      ctx.lineTo(90, 40);
      ctx.lineTo(0, 40);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#87CEEB";
      ctx.fillRect(15, 5, 65, 12);
      ctx.strokeRect(15, 5, 65, 12);
      ctx.fillRect(5, 10, 12, 15);
      ctx.strokeRect(5, 10, 12, 15);

      ctx.fillStyle = "#DC143C";
      ctx.fillRect(0, 25, 90, 5);

      ctx.fillStyle = "#FFFF00";
      ctx.beginPath();
      ctx.arc(85, 35, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#333";
      ctx.beginPath();
      ctx.arc(15, 40, 8, 0, Math.PI * 2);
      ctx.arc(70, 40, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#000";
      ctx.stroke();

      ctx.restore();
    };

    const render = (now: number) => {
      const deltaTime = (now - lastTime) / 1000;
      lastTime = now;

      const engine = engineRef.current;
      if (!engine) return;

      engine.update();

      if (engine.isGameOver) {
        cancelAnimationFrame(animationFrameId);
        onGameOver(engine.score);
        return;
      }

      setScore(engine.score);
      const w = canvas.width;
      const h = canvas.height;

      bgOffsetRef.current.jeepneys += engine.pipeSpeed * 0.5;
      bgOffsetRef.current.street += engine.pipeSpeed;

      // --- RANDOM JUMPSCARE LOGIC ---
      if (!activeJumpScareImg) {
        jumpScareTimer += deltaTime;
        if (jumpScareTimer >= nextJumpScareThreshold) {
          // Trigger jumpscare
          activeJumpScareImg =
            jumpScareImgs[Math.floor(Math.random() * jumpScareImgs.length)];
          jumpScareAlpha = 0; // Start at 0 and ramp up instantly
          jumpScareActiveTime = 0;
          jumpScareTimer = 0;
          nextJumpScareThreshold = 3 + Math.random() * 12; // Set next random time
          redFlashAlpha = 0.8; // Trigger red flash
        }
      } else {
        // Jumpscare lasts 1.2 seconds total
        jumpScareActiveTime += deltaTime;
        if (jumpScareActiveTime < 0.1) {
          jumpScareAlpha = 1; // Appear instantly
        } else if (jumpScareActiveTime < 0.8) {
          jumpScareAlpha = 1; // Stay on screen
        } else if (jumpScareActiveTime < 1.2) {
          jumpScareAlpha = 1 - (jumpScareActiveTime - 0.8) / 0.4; // Fade out fast
        } else {
          activeJumpScareImg = null; // End jumpscare
        }
      }

      // Fade out red flash quickly
      if (redFlashAlpha > 0) {
        redFlashAlpha -= deltaTime * 2;
        if (redFlashAlpha < 0) redFlashAlpha = 0;
      }

      // --- RENDERING ---

      // 1. Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, "#FF7F50");
      skyGrad.addColorStop(0.5, "#FF6B6B");
      skyGrad.addColorStop(1, "#4A0072");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Sun
      ctx.fillStyle = "rgba(255, 255, 200, 0.8)";
      ctx.beginPath();
      ctx.arc(w * 0.7, h * 0.3, 80, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw Giant Jumpscare Face
      if (activeJumpScareImg && activeJumpScareImg.complete) {
        ctx.save();
        ctx.globalAlpha = jumpScareAlpha;
        const faceSize = h * 1.3; // Massive size
        const faceX = w / 2 - faceSize / 2;
        const faceY = h / 2 - faceSize / 2;

        // Draw circular face
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, faceSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(activeJumpScareImg, faceX, faceY, faceSize, faceSize);
        ctx.restore();
      }

      // 3. Midground Jeepneys
      let jeepOffset = -(bgOffsetRef.current.jeepneys % 500);
      for (let x = jeepOffset - 150; x < w + 100; x += 500) {
        drawJeepney(x, h - 130, 1.2);
      }

      // 4. Pipes
      engine.pipes.forEach((pipe) => {
        const pipeGrad = ctx.createLinearGradient(
          pipe.x,
          0,
          pipe.x + pipe.width,
          0,
        );
        pipeGrad.addColorStop(0, "#FF8C00");
        pipeGrad.addColorStop(0.5, "#FFD700");
        pipeGrad.addColorStop(1, "#FF8C00");

        ctx.fillStyle = pipeGrad;
        ctx.strokeStyle = "#8B4513";
        ctx.lineWidth = 4;

        ctx.fillRect(pipe.x, 0, pipe.width, pipe.gapY);
        ctx.strokeRect(pipe.x, 0, pipe.width, pipe.gapY);

        ctx.fillRect(pipe.x, pipe.gapY + pipe.gapHeight, pipe.width, h);
        ctx.strokeRect(pipe.x, pipe.gapY + pipe.gapHeight, pipe.width, h);

        ctx.fillStyle = "rgba(135, 206, 235, 0.8)";
        ctx.fillRect(pipe.x + 15, 0, 25, pipe.gapY - 10);
        ctx.fillRect(pipe.x + 50, 0, 25, pipe.gapY - 10);
        ctx.fillRect(pipe.x + 15, pipe.gapY + pipe.gapHeight + 10, 25, h);
        ctx.fillRect(pipe.x + 50, pipe.gapY + pipe.gapHeight + 10, 25, h);
      });

      // 5. Street Layer
      ctx.fillStyle = "#1A1A1A";
      ctx.fillRect(0, h - 80, w, 80);
      ctx.fillStyle = "#FFF";
      let streetOffset = -(bgOffsetRef.current.street % 80);
      for (let i = streetOffset; i < w; i += 80) {
        ctx.fillRect(i, h - 40, 40, 5);
      }

      // 6. Avatar with Wings
      if (imageRef.current && imageRef.current.complete) {
        ctx.save();
        ctx.translate(engine.bird.x, engine.bird.y);
        ctx.rotate(engine.bird.rotation);

        const radius = 40;
        const wingAngle = engine.bird.velocity < 0 ? -0.8 : 0.3;

        // Left Wing
        ctx.save();
        ctx.translate(-radius * 0.8, 0);
        ctx.rotate(wingAngle);
        ctx.fillStyle = "#FFFFFF";
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, 30, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Right Wing
        ctx.save();
        ctx.translate(radius * 0.8, 0);
        ctx.rotate(-wingAngle);
        ctx.fillStyle = "#FFFFFF";
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, 30, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Draw Avatar Image
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(
          imageRef.current,
          -radius,
          -radius,
          radius * 2,
          radius * 2,
        );
        ctx.restore();

        // Draw border around avatar
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.restore();
      }

      // 7. Red Flash Overlay for Jumpscare
      if (redFlashAlpha > 0) {
        ctx.fillStyle = `rgba(150, 0, 0, ${redFlashAlpha})`;
        ctx.fillRect(0, 0, w, h);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("touchstart", handleInput);
      canvas.removeEventListener("touchmove", handleInput);
      canvas.removeEventListener("mousedown", handleInput);
    };
  }, [onGameOver, jumpscareImages]);

  return (
    <div
      className="fixed inset-0 w-[100vw] h-[100dvh] bg-black overflow-hidden touch-none select-none"
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ touchAction: "none" }}
      />
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-6xl font-extrabold text-white drop-shadow-[3px_3px_0_rgb(220,38,38)] pointer-events-none z-10">
        {score}
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm font-bold pointer-events-none z-10">
        Tap / Click / Spacebar to Flap
      </div>
    </div>
  );
}
