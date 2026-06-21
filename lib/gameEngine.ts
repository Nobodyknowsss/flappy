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
  gravity: number = 0.45; // Faster fall
  flapStrength: number = -8; // Higher jump to match faster fall
  maxFallSpeed: number = 10; // Allows quicker descents
  basePipeSpeed: number = 2.8; // Faster base speed
  pipeSpeed: number = 2.8;
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
    // Slightly tighter gap to make it challenging but fair
    const gapHeight = Math.max(180, this.canvasHeight * 0.3);
    const minGap = 60;
    const maxGap = this.canvasHeight - gapHeight - 120;
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

    // Faster acceleration over time
    this.pipeSpeed = Math.min(6.0, this.basePipeSpeed + this.score * 0.08);

    this.bird.velocity += this.gravity;
    if (this.bird.velocity > this.maxFallSpeed) {
      this.bird.velocity = this.maxFallSpeed;
    }

    this.bird.y += this.bird.velocity;
    this.bird.rotation = Math.max(-0.4, Math.min(1.2, this.bird.velocity / 8));

    if (this.bird.y > this.canvasHeight - 80 || this.bird.y < 30) {
      this.isGameOver = true;
    }

    // Reduced spawn distance so pipes come at you faster
    const spawnDistance = 320;
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
