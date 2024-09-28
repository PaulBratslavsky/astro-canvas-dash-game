class Rain {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private drops: { x: number; y: number; speed: number; length: number }[];

  constructor(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    dropCount: number = 100
  ) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.drops = this.createRaindrops(dropCount);
  }

  private createRaindrops(count: number) {
    return Array.from({ length: count }, () => ({
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      speed: Math.random() * 5 + 5,
      length: Math.random() * 10 + 10,
    }));
  }

  update(deltaTime: number) {
    this.drops.forEach((drop) => {
      drop.y += drop.speed;
      if (drop.y > this.canvas.height) {
        drop.y = 0 - drop.length;
        drop.x = Math.random() * this.canvas.width;
      }
    });
  }

  draw() {
    this.ctx.strokeStyle = "rgba(174, 194, 224, 0.5)";
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.drops.forEach((drop) => {
      this.ctx.moveTo(drop.x, drop.y);
      this.ctx.lineTo(drop.x, drop.y + drop.length);
    });
    this.ctx.stroke();
  }
}

class Canvas {
  public element: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;

  constructor(
    width: number = 800,
    height: number = 600,
    id: string = "canvas"
  ) {
    this.element = document.getElementById(id) as HTMLCanvasElement;
    if (!this.element) throw new Error("Canvas element not found");
    this.ctx = this.element.getContext("2d")!;
    this.element.width = width;
    this.element.height = height;
  }

  clear() {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.element.width, this.element.height);
  }

  fadeBackground() {
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    this.ctx.fillRect(0, 0, this.element.width, this.element.height);
  }
}

class Player {
  private playerSprite: HTMLImageElement;
  private width: number = 50;
  private height: number = 50;
  private x: number = 0;
  private y: number = 0;
  private isLoaded: boolean = false;
  private speed: number = 5;
  private dashSpeed: number = 80; // Increased dash speed for a longer dash
  private dashDuration: number = 150; // Dash duration in milliseconds
  private isDashing: boolean = false;
  private dashDirection: "up" | "down" | "left" | "right" | null = null;
  private dashEndTime: number = 0;

  constructor() {
    this.playerSprite = new Image();
    this.playerSprite.onload = () => {
      this.isLoaded = true;
      console.log("Player sprite loaded successfully");
    };
    this.playerSprite.onerror = (e) => {
      console.error("Error loading player sprite:", e);
    };
    this.playerSprite.src =
      "../assets/sprites/8-bits-characters-gaming-assets.jpg";
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.isLoaded) {
      // Draw the player sprite
      ctx.drawImage(this.playerSprite, this.x, this.y, this.width, this.height);
    } else {
      // Draw a placeholder rectangle if the image hasn't loaded
      ctx.fillStyle = "blue";
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    // Draw a box around the player
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
  }

  move(direction: "up" | "down" | "left" | "right", canvasWidth: number, canvasHeight: number) {
    switch (direction) {
      case "up":
        this.y = Math.max(0, this.y - this.speed);
        break;
      case "down":
        this.y = Math.min(canvasHeight - this.height, this.y + this.speed);
        break;
      case "left":
        this.x = Math.max(0, this.x - this.speed);
        break;
      case "right":
        this.x = Math.min(canvasWidth - this.width, this.x + this.speed);
        break;
    }
  }

  getCenterPosition(): { x: number; y: number } {
    return {
      x: this.x + this.width / 2,
      y: this.y,
    };
  }

