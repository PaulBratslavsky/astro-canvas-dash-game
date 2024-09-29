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

class Grid {
  protected rows: number;
  protected cols: number;
  protected cellSize: number;
  protected grid: any[][];

  constructor(rows: number, cols: number, cellSize: number) {
    this.rows = rows;
    this.cols = cols;
    this.cellSize = cellSize;
    this.grid = this.initializeGrid();
  }

  private initializeGrid(): any[][] {
    return Array(this.rows).fill(null).map(() => Array(this.cols).fill(null));
  }

  public getCell(row: number, col: number): any {
    return this.grid[row][col];
  }

  public setCell(row: number, col: number, value: any): void {
    this.grid[row][col] = value;
  }

  public forEach(callback: (value: any, row: number, col: number) => void): void {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        callback(this.grid[row][col], row, col);
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;

    for (let row = 0; row <= this.rows; row++) {
      ctx.beginPath();
      ctx.moveTo(0, row * this.cellSize);
      ctx.lineTo(this.cols * this.cellSize, row * this.cellSize);
      ctx.stroke();
    }

    for (let col = 0; col <= this.cols; col++) {
      ctx.beginPath();
      ctx.moveTo(col * this.cellSize, 0);
      ctx.lineTo(col * this.cellSize, this.rows * this.cellSize);
      ctx.stroke();
    }
  }
}

interface Point {
  row: number;
  col: number;
}

class PriorityQueue<T> {
  private items: { element: T; priority: number }[] = [];

  enqueue(element: T, priority: number) {
    this.items.push({ element, priority });
    this.items.sort((a, b) => a.priority - b.priority);
  }

