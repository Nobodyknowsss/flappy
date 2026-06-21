export interface Bird {
  x: number;
  y: number;
  velocity: number;
  rotation: number;
}

export interface Pipe {
  x: number;
  gapY: number;
  width: number;
  gapHeight: number;
  passed: boolean;
}

export class GameEngine {
  canvasWidth: number;
  canvasHeight: number;
  bird: Bird;
  pipes: Pipe[] = [];
  score: number = 0;
  gravity: number = 0.2;
  flapStrength: number = -6;
  maxFallSpeed: number = 4;
  basePipeSpeed: number = 1.5;
  pipeSpeed: number = 1.5;
  isGameOver: boolean = false;

  constructor(width: number, height: number) {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.bird = { x: width * 0.3, y: height / 2, velocity: 0, rotation: 0 };
    this.spawnPipe();
  }

  flap() {
    if (!this.isGameOver) {
      this.bird.velocity = this.flapStrength;
    }
  }

  spawnPipe() {
    // Gap height is now 35% of the screen height, making it responsive
    const gapHeight = Math.max(220, this.canvasHeight * 0.35);
    const minGap = 80;
    const maxGap = this.canvasHeight - gapHeight - 120; // Leave room for street
    const gapY = Math.random() * (maxGap - minGap) + minGap;

    this.pipes.push({
      x: this.canvasWidth,
      gapY,
      width: 90,
      gapHeight,
      passed: false,
    });
  }

  update() {
    if (this.isGameOver) return;

    this.pipeSpeed = Math.min(3.0, this.basePipeSpeed + this.score * 0.03);

    this.bird.velocity += this.gravity;
    if (this.bird.velocity > this.maxFallSpeed) {
      this.bird.velocity = this.maxFallSpeed;
    }

    this.bird.y += this.bird.velocity;
    this.bird.rotation = Math.max(-0.3, Math.min(0.8, this.bird.velocity / 8));

    // Ground/Ceiling collision
    if (this.bird.y > this.canvasHeight - 80 || this.bird.y < 30) {
      this.isGameOver = true;
    }

    const spawnDistance = 500;
    if (
      this.pipes.length === 0 ||
      this.pipes[this.pipes.length - 1].x < this.canvasWidth - spawnDistance
    ) {
      this.spawnPipe();
    }

    const birdRadius = 35;

    this.pipes.forEach((pipe) => {
      pipe.x -= this.pipeSpeed;

      if (!pipe.passed && pipe.x + pipe.width < this.bird.x) {
        pipe.passed = true;
        this.score++;
      }

      if (
        this.bird.x + birdRadius > pipe.x &&
        this.bird.x - birdRadius < pipe.x + pipe.width &&
        (this.bird.y - birdRadius < pipe.gapY ||
          this.bird.y + birdRadius > pipe.gapY + pipe.gapHeight)
      ) {
        this.isGameOver = true;
      }
    });

    this.pipes = this.pipes.filter((pipe) => pipe.x + pipe.width > 0);
  }

  reset() {
    this.bird = {
      x: this.canvasWidth * 0.3,
      y: this.canvasHeight / 2,
      velocity: 0,
      rotation: 0,
    };
    this.pipes = [];
    this.score = 0;
    this.pipeSpeed = this.basePipeSpeed;
    this.isGameOver = false;
    this.spawnPipe();
  }
}
