import GameState from "../enum/gameState";
import PlayerType from "../enum/playerType";
import Board from "./board";
import gameStateManager from "./gameStateManager";
import Ship from "./ship";
import Vector2 from "./vector2";

export default class BoardShipsSummary {

  constructor(
    public board: Board,
    public position: Vector2,
    public width: number,
    public height: number,
  ) {

  }

  get visible(): boolean {
    return gameStateManager.getCurrentGameState() > GameState.Start;
  }

  public update(): void {
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.visible) return;
    ctx.save();

    const cellSize: number = this.board.cellSize.y / 2;
    this.board.ships.ships.forEach((ship: Ship, index: number) => {
      ctx.save();
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 1;
      ctx.fillStyle = ship.isDestroyed ? 'rgb(255, 0, 0, 0.4)' : 'rgb(0, 255, 0, 0.2)';
      ctx.beginPath();
      this.board.playerType === PlayerType.Player 
        ? ctx.rect(
            this.position.x, 
            this.position.y + cellSize + cellSize * index * 1.5, 
            cellSize * ship.size, 
            cellSize)
        : ctx.rect(
            this.position.x + cellSize * 4 - cellSize * ship.size, 
            this.position.y + cellSize + cellSize * index * 1.5, 
            cellSize * ship.size, 
            cellSize);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });

    ctx.restore();
  }  

}