  getPosition(): { x: number; y: number; width: number; height: number } {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  respawn(canvasWidth: number, canvasHeight: number) {
    this.x = (canvasWidth - this.width) / 2;
    this.y = canvasHeight - this.height - 10; // 10 pixels above the bottom
  }

  stopMoving() {
    // Removed unused property
  }

  dash(direction: "up" | "down" | "left" | "right", canvasWidth: number, canvasHeight: number) {
    console.log(`Dash called: ${direction}`);
    if (!this.isDashing) {
      this.isDashing = true;
      this.dashDirection = direction;
      this.dashEndTime = Date.now() + this.dashDuration;

      // Perform the dash movement
      switch (direction) {
        case "up":
          this.y = Math.max(0, this.y - this.dashSpeed);
          break;
        case "down":
          this.y = Math.min(canvasHeight - this.height, this.y + this.dashSpeed);
          break;
        case "left":
          this.x = Math.max(0, this.x - this.dashSpeed);
          break;
        case "right":
          this.x = Math.min(canvasWidth - this.width, this.x + this.dashSpeed);
          break;
      }
      console.log(`Dash performed: ${direction}, new position: (${this.x}, ${this.y})`);
    }
  }

  update(deltaTime: number, canvasWidth: number, canvasHeight: number) {
    if (this.isDashing && Date.now() > this.dashEndTime) {
      this.isDashing = false;
      this.dashDirection = null;
      console.log('Dash ended');
    }
  }
}

class Projectile {
  private x: number;
  private y: number;
  private speed: number = 10;
  private radius: number = 5;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  update() {
    this.y -= this.speed;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "yellow";
    ctx.fill();
    ctx.closePath();
  }

  isOffScreen(): boolean {
    return this.y + this.radius < 0;
  }

  collidesWith(target: {
    x: number;
    y: number;
    width: number;
    height: number;
  }): boolean {
    return (
      this.x > target.x &&
      this.x < target.x + target.width &&
      this.y > target.y &&
      this.y < target.y + target.height
    );
  }
}

class Enemy {
  public x: number;
  public y: number;
  public width: number = 40;
  public height: number = 40;
  private speed: number;
  private dashSpeed: number = 300; // Increased for more noticeable dash
  private dashCooldown: number = 3000; // 3 seconds cooldown between dashes
  private lastDashTime: number = 0;
  private isDashing: boolean = false;
  private dashDuration: number = 300; // 300ms dash duration
  private dashStartTime: number = 0;
  private dashDirection: "up" | "down" | "left" | "right" | null = null;
  private dashStartPosition: { x: number, y: number } = { x: 0, y: 0 };
  private dashTargetPosition: { x: number, y: number } = { x: 0, y: 0 };
  private shootCooldown: number = 2000; // 2 seconds cooldown between shots
  private lastShotTime: number = 0;

  constructor(x: number, y: number, speed: number) {
    this.x = x;
    this.y = y;
    this.speed = speed;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.isDashing ? "orange" : "red";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update(deltaTime: number, canvasWidth: number, canvasHeight: number): EnemyProjectile | null {
    const currentTime = Date.now();

    if (this.isDashing) {
      const dashProgress = (currentTime - this.dashStartTime) / this.dashDuration;
      if (dashProgress >= 1) {
        this.isDashing = false;
        this.x = this.dashTargetPosition.x;
        this.y = this.dashTargetPosition.y;
      } else {
        this.x = this.dashStartPosition.x + (this.dashTargetPosition.x - this.dashStartPosition.x) * dashProgress;
        this.y = this.dashStartPosition.y + (this.dashTargetPosition.y - this.dashStartPosition.y) * dashProgress;
      }
    } else {
      // Regular movement
      this.y += this.speed * deltaTime;

      // Random dash
      if (currentTime - this.lastDashTime > this.dashCooldown && Math.random() < 0.02) { // 2% chance to dash every frame
        this.startDash(canvasWidth, canvasHeight);
      }
    }

    // Random shooting
    if (currentTime - this.lastShotTime > this.shootCooldown && Math.random() < 0.05) { // 5% chance to shoot every frame
      this.lastShotTime = currentTime;
      return new EnemyProjectile(this.x + this.width / 2, this.y + this.height);
    }

    return null;
  }

  startDash(canvasWidth: number, canvasHeight: number) {
    const directions = ["up", "down", "left", "right"];
    this.dashDirection = directions[Math.floor(Math.random() * directions.length)] as "up" | "down" | "left" | "right";

    this.isDashing = true;
    this.lastDashTime = Date.now();
    this.dashStartTime = this.lastDashTime;
    this.dashStartPosition = { x: this.x, y: this.y };

    switch (this.dashDirection) {
      case "up":
        this.dashTargetPosition = { x: this.x, y: Math.max(0, this.y - this.dashSpeed) };
        break;
      case "down":
        this.dashTargetPosition = { x: this.x, y: Math.min(canvasHeight - this.height, this.y + this.dashSpeed) };
        break;
      case "left":
        this.dashTargetPosition = { x: Math.max(0, this.x - this.dashSpeed), y: this.y };
        break;
      case "right":
        this.dashTargetPosition = { x: Math.min(canvasWidth - this.width, this.x + this.dashSpeed), y: this.y };
        break;
    }
  }

  isOffScreen(canvasHeight: number): boolean {
    return this.y > canvasHeight;
  }
}

// Add this new class
class Logger {
  private logs: string[] = [];
  private maxLogs: number = 5;
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  log(message: string) {
    this.logs.unshift(message);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }
  }