  dequeue(): T | undefined {
    return this.items.shift()?.element;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

class Bomb {
  public row: number;
  public col: number;
  private timer: number;
  private explosionRadius: number;

  constructor(row: number, col: number, timer: number = 3000, explosionRadius: number = 1) {
    this.row = row;
    this.col = col;
    this.timer = timer;
    this.explosionRadius = explosionRadius;
    console.log('Bomb created at', row, col); // Debug log
  }

  public update(deltaTime: number): boolean {
    this.timer -= deltaTime;
    if (this.timer <= 0) {
      console.log('Bomb exploding at', this.row, this.col); // Debug log
    }
    return this.timer > 0;
  }

  public draw(ctx: CanvasRenderingContext2D, cellSize: number): void {
    const centerX = (this.col + 0.5) * cellSize;
    const centerY = (this.row + 0.5) * cellSize;
    
    // Draw bomb
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(centerX, centerY, cellSize * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Draw fuse
    ctx.strokeStyle = 'orange';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + cellSize * 0.2, centerY - cellSize * 0.2);
    ctx.stroke();

    // Draw timer
    ctx.font = `${cellSize * 0.4}px Arial`;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(Math.ceil(this.timer / 1000).toString(), centerX, centerY);
  }

  public explode(): { row: number, col: number }[] {
    const affectedCells: { row: number, col: number }[] = [];
    for (let r = -this.explosionRadius; r <= this.explosionRadius; r++) {
      for (let c = -this.explosionRadius; c <= this.explosionRadius; c++) {
        if (Math.abs(r) + Math.abs(c) <= this.explosionRadius) {
          affectedCells.push({ row: this.row + r, col: this.col + c });
        }
      }
    }
    return affectedCells;
  }
}

class Player {
  public row: number;
  public col: number;
  private color: string = 'blue';
  private moveTimer: number = 0;
  private moveDelay: number = 600; // 600ms delay between moves
  private path: Point[] = [];
  private maxRow: number;
  private maxCol: number;
  private bombs: Bomb[] = [];
  private bombCooldown: number = 0;
  private bombCooldownTime: number = 1000; // 1 second cooldown

  constructor(rows: number, cols: number) {
    this.row = rows - 1;
    this.col = Math.floor(cols / 2);
    this.maxRow = rows;
    this.maxCol = cols;
  }

  public draw(ctx: CanvasRenderingContext2D, cellSize: number): void {
    const cellX = this.col * cellSize;
    const cellY = this.row * cellSize;
    const size = cellSize * 0.8; // Player size is 80% of cell size
    const x = cellX + (cellSize - size) / 2; // Center horizontally
    const y = cellY + (cellSize - size) / 2; // Center vertically
    const radius = size / 4; // Adjust this value to change the roundness of corners

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + size - radius, y);
    ctx.quadraticCurveTo(x + size, y, x + size, y + radius);
    ctx.lineTo(x + size, y + size - radius);
    ctx.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
    ctx.lineTo(x + radius, y + size);
    ctx.quadraticCurveTo(x, y + size, x, y + size - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();

    // Optional: Add an outline
    ctx.strokeStyle = 'darkBlue';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  public setPath(path: Point[]): void {
    this.path = path;
  }

  public move(deltaTime: number): void {
    this.moveTimer += deltaTime;
    if (this.path.length > 0 && this.moveTimer >= this.moveDelay) {
      const nextPoint = this.path.shift()!;
      this.row = nextPoint.row;
      this.col = nextPoint.col;
      this.moveTimer = 0;
    }
  }

  public moveInDirection(direction: 'up' | 'down' | 'left' | 'right'): void {
    switch (direction) {
      case 'up':
        if (this.row > 0) this.row--;
        break;
      case 'down':
        if (this.row < this.maxRow - 1) this.row++;
        break;
      case 'left':
        if (this.col > 0) this.col--;
        break;
      case 'right':
        if (this.col < this.maxCol - 1) this.col++;
        break;
    }
  }

  public dropBomb(): void {
    if (this.bombCooldown <= 0) {
      console.log('Dropping bomb at', this.row, this.col); // Debug log
      this.bombs.push(new Bomb(this.row, this.col));
      this.bombCooldown = this.bombCooldownTime;
    } else {
      console.log('Bomb on cooldown', this.bombCooldown); // Debug log
    }
  }

  public updateBombs(deltaTime: number): { row: number, col: number }[] {
    this.bombCooldown = Math.max(0, this.bombCooldown - deltaTime);
    let explosions: { row: number, col: number }[] = [];
    this.bombs = this.bombs.filter(bomb => {
      if (!bomb.update(deltaTime)) {
        explosions = explosions.concat(bomb.explode());
        return false;
      }
      return true;
    });
    if (this.bombs.length > 0) {
      console.log('Active bombs:', this.bombs.length); // Debug log
    }
    return explosions;
  }

  public drawBombs(ctx: CanvasRenderingContext2D, cellSize: number): void {
    this.bombs.forEach(bomb => bomb.draw(ctx, cellSize));
  }
}

class MouseHandler {
  private canvas: HTMLCanvasElement;
  private cellSize: number;
  private hoveredCell: { row: number; col: number } | null = null;
  private clickedCell: Point | null = null;

  constructor(canvas: HTMLCanvasElement, cellSize: number) {
    this.canvas = canvas;
    this.cellSize = cellSize;
    this.addEventListeners();
  }

  private addEventListeners(): void {
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseout', this.handleMouseOut.bind(this));
    this.canvas.addEventListener('click', this.handleClick.bind(this));
  }

  private handleMouseMove(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);
    
    this.hoveredCell = { row, col };
  }

  private handleMouseOut(): void {
    this.hoveredCell = null;
  }

  public getHoveredCell(): { row: number; col: number } | null {
    return this.hoveredCell;
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    if (this.hoveredCell) {
      const { row, col } = this.hoveredCell;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(
        col * this.cellSize,
        row * this.cellSize,
        this.cellSize,
        this.cellSize
      );
    }
  }

  private handleClick(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);
    
    this.clickedCell = { row, col };
  }

  public getClickedCell(): Point | null {
    const cell = this.clickedCell;
    this.clickedCell = null;
    return cell;
  }
}

class Enemy {
  public row: number;
  public col: number;
  private normalColor: string = 'orange';
  private alertColor: string = 'red';
  private currentColor: string;
  private moveTimer: number = 0;
  private moveDelay: number = 800; // 800ms delay between moves
  private patrolTimer: number = 0;
  private patrolDelay: number = 1000; // 2 seconds between patrol moves
  private maxRow: number;
  private maxCol: number;
  private isPlayerDetected: boolean = false;

  constructor(row: number, col: number, maxRow: number, maxCol: number) {
    this.row = row;
    this.col = col;
    this.maxRow = maxRow;
    this.maxCol = maxCol;
    this.currentColor = this.normalColor;
  }

