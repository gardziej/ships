import Board from "./class/board";
import Button from "./class/button";
import Canvas from "./class/canvas";
import FpsLimiter from "./class/fpsLimiter";
import GameStateManager from "./class/gameStateManager";
import Header from "./class/header";
import Mouse from "./class/mouse";
import Vector2 from "./class/vector2";
import GameState from "./enum/gameState";
import PlayerType from "./enum/playerType";

export default class App {
  public clickable: boolean = false;
  private fpsLimiter = new FpsLimiter(this);
  private canvas: Canvas = new Canvas('canvas');
  public mouse: Mouse;
  private children: (Header | Board)[] = [];
  public gameStateManager: GameStateManager = new GameStateManager();


  private header: Header;
  private startButton: Button;
  private boardPlayer: Board;
  private boardEnemy: Board;

  constructor() {
    this.mouse = new Mouse(this.canvas);
    this.handleMouseInput();

    this.gameStateManager.gameStateChanged$.subscribe((gameState: GameState) => {
      if (gameState === GameState.Init) {
        this.init();
      }
      if (gameState === GameState.Start) {
        this.initBoardEnemy();
        this.startButton.hide();
        this.boardPlayer.editable = false;
        this.header.text = '';
      }
    });

    this.gameStateManager.gameStateChanged$.next(GameState.Init);
  }

  private init(): void {
    this.header = new Header(new Vector2(50, 50), this.canvas.dim.x - 100, 50);
    this.header.text = 'Rozplanuj swoje statki, możesz podnieść statek lewym klawiszem myszki, przenieść go a także obrócić prawym klawiszem myszki.';
    this.children.push(this.header);
    this.initBoardPlayer();
    this.initStartButton();
  }
  
  private initStartButton(): void {
    this.startButton = new Button(new Vector2(1050, 400), 250, 50);
    this.startButton.text = 'rozpocznij grę';
    this.startButton.clickable = true;
    this.startButton.handleMouseInput(this.mouse, () => {
      this.gameStateManager.gameStateChanged$.next(GameState.Start);
    });
    this.children.push(this.startButton);
    this.startButton.show();
  }

  private initBoardPlayer(): void {
    this.boardPlayer = new Board(new Vector2(50, 150), 600, 600, PlayerType.Player, 'Twoje statki');
    this.boardPlayer.addRandomShips();
    this.children.push(this.boardPlayer);
    this.boardPlayer.handleMouseInput(this.mouse, this.canvas);
    this.boardPlayer.logData();
  }

  private initBoardEnemy(): void {
    this.boardEnemy = new Board(new Vector2(1050, 150), 600, 600, PlayerType.Enemy, 'Statki przeciwnika');
    this.children.push(this.boardEnemy);
    this.boardEnemy.addRandomShips();
    this.boardEnemy.editable = false;
    this.boardEnemy.handleMouseInput(this.mouse, this.canvas);
  }

  public handleMouseInput(): void {
    this.mouse.mousePosition$.subscribe((mousePosition: Vector2) => {
      if (this.boardPlayer?.ships?.draggedShip) return;
      if (this.children.some(child => child.isMouseOver(mousePosition))) {
        this.canvas.setPointerCursor();
      }
      else {
        this.canvas.setDefaultCursor();
      }
    });
  }

  public tick(): void {
    this.update();
    this.render();
  }

  public update(): void {
    this.header && this.header.update();
    this.boardPlayer && this.boardPlayer.update();
    this.boardEnemy && this.boardEnemy.update();
    this.startButton && this.startButton.update();
  }

  public render(): void {
    this.canvas.clear();
    this.header && this.header.render(this.canvas.ctx);
    this.boardPlayer && this.boardPlayer.render(this.canvas.ctx);
    this.boardEnemy && this.boardEnemy.render(this.canvas.ctx);
    this.startButton && this.startButton.render(this.canvas.ctx);
  }

}

new App();