  draw() {
    this.ctx.fillStyle = 'white';
    this.ctx.font = '14px Arial';
    this.logs.forEach((log, index) => {
      this.ctx.fillText(log, 10, 20 + index * 20);
    });
  }
}

class EnemyProjectile {
  private x: number;
  private y: number;
  private speed: number = 200;
  private radius: number = 5;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  update(deltaTime: number) {
    this.y += this.speed * deltaTime; // This will make the projectile move downwards
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "purple";
    ctx.fill();
    ctx.closePath();
  }

  isOffScreen(canvasHeight: number): boolean {
    return this.y - this.radius > canvasHeight;
  }

  collidesWith(player: Player): boolean {
    const playerPos = player.getPosition();
    return (
      this.x + this.radius > playerPos.x &&
      this.x - this.radius < playerPos.x + playerPos.width &&
      this.y + this.radius > playerPos.y &&
      this.y - this.radius < playerPos.y + playerPos.height
    );
  }
}

class Game {
  private canvas: Canvas;
  private rain: Rain;
  private player: Player;
  private lastTime: number = 0;
  private running: boolean = false;
  private keys: { [key: string]: boolean } = {};
  private projectiles: Projectile[] = [];
  private enemies: Enemy[] = [];
  private score: number = 0;
  private enemySpawnTimer: number = 0;
  private enemySpawnInterval: number = 1000; // Spawn enemies every 1 second (decreased from 2 seconds)
  private maxEnemiesPerSpawn: number = 3; // Maximum number of enemies to spawn at once
  private lastKeyPressTime: { [key: string]: number } = {};
  private lastKeyReleaseTime: { [key: string]: number } = {};
  private doublePressThreshold: number = 300; // 300ms threshold for double press
  private logger: Logger;
  private enemyProjectiles: EnemyProjectile[] = [];
  private gameTime: number = 0;
  private difficultyScalingInterval: number = 30000; // Increase difficulty every 30 seconds

  constructor(width: number = 800, height: number = 600) {
    this.canvas = new Canvas(width, height);
    this.rain = new Rain(this.canvas.ctx, this.canvas.element);
    this.player = new Player();
    this.logger = new Logger(this.canvas.ctx);
    this.initializeGame(width, height);
    this.setupEventListeners();
    // Remove this line: this.spawnEnemies();
  }

  private initializeGame(width: number, height: number) {
    // Set canvas size
    this.canvas.element.width = width;
    this.canvas.element.height = height;

    this.canvas.clear();
    this.player.draw(this.canvas.ctx);
    this.setupEventListeners();

    // Append canvas to the document body
    document.body.appendChild(this.canvas.element);
  }

  private setupEventListeners() {
    this.canvas.element.addEventListener(
      "click",
      this.handleCanvasClick.bind(this)
    );
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
    window.addEventListener("keyup", this.handleKeyUp.bind(this));
  }

  private handleCanvasClick(event: MouseEvent) {
    console.log(event);
    alert("Canvas clicked");
  }

  private handleKeyDown(event: KeyboardEvent) {
    const key = event.key;

    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)) {
      if (!this.keys[key]) {  // Only trigger if the key wasn't already pressed
        this.keys[key] = true;
        this.detectDoublePress(key);
        this.logger.log(`Key pressed: ${key}`);
      }
    }