  public move(deltaTime: number, playerRow: number, playerCol: number, isPlayerNearby: boolean): void {
    this.moveTimer += deltaTime;
    this.patrolTimer += deltaTime;

    this.isPlayerDetected = isPlayerNearby;
    this.currentColor = this.isPlayerDetected ? this.alertColor : this.normalColor;

    if (this.moveTimer >= this.moveDelay) {
      if (this.isPlayerDetected) {
        this.moveTowardsPlayer(playerRow, playerCol);
      } else if (this.patrolTimer >= this.patrolDelay) {
        this.patrol();
        this.patrolTimer = 0;
      }
      this.moveTimer = 0;
    }
  }

  private moveTowardsPlayer(playerRow: number, playerCol: number): void {
    const dx = playerCol - this.col;
    const dy = playerRow - this.row;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      this.col += Math.sign(dx);
    } else {
      this.row += Math.sign(dy);
    }
  }

  private patrol(): void {
    const directions = [
      [-1, 0], [1, 0], [0, -1], [0, 1] // up, down, left, right
    ];
    const [dy, dx] = directions[Math.floor(Math.random() * directions.length)];
    
    const newRow = this.row + dy;
    const newCol = this.col + dx;

    if (newRow >= 0 && newRow < this.maxRow && newCol >= 0 && newCol < this.maxCol) {
      this.row = newRow;
      this.col = newCol;
    }
  }

