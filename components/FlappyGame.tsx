"use client";
import { useRef, useEffect, useState } from "react";
import { GameEngine } from "@/lib/gameEngine";

interface FlappyGameProps {
  avatarImg: string;
  jumpscareImages: string[];
  sunFaceImages: string[];
  onGameOver: (score: number) => void;
}

export default function FlappyGame({
  avatarImg,
  jumpscareImages,
  sunFaceImages,
  onGameOver,
}: FlappyGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);

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

    let skyGrad: CanvasGradient | null = null;

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const logicalWidth = window.innerWidth;
      const logicalHeight = window.innerHeight;

      canvas.width = logicalWidth * dpr;
      canvas.height = logicalHeight * dpr;
      canvas.style.width = `${logicalWidth}px`;
      canvas.style.height = `${logicalHeight}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      engineRef.current = new GameEngine(logicalWidth, logicalHeight);

      skyGrad = ctx.createLinearGradient(0, 0, 0, logicalHeight);
      skyGrad.addColorStop(0, "#FF7F50");
      skyGrad.addColorStop(0.5, "#FF6B6B");
      skyGrad.addColorStop(1, "#4A0072");
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const handleInput = (e: Event) => {
      e.preventDefault();
      engineRef.current?.flap();
    };

    const handleContextMenu = (e: Event) => e.preventDefault();

    canvas.addEventListener("touchstart", handleInput, { passive: false });
    canvas.addEventListener("touchmove", handleInput, { passive: false });
    canvas.addEventListener("contextmenu", handleContextMenu);

    window.addEventListener("keydown", (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        engineRef.current?.flap();
      }
    });
    canvas.addEventListener("mousedown", handleInput);

    const jumpScareImgs = jumpscareImages.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });

    const sunFaceImgs = sunFaceImages.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });

    // Jumpscare Variables
    let jumpScareTimer = 0;
    let nextJumpScareThreshold = 3 + Math.random() * 6;
    let activeJumpScareImg: HTMLImageElement | null = null;
    let jumpScareActiveTime = 0;
    let redFlashAlpha = 0;

    // Sun Face Variables
    let sunFaceTimer = 0;
    const sunFaceInterval = 15; // Every 15 seconds
    let activeSunFaceImg: HTMLImageElement | null = null;
    let sunFaceActiveTime = 0;

    let lastTime = performance.now();
    let accumulator = 0;
    const step = 1 / 60;
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
      const deltaTime = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;
      accumulator += deltaTime;

      const engine = engineRef.current;
      if (!engine) return;

      let isOver = false;

      while (accumulator >= step) {
        engine.update();
        accumulator -= step;
        if (engine.isGameOver) {
          isOver = true;
          break;
        }
      }

      if (isOver || engine.isGameOver) {
        cancelAnimationFrame(animationFrameId);
        onGameOver(engine.score);
        return;
      }

      if (engine.score !== scoreRef.current) {
        scoreRef.current = engine.score;
        setScore(engine.score);
      }

      const w = window.innerWidth;
      const h = window.innerHeight;

      bgOffsetRef.current.jeepneys += engine.pipeSpeed * 0.5 * (deltaTime * 60);
      bgOffsetRef.current.street += engine.pipeSpeed * (deltaTime * 60);

      // --- BIRD JUMPSCARE LOGIC ---
      if (!activeJumpScareImg) {
        jumpScareTimer += deltaTime;
        if (jumpScareTimer >= nextJumpScareThreshold) {
          activeJumpScareImg =
            jumpScareImgs[Math.floor(Math.random() * jumpScareImgs.length)];
          jumpScareActiveTime = 0;
          jumpScareTimer = 0;
          nextJumpScareThreshold = 3 + Math.random() * 6;
          redFlashAlpha = 0.6;
        }
      } else {
        jumpScareActiveTime += deltaTime;
        if (jumpScareActiveTime > 0.5) {
          activeJumpScareImg = null;
        }
      }

      // --- SUN FACE LOGIC ---
      if (!activeSunFaceImg) {
        sunFaceTimer += deltaTime;
        if (sunFaceTimer >= sunFaceInterval) {
          activeSunFaceImg =
            sunFaceImgs[Math.floor(Math.random() * sunFaceImgs.length)];
          sunFaceActiveTime = 0;
          sunFaceTimer = 0;
        }
      } else {
        sunFaceActiveTime += deltaTime;
        if (sunFaceActiveTime > 3.0) {
          // Lasts 3 seconds
          activeSunFaceImg = null;
        }
      }

      if (redFlashAlpha > 0) {
        redFlashAlpha -= deltaTime * 4;
        if (redFlashAlpha < 0) redFlashAlpha = 0;
      }

      // --- RENDERING ---

      if (skyGrad) {
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h);
      }

      // Draw Sun or Sun Face
      const sunX = w * 0.7;
      const sunY = h * 0.3;
      const sunR = 80;

      if (activeSunFaceImg && activeSunFaceImg.complete) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(
          activeSunFaceImg,
          sunX - sunR,
          sunY - sunR,
          sunR * 2,
          sunR * 2,
        );
        ctx.restore();

        // Glowing border
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 255, 200, 0.9)";
        ctx.lineWidth = 6;
        ctx.stroke();
      } else {
        ctx.fillStyle = "rgba(255, 255, 200, 0.8)";
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
        ctx.fill();
      }

      let jeepOffset = -(bgOffsetRef.current.jeepneys % 500);
      for (let x = jeepOffset - 150; x < w + 100; x += 500) {
        drawJeepney(x, h - 130, 1.2);
      }

      engine.pipes.forEach((pipe) => {
        const grad = ctx.createLinearGradient(pipe.x, 0, pipe.x + 90, 0);
        grad.addColorStop(0, "#FF8C00");
        grad.addColorStop(0.5, "#FFD700");
        grad.addColorStop(1, "#FF8C00");
        ctx.fillStyle = grad;

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

      ctx.fillStyle = "#1A1A1A";
      ctx.fillRect(0, h - 80, w, 80);
      ctx.fillStyle = "#FFF";
      let streetOffset = -(bgOffsetRef.current.street % 80);
      for (let i = streetOffset; i < w; i += 80) {
        ctx.fillRect(i, h - 40, 40, 5);
      }

      // --- DRAW BIRD & JUMPSCARE ---
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

        // Draw normal Avatar face
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

        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 4;
        ctx.stroke();

        // DRAW JUMPSCARE OVER BIRD
        if (activeJumpScareImg && activeJumpScareImg.complete) {
          const scareSize = 160;
          ctx.drawImage(
            activeJumpScareImg,
            -scareSize / 2,
            -scareSize / 2,
            scareSize,
            scareSize,
          );
        }

        ctx.restore();
      }

      // Red Flash Overlay
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
      canvas.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [onGameOver, jumpscareImages, sunFaceImages]);

  return (
    <div
      className="fixed inset-0 w-[100vw] h-[100dvh] bg-black overflow-hidden touch-none select-none"
      style={{
        WebkitTapHighlightColor: "transparent",
        WebkitUserSelect: "none",
        userSelect: "none",
      }}
      onContextMenu={(e) => e.preventDefault()}
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