    if (event.code === "Space") {
      this.shootProjectile();
      this.logger.log("Projectile shot");
    }
  }

  private handleKeyUp(event: KeyboardEvent) {
    const key = event.key;

    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)) {
      this.keys[key] = false;
      this.lastKeyReleaseTime[key] = Date.now();
    }
  }

  private removeEventListeners() {
    this.canvas.element.removeEventListener(
      "click",
      this.handleCanvasClick.bind(this)
    );
    window.removeEventListener("keydown", this.handleKeyDown.bind(this));
    window.removeEventListener("keyup", this.handleKeyUp.bind(this));
  }

  start() {
    if (!this.running) {
      this.running = true;
      this.lastTime = performance.now();
      this.gameLoop(this.lastTime);
    }
  }

  stop() {
    this.running = false;
  }

  private gameLoop(currentTime: number) {
    if (!this.running) return;

    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.draw();

    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private update(deltaTime: number) {
    const currentTime = performance.now();
    
    // Handle continuous movement
    if (this.keys["ArrowUp"]) {
      this.player.move("up", this.canvas.element.width, this.canvas.element.height);
    }
    if (this.keys["ArrowDown"]) {
      this.player.move("down", this.canvas.element.width, this.canvas.element.height);
    }
    if (this.keys["ArrowLeft"]) {
      this.player.move("left", this.canvas.element.width, this.canvas.element.height);
    }
    if (this.keys["ArrowRight"]) {
      this.player.move("right", this.canvas.element.width, this.canvas.element.height);
    }

    // Update player
    this.player.update(deltaTime, this.canvas.element.width, this.canvas.element.height);

    this.rain.update(deltaTime);
    this.updateProjectiles();
    this.updateEnemies(deltaTime);
    this.checkCollisions();
    this.checkPlayerEnemyCollision();
    this.spawnEnemies(deltaTime);
    this.updateEnemyProjectiles(deltaTime);
    this.checkPlayerEnemyProjectileCollision();

    this.gameTime += deltaTime * 1000;
    this.updateDifficulty();
  }

  private updateProjectiles() {
    this.projectiles.forEach((projectile) => projectile.update());
    this.projectiles = this.projectiles.filter(
      (projectile) => !projectile.isOffScreen()
    );
  }

  private updateEnemies(deltaTime: number) {
    this.enemies.forEach((enemy) => {
      const projectile = enemy.update(deltaTime, this.canvas.element.width, this.canvas.element.height);
      if (projectile) {
        this.enemyProjectiles.push(projectile);
      }
    });
    this.enemies = this.enemies.filter(
      (enemy) => !enemy.isOffScreen(this.canvas.element.height)
    );
  }

  private updateEnemyProjectiles(deltaTime: number) {
    this.enemyProjectiles.forEach((projectile) => projectile.update(deltaTime));
    this.enemyProjectiles = this.enemyProjectiles.filter(
      (projectile) => !projectile.isOffScreen(this.canvas.element.height)
    );
  }

  private checkPlayerEnemyProjectileCollision() {
    for (const projectile of this.enemyProjectiles) {
      if (projectile.collidesWith(this.player)) {
        this.respawnPlayer();
        // Remove the projectile that hit the player
        this.enemyProjectiles = this.enemyProjectiles.filter(p => p !== projectile);
        break;
      }
    }
  }

  private respawnPlayer() {
    this.player.respawn(this.canvas.element.width, this.canvas.element.height);
    this.logger.log("Player hit by enemy projectile and respawned!");
  }

  private spawnEnemies(deltaTime: number) {
    this.enemySpawnTimer += deltaTime * 1000; // Convert to milliseconds
    if (this.enemySpawnTimer >= this.enemySpawnInterval) {
      this.enemySpawnTimer = 0;
      
      // Spawn 1 to maxEnemiesPerSpawn enemies
      const enemiesToSpawn = Math.floor(Math.random() * this.maxEnemiesPerSpawn) + 1;
      
      for (let i = 0; i < enemiesToSpawn; i++) {
        this.spawnEnemy();
      }
    }
  }

  private spawnEnemy() {
    const x = Math.random() * (this.canvas.element.width - 40);
    const y = -40; // Start above the screen
    const speed = Math.random() * 100 + 50; // Random speed between 50 and 150 pixels per second
    this.enemies.push(new Enemy(x, y, speed));
    console.log("Enemy spawned:", this.enemies.length); // Add this line for debugging
  }

  private draw() {
    this.canvas.fadeBackground();
    this.rain.draw();
    this.player.draw(this.canvas.ctx);
    this.projectiles.forEach((projectile) => projectile.draw(this.canvas.ctx));
    this.enemies.forEach((enemy) => enemy.draw(this.canvas.ctx));
    this.logger.draw(); // Add this line to draw the logs
    this.enemyProjectiles.forEach((projectile) => projectile.draw(this.canvas.ctx));
  }

  private shootProjectile() {
    const playerPosition = this.player.getCenterPosition();
    const projectile = new Projectile(playerPosition.x, playerPosition.y);
    this.projectiles.push(projectile);
  }

  private checkCollisions() {
    this.projectiles = this.projectiles.filter((projectile) => {
      // Check collision with some target (e.g., an enemy)
      // For this example, let's assume we have an array of enemies
      const hitEnemy = this.enemies.find((enemy) =>
        projectile.collidesWith(enemy)
      );

      if (hitEnemy) {
        // Handle the collision (e.g., remove the enemy, increase score)
        this.handleEnemyHit(hitEnemy);
        return false; // Remove the projectile
      }

      return true; // Keep the projectile
    });
  }

  private handleEnemyHit(enemy: Enemy) {
    // Remove the enemy from the game
    this.enemies = this.enemies.filter((e) => e !== enemy);
    // Increase score or perform other actions
    this.score += 10;
  }

  // Add this new method
  private checkPlayerEnemyCollision() {
    const playerPos = this.player.getPosition();
    for (const enemy of this.enemies) {
      if (this.checkCollision(playerPos, enemy)) {
        this.handlePlayerEnemyCollision();
        break; // Exit the loop after the first collision
      }
    }
  }

  // Add this new method
  private checkCollision(
    rect1: { x: number; y: number; width: number; height: number },
    rect2: { x: number; y: number; width: number; height: number }
  ): boolean {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  // Add this new method
  private handlePlayerEnemyCollision() {
    // Respawn the player at the center bottom of the canvas
    this.player.respawn(this.canvas.element.width, this.canvas.element.height);

    // You might want to add additional logic here, such as:
    // - Decreasing player lives
    // - Playing a sound effect
    // - Adding a brief invincibility period
    // - Updating the score
    console.log("Player collided with an enemy and respawned!");
  }

  private detectDoublePress(key: string) {
    const currentTime = Date.now();
    const lastPressTime = this.lastKeyPressTime[key] || 0;
    const lastReleaseTime = this.lastKeyReleaseTime[key] || 0;

    console.log(`Key: ${key}, Current: ${currentTime}, Last Press: ${lastPressTime}, Last Release: ${lastReleaseTime}`); // Add this line

    if (currentTime - lastPressTime <= this.doublePressThreshold && 
        lastReleaseTime > lastPressTime) {
      console.log(`Double press detected: ${key}`);
      this.logger.log(`Double press: ${key}`);
      
      // Trigger dash action
      switch (key) {
        case "ArrowUp":
          this.player.dash("up", this.canvas.element.width, this.canvas.element.height);
          break;
        case "ArrowDown":
          this.player.dash("down", this.canvas.element.width, this.canvas.element.height);
          break;
        case "ArrowLeft":
          this.player.dash("left", this.canvas.element.width, this.canvas.element.height);
          break;
        case "ArrowRight":
          this.player.dash("right", this.canvas.element.width, this.canvas.element.height);
          break;
      }
    }

    this.lastKeyPressTime[key] = currentTime;
  }

  private updateDifficulty() {
    const difficultyLevel = Math.floor(this.gameTime / this.difficultyScalingInterval);
    this.enemySpawnInterval = Math.max(200, 1000 - difficultyLevel * 100); // Minimum 200ms between spawns
    this.maxEnemiesPerSpawn = Math.min(5, 3 + difficultyLevel); // Maximum 5 enemies per spawn
  }
}

export { Game };