  public draw(ctx: CanvasRenderingContext2D, cellSize: number): void {
    const centerX = (this.col + 0.5) * cellSize;
    const centerY = (this.row + 0.5) * cellSize;
    const radius = cellSize * 0.4; // Slightly smaller than the cell

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = this.currentColor;
    ctx.fill();
    ctx.closePath();

    // Optional: Add an outline
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

class Game {
  private canvas: Canvas;
  private grid: Grid;
  private cellSize: number;
  private rows: number;
  private cols: number;
  private player: Player;
  private mouseHandler: MouseHandler;
  private lastTime: number = 0;
  private enemies: Enemy[] = [];
  private keyState: { [key: string]: boolean } = {};
  private explosions: { row: number, col: number, timer: number }[] = [];
  private moveDelay: number = 200; // 200ms delay between moves
  private lastMoveTime: number = 0;

  constructor(width: number = 800, height: number = 600, canvasId: string = "canvas") {
    this.canvas = new Canvas(width, height, canvasId);
    
    // Calculate the number of rows and columns
    this.rows = 20; // You can adjust this number to change the grid density
    this.cols = Math.floor(this.rows * (width / height));
    
    // Calculate the cell size based on the canvas dimensions and grid size
    this.cellSize = width / this.cols;
    
    // Adjust canvas size to fit the grid perfectly
    this.canvas.element.width = this.cellSize * this.cols;
    this.canvas.element.height = this.cellSize * this.rows;
    
    this.grid = new Grid(this.rows, this.cols, this.cellSize);
    this.player = new Player(this.rows, this.cols);
    this.mouseHandler = new MouseHandler(this.canvas.element, this.cellSize);
    this.lastTime = performance.now();
    this.spawnEnemies(5); // Spawn 5 enemies
    this.addKeyboardListeners();
  }

  public init(): void {
    // Initialize game state if needed
  }

  private heuristic(a: Point, b: Point): number {
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
  }

  private getNeighbors(point: Point): Point[] {
    const { row, col } = point;
    const neighbors: Point[] = [];
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      if (newRow >= 0 && newRow < this.rows && newCol >= 0 && newCol < this.cols) {
        neighbors.push({ row: newRow, col: newCol });
      }
    }

    return neighbors;
  }

  private findPath(start: Point, goal: Point): Point[] {
    const frontier = new PriorityQueue<Point>();
    frontier.enqueue(start, 0);
    const cameFrom = new Map<string, Point>();
    const costSoFar = new Map<string, number>();
    cameFrom.set(`${start.row},${start.col}`, start);
    costSoFar.set(`${start.row},${start.col}`, 0);

    while (!frontier.isEmpty()) {
      const current = frontier.dequeue()!;

      if (current.row === goal.row && current.col === goal.col) {
        break;
      }

      for (const next of this.getNeighbors(current)) {
        const newCost = costSoFar.get(`${current.row},${current.col}`)! + 1;
        const nextKey = `${next.row},${next.col}`;

        if (!costSoFar.has(nextKey) || newCost < costSoFar.get(nextKey)!) {
          costSoFar.set(nextKey, newCost);
          const priority = newCost + this.heuristic(next, goal);
          frontier.enqueue(next, priority);
          cameFrom.set(nextKey, current);
        }
      }
    }

    const path: Point[] = [];
    let current = goal;
    while (current.row !== start.row || current.col !== start.col) {
      path.unshift(current);
      current = cameFrom.get(`${current.row},${current.col}`)!;
    }
    return path;
  }

  private spawnEnemies(count: number): void {
    for (let i = 0; i < count; i++) {
      const row = Math.floor(Math.random() * this.rows);
      const col = Math.floor(Math.random() * this.cols);
      this.enemies.push(new Enemy(row, col, this.rows, this.cols));
    }
  }

  private isWithinRadius(entity1: { row: number, col: number }, entity2: { row: number, col: number }, radius: number): boolean {
    const dx = entity1.col - entity2.col;
    const dy = entity1.row - entity2.row;
    return Math.sqrt(dx * dx + dy * dy) <= radius;
  }

  private addKeyboardListeners(): void {
    window.addEventListener('keydown', (e) => {
      this.keyState[e.key.toLowerCase()] = true;
      if (e.key.toLowerCase() === 'b') {
        console.log('B key pressed'); // Debug log
        this.player.dropBomb();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keyState[e.key.toLowerCase()] = false;
    });
  }

  public update(): void {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Handle player movement
    if (currentTime - this.lastMoveTime >= this.moveDelay) {
      let moved = false;
      if (this.keyState['arrowup'] || this.keyState['w']) {
        this.player.moveInDirection('up');
        moved = true;
      } else if (this.keyState['arrowdown'] || this.keyState['s']) {
        this.player.moveInDirection('down');
        moved = true;
      } else if (this.keyState['arrowleft'] || this.keyState['a']) {
        this.player.moveInDirection('left');
        moved = true;
      } else if (this.keyState['arrowright'] || this.keyState['d']) {
        this.player.moveInDirection('right');
        moved = true;
      }

      if (moved) {
        this.lastMoveTime = currentTime;
      }
    }

    const clickedCell = this.mouseHandler.getClickedCell();
    if (clickedCell) {
      const path = this.findPath({ row: this.player.row, col: this.player.col }, clickedCell);
      this.player.setPath(path);
    }
    this.player.move(deltaTime);

    // Update enemies
    this.enemies.forEach(enemy => {
      const isPlayerNearby = this.isWithinRadius(enemy, this.player, 3);
      enemy.move(deltaTime, this.player.row, this.player.col, isPlayerNearby);
    });

    const newExplosions = this.player.updateBombs(deltaTime);
    if (newExplosions.length > 0) {
      console.log('New explosions:', newExplosions); // Debug log
    }
    this.explosions = this.explosions.concat(newExplosions.map(e => ({ ...e, timer: 500 })));

    // Update and remove old explosions
    this.explosions = this.explosions.filter(explosion => {
      explosion.timer -= deltaTime;
      return explosion.timer > 0;
    });

    // Check if enemies are caught in explosions
    this.enemies = this.enemies.filter(enemy => {
      return !this.explosions.some(explosion => 
        explosion.row === enemy.row && explosion.col === enemy.col
      );
    });
  }

  private gameLoop(): void {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.gameLoop());
  }

  public start(): void {
    this.init();
    requestAnimationFrame(() => this.gameLoop());
  }

  public draw(): void {
    this.canvas.clear();
    this.grid.draw(this.canvas.ctx);
    this.mouseHandler.draw(this.canvas.ctx);
    this.enemies.forEach(enemy => enemy.draw(this.canvas.ctx, this.cellSize));
    this.player.drawBombs(this.canvas.ctx, this.cellSize);
    this.drawExplosions();
    this.player.draw(this.canvas.ctx, this.cellSize);
  }

  private drawExplosions(): void {
    this.explosions.forEach(explosion => {
      const x = explosion.col * this.cellSize;
      const y = explosion.row * this.cellSize;
      this.canvas.ctx.fillStyle = `rgba(255, 0, 0, ${explosion.timer / 500})`;
      this.canvas.ctx.fillRect(x, y, this.cellSize, this.cellSize);
    });
  }
}

export { Game, Canvas, Player, MouseHandler, Enemy, Bomb };