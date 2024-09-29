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

class PriorityQueue<T> {
  private elements: [T, number][] = [];

  enqueue(element: T, priority: number): void {
    this.elements.push([element, priority]);
    this.elements.sort((a, b) => a[1] - b[1]);
  }

  dequeue(): T | undefined {
    return this.elements.shift()?.[0];
  }

  isEmpty(): boolean {
    return this.elements.length === 0;
  }

  includes(element: T): boolean {
    return this.elements.some(([e]) => e === element);
  }
}

interface INode {
  id: string;
  neighbors: string[];
  position: { x: number; y: number };
  g: number;
}

class PathFinder {
    private graph: Map<string, INode>;

    constructor(graph: Map<string, INode>) {
        this.graph = graph;
    }

    findShortestPath(start: string, end: string): { path: string[], nodes: INode[] } | null {
        const { path, nodes } = this.performAStarSearch(start, end);
        return path.length > 0 ? { path, nodes } : null;
    }

    private performAStarSearch(start: string, end: string): { path: string[], nodes: INode[] } {
        const openSet = new PriorityQueue<string>();
        openSet.enqueue(start, 0);
        
        const cameFrom = new Map<string, string>();
        const gScore = new Map<string, number>();
        gScore.set(start, 0);

        const fScore = new Map<string, number>();
        fScore.set(start, this.h(start, end));

        const visitedNodes: INode[] = [];

        while (!openSet.isEmpty()) {
            const current = openSet.dequeue()!;
            visitedNodes.push(this.graph.get(current)!);

            if (current === end) {
                return {
                    path: this.reconstructPath(cameFrom, end),
                    nodes: visitedNodes
                };
            }

            const currentNode = this.graph.get(current)!;
            for (const neighbor of currentNode.neighbors) {
                const tentativeGScore = gScore.get(current)! + this.calculateDistance(current, neighbor);

                if (!gScore.has(neighbor) || tentativeGScore < gScore.get(neighbor)!) {
                    cameFrom.set(neighbor, current);
                    gScore.set(neighbor, tentativeGScore);
                    fScore.set(neighbor, tentativeGScore + this.h(neighbor, end));

                    if (!openSet.includes(neighbor)) {
                        openSet.enqueue(neighbor, fScore.get(neighbor)!);
                    }
                }
            }
        }

        return { path: [], nodes: visitedNodes };
    }

    private reconstructPath(cameFrom: Map<string, string>, current: string): string[] {
        const totalPath = [current];
        while (cameFrom.has(current)) {
            current = cameFrom.get(current)!;
            totalPath.unshift(current);
        }
        return totalPath;
    }

    private calculateDistance(nodeA: string, nodeB: string): number {
        const posA = this.graph.get(nodeA)!.position;
        const posB = this.graph.get(nodeB)!.position;
        return Math.sqrt(
            Math.pow(posA.x - posB.x, 2) + 
            Math.pow(posA.y - posB.y, 2)
        );
    }

    private calculateHeuristic(node: string, goal: string): number {
        const nodePos = this.graph.get(node)!.position;
        const goalPos = this.graph.get(goal)!.position;
        
        // Calculate Euclidean distance
        const distance = Math.sqrt(
            Math.pow(nodePos.x - goalPos.x, 2) + 
            Math.pow(nodePos.y - goalPos.y, 2)
        );
        
        // Get the node's weight (assuming it's stored in the 'g' property)
        const weight = this.graph.get(node)!.g;
        
        // Combine distance and weight for the heuristic
        return distance * (1 + weight);
    }

    private f(node: string, goal: string): number {
        return (this.g(node) ?? Infinity) + this.h(node, goal);
    }

    private g(node: string): number | undefined {
        return this.graph.get(node)?.g;
    }

    private h(node: string, goal: string): number {
        const nodePos = this.graph.get(node)!.position;
        const goalPos = this.graph.get(goal)!.position;
        return Math.sqrt(
            Math.pow(nodePos.x - goalPos.x, 2) + 
            Math.pow(nodePos.y - goalPos.y, 2)
        );
    }
}

class Node {
  public isStart: boolean = false;
  public isEnd: boolean = false;
  public weight: number | null = null;
  public isOnPath: boolean = false;

