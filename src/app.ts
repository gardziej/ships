import bestMoveFinder from "./class/bestMoveFinder";
import Board from "./class/board";
import Button from "./class/button";
import Canvas from "./class/canvas";
import FpsLimiter from "./class/fpsLimiter";
import gameStateManager from "./class/gameStateManager";
import Header from "./class/header";
import Mouse from "./class/mouse";
import Vector2 from "./class/vector2";
import GameState from "./enum/gameState";
import PlayerType from "./enum/playerType";
import { randomBoolean } from "./utils/random";

export default class App {
  public clickable: boolean = false;
  private fpsLimiter = new FpsLimiter(this);
  private canvas: Canvas = new Canvas('canvas');
  public mouse: Mouse;
  private children = new Map();
  private header: Header;
  private startButton: Button;
  private nextGameButton: Button;
  private boardPlayer: Board;
  private boardEnemy: Board;

  constructor() {
    this.mouse = new Mouse(this.canvas);
    this.handleMouseInput();

    this.initStartButton();
    this.initNextGameButton();

    gameStateManager.gameStateChanged$.subscribe((gameState: GameState) => {
      if (gameState === GameState.Init) {
        this.init();
      }
      if (gameState === GameState.Start) {
        this.initBoardEnemy();
        this.startButton.hide();
        this.boardPlayer.editable = false;
        this.header.text = '';
        gameStateManager.gameStateChanged$.next(randomBoolean() ? GameState.PlayerMove : GameState.EnemyMove); 
      }
      if (gameState === GameState.PlayerMove) {
        this.header.text = 'Twój ruch';
        this.checkForWinCondition();
      }
      if (gameState === GameState.EnemyMove) {
        if (this.checkForWinCondition()) {
          return;
        }
        this.header.text = 'Ruch przeciwnika';
        setTimeout(() => {
          const bestMove: Vector2 = bestMoveFinder.findBestMove(this.boardPlayer.boardData.getDataForFinder());
          if (!this.boardPlayer.boardData.getCellAtCords(bestMove).bomb()) {
            gameStateManager.gameStateChanged$.next(GameState.PlayerMove);
          }
          else {
            gameStateManager.gameStateChanged$.next(GameState.EnemyMove);
          }
          this.boardPlayer && this.boardPlayer.setLastMove(bestMove);
        }, 300);
      }
      if (gameState === GameState.Finished) {
        this.nextGameButton.show();
      }
    });

  }

  private reset(): void {
    if (this.boardPlayer) {
      this.boardPlayer.destroy();
      this.boardPlayer = null;
    }
    if (this.boardEnemy) {
      this.boardEnemy.destroy();
      this.boardEnemy = null;
    }
  }

  private init(): void {
    this.reset();
    this.header = new Header(new Vector2(50, 50), this.canvas.dim.x - 100, 50);
    this.header.text = 'Rozplanuj swoje statki, możesz podnieść statek lewym klawiszem myszki, przenieść go a także obrócić prawym klawiszem myszki.';
    this.children.set('header', this.header);
    this.initBoardPlayer();
    this.startButton.show();
    this.nextGameButton.hide();
  }
  
  private initStartButton(): void {
    this.startButton = new Button(new Vector2(1050, 400), 250, 50);
    this.startButton.text = 'rozpocznij grę';
    this.startButton.handleMouseInput(this.mouse, () => {
      gameStateManager.gameStateChanged$.next(GameState.Start);
    });
    this.children.set('startButton', this.startButton);
    this.startButton.show();
  }

  private initNextGameButton(): void {
    this.nextGameButton = new Button(new Vector2(700, 120), 300, 50);
    this.nextGameButton.text = 'zagraj jeszcze raz';
    this.nextGameButton.handleMouseInput(this.mouse, () => {
      gameStateManager.gameStateChanged$.next(GameState.Init);
    });
    this.children.set('nextGameButton', this.nextGameButton);
  }

  private initBoardPlayer(): void {
    this.boardPlayer = new Board(new Vector2(50, 150), 600, 600, PlayerType.Player, 'Twoje statki');
    this.boardPlayer.addRandomShips();
    this.children.set('boardPlayer', this.boardPlayer);
    this.boardPlayer.handleMouseInput(this.mouse, this.canvas);
  }

  private initBoardEnemy(): void {
    this.boardEnemy = new Board(new Vector2(1050, 150), 600, 600, PlayerType.Enemy, 'Statki przeciwnika');
    this.children.set('boardEnemy', this.boardEnemy);
    this.boardEnemy.addRandomShips();
    this.boardEnemy.editable = false;
    this.boardEnemy.handleMouseInput(this.mouse, this.canvas);
  }

  public handleMouseInput(): void {
    this.mouse.mousePosition$.subscribe((mousePosition: Vector2) => {
      if (this.boardPlayer?.ships?.draggedShip) return;
      if (Array.from(this.children.values()).some(child => child.isMouseOver(mousePosition))) {
        this.canvas.setPointerCursor();
      }
      else {
        this.canvas.setDefaultCursor();
      }
    });
  }

  public checkForWinCondition(): boolean {
    const testP = this.boardPlayer.ships.getUndestroyedShipsNumber();
    const testE = this.boardEnemy.ships.getUndestroyedShipsNumber();
    if (Math.min(testP, testE) === 0) {
      gameStateManager.gameStateChanged$.next(GameState.Finished);
      if (testE === 0) {
        this.header.text = 'GRATULACJE! Wygrana';
      } else {
        this.header.text = 'KONIEC! Przeciwnik wygrał';
      }
      return true;
    }
    return false;
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
    this.nextGameButton && this.nextGameButton.update();
  }

  public render(): void {
    this.canvas.clear();
    this.header && this.header.render(this.canvas.ctx);
    this.boardPlayer && this.boardPlayer.render(this.canvas.ctx);
    this.boardEnemy && this.boardEnemy.render(this.canvas.ctx);
    this.startButton && this.startButton.render(this.canvas.ctx);
    this.nextGameButton && this.nextGameButton.render(this.canvas.ctx);
  }

}

new App();