  constructor(
    public x: number,
    public y: number,
    public radius: number = 20,
    public color: string = 'white'
  ) {}

  draw(ctx: CanvasRenderingContext2D) {
    const fillColor = this.isStart ? 'green' : this.isEnd ? 'red' : this.isOnPath ? 'yellow' : this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.closePath();

    // Draw weight if it exists
    if (this.weight !== null) {
      ctx.font = '12px Arial';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.weight.toFixed(0), this.x, this.y);
    }
  }
}

class Edge {
  public isOnPath: boolean = false;

  constructor(
    public start: Node,
    public end: Node
  ) {}

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.moveTo(this.start.x, this.start.y);
    ctx.lineTo(this.end.x, this.end.y);
    
    // Change color and line width if the edge is on the path
    if (this.isOnPath) {
      ctx.strokeStyle = 'yellow';
      ctx.lineWidth = 3;
    } else {
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1;
    }
    
    ctx.stroke();

    // Calculate and draw the edge length
    const length = Math.sqrt((this.end.x - this.start.x) ** 2 + (this.end.y - this.start.y) ** 2);
    const midX = (this.start.x + this.end.x) / 2;
    const midY = (this.start.y + this.end.y) / 2;
    
    ctx.font = '12px Arial';
    ctx.fillStyle = this.isOnPath ? 'yellow' : 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(length.toFixed(0), midX, midY);
  }
}

class Game {
  private canvas: Canvas;
  private nodes: Node[] = [];
  private edges: Edge[] = [];
  private isDragging: boolean = false;
  private selectedNode: Node | null = null;
  private hoveredNode: Node | null = null;
  private isSpacePressed: boolean = false;
  private startNode: Node | null = null;
  private endNode: Node | null = null;
  private pathFinder: PathFinder | null = null;

  constructor() {
    this.canvas = new Canvas();
    this.initializeGame();
    this.addEventListeners();
  }

  private initializeGame(width: number = 800, height: number = 600) {
    this.canvas.element.width = width;
    this.canvas.element.height = height;
    this.canvas.clear();
    this.canvas.fadeBackground();
  }

  private addEventListeners() {
    this.canvas.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.element.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.element.addEventListener('mouseup', this.handleMouseUp.bind(this));
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
  }

  private handleMouseDown(event: MouseEvent) {
    const { x, y } = this.getMousePosition(event);
    const clickedNode = this.findNodeAtPosition(x, y);
    
    if (clickedNode) {
      this.isDragging = true;
      this.selectedNode = clickedNode;
    } else if (!this.isSpacePressed) {
      const newNode = new Node(x, y);
      this.nodes.push(newNode);
    }
    
    this.draw();
  }

  private handleMouseMove(event: MouseEvent) {
    const { x, y } = this.getMousePosition(event);
    this.hoveredNode = this.findNodeAtPosition(x, y);

    if (this.isDragging && this.selectedNode) {
      if (this.isSpacePressed) {
        // Move the node
        this.selectedNode.x = x;
        this.selectedNode.y = y;
        this.recalculateWeights(); // Add this line
      } else {
        // Draw temporary edge
        this.draw();
        this.drawTemporaryEdge(x, y);
        return;
      }
    }
    this.draw();
  }

  private handleMouseUp(event: MouseEvent) {
    if (this.isDragging && this.selectedNode) {
      if (!this.isSpacePressed) {
        const { x, y } = this.getMousePosition(event);
        const targetNode = this.findNodeAtPosition(x, y);
        
        if (targetNode && targetNode !== this.selectedNode) {
          this.edges.push(new Edge(this.selectedNode, targetNode));
        }
      }
      
      this.isDragging = false;
      this.selectedNode = null;
      this.draw();
    }
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (event.code === 'Space') {
      this.isSpacePressed = true;
    }
    if (this.hoveredNode) {
      if (event.key === 's' || event.key === 'S') {
        this.nodes.forEach(node => node.isStart = false);
        this.hoveredNode.isStart = true;
        this.hoveredNode.isEnd = false;
        this.startNode = this.hoveredNode;
        this.updateWeights();
        this.resetPath();
        if (this.endNode) {
          this.findAndHighlightPath();
        }
      } else if (event.key === 'e' || event.key === 'E') {
        this.nodes.forEach(node => node.isEnd = false);
        this.hoveredNode.isEnd = true;
        this.hoveredNode.isStart = false;
        this.endNode = this.hoveredNode;
        this.updateWeights();
        this.findAndHighlightPath();
      }
      this.draw();
    }
  }

  private handleKeyUp(event: KeyboardEvent) {
    if (event.code === 'Space') {
      this.isSpacePressed = false;
    }
  }

  private getMousePosition(event: MouseEvent): { x: number, y: number } {
    const rect = this.canvas.element.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  private findNodeAtPosition(x: number, y: number): Node | null {
    return this.nodes.find(node => 
      Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2) <= node.radius
    ) || null;
  }

  private drawTemporaryEdge(x: number, y: number) {
    if (this.selectedNode) {
      const tempEdge = new Edge(this.selectedNode, new Node(x, y));
      tempEdge.draw(this.canvas.ctx);
    }
  }

  private draw() {
    this.canvas.clear();
    
    for (const edge of this.edges) {
      edge.draw(this.canvas.ctx);
    }
    
    for (const node of this.nodes) {
      node.draw(this.canvas.ctx);
    }
  }

  private updateWeights() {
    this.recalculateWeights();
  }

  private resetPath() {
    this.nodes.forEach(node => node.isOnPath = false);
    this.edges.forEach(edge => edge.isOnPath = false);
  }

  private findAndHighlightPath() {
    if (this.startNode && this.endNode) {
      const graph = this.createGraph();
      this.pathFinder = new PathFinder(graph);
      const result = this.pathFinder.findShortestPath(this.startNode.x + ',' + this.startNode.y, this.endNode.x + ',' + this.endNode.y);
      
      if (result) {
        this.resetPath();
        for (let i = 0; i < result.path.length - 1; i++) {
          const [x1, y1] = result.path[i].split(',').map(Number);
          const [x2, y2] = result.path[i + 1].split(',').map(Number);
          const node1 = this.findNodeAtPosition(x1, y1);
          const node2 = this.findNodeAtPosition(x2, y2);
          if (node1 && node2) {
            node1.isOnPath = true;
            node2.isOnPath = true;
            const edge = this.findEdge(node1, node2);
            if (edge) {
              edge.isOnPath = true;
            }
          }
        }
      }
    }
    this.draw();
  }

  private createGraph(): Map<string, INode> {
    const graph = new Map<string, INode>();
    
    this.nodes.forEach(node => {
      const nodeId = `${node.x},${node.y}`;
      graph.set(nodeId, {
        id: nodeId,
        neighbors: this.getNeighbors(node).map(n => `${n.x},${n.y}`),
        position: { x: node.x, y: node.y },
        g: 0
      });
    });

    return graph;
  }

  private getNeighbors(node: Node): Node[] {
    return this.edges
      .filter(edge => edge.start === node || edge.end === node)
      .map(edge => edge.start === node ? edge.end : edge.start);
  }

  private recalculateWeights() {
    if (this.startNode && this.endNode) {
      for (const node of this.nodes) {
        if (node === this.startNode) {
          node.weight = 0;
        } else if (node === this.endNode) {
          const dx = node.x - this.startNode.x;
          const dy = node.y - this.startNode.y;
          node.weight = Math.sqrt(dx * dx + dy * dy);
        } else {
          const dxStart = node.x - this.startNode.x;
          const dyStart = node.y - this.startNode.y;
          const dxEnd = this.endNode.x - node.x;
          const dyEnd = this.endNode.y - node.y;
          const distanceToStart = Math.sqrt(dxStart * dxStart + dyStart * dyStart);
          const distanceToEnd = Math.sqrt(dxEnd * dxEnd + dyEnd * dyEnd);
          node.weight = distanceToStart + distanceToEnd;
        }
      }
    } else {
      for (const node of this.nodes) {
        node.weight = null;
      }
    }
    this.findAndHighlightPath(); // Recalculate the path after updating weights
  }

  private findEdge(node1: Node, node2: Node): Edge | undefined {
    return this.edges.find(edge => 
      (edge.start === node1 && edge.end === node2) || 
      (edge.start === node2 && edge.end === node1)
    );
  }
}

export { Game };