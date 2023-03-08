import CellState from "../enum/cellState";
import PlayerType from "../enum/playerType";
import Clickable from "../interfaces/clickable.interface";
import Drawable from "../interfaces/drawable.interface";
import { getRandomColor } from "../utils/random";
import Rectangle from "./rectangle";
import Ship from "./ship";
import Vector2 from "./vector2";

export default class BoardCell implements Drawable, Clickable {

  public state: CellState = CellState.Empty;
  public color: string = getRandomColor();

  constructor(
    public position: Vector2,
    public width: number,
    public height: number,
    public boardCoords: Vector2,
    public playerType: PlayerType,
    public ship: Ship = null
  ) {
  }

  public isMouseOver(mousePosition: Vector2): boolean {
    return this.clickable && Rectangle.containsPoint(this, mousePosition);
  }

  get clickable(): boolean {
    return this.playerType === PlayerType.Player 
      ? this.state === CellState.Ship 
      : ![CellState.Missed, CellState.Deducted, CellState.ShipBombed, CellState.ShipDestroyed].includes(this.state);
  }

  get cellSize(): Vector2 {
    return new Vector2(this.width, this.height);
  }

  get stateSign(): string {
    switch (this.state) {
      case CellState.Empty: return '_';
      case CellState.Deducted: return ',';
      case CellState.Missed: return '.';
      case CellState.Ship: return 'S';
      case CellState.ShipBombed: return 'X';
      case CellState.ShipDestroyed: return 'D';
      case CellState.Hollow: return 'H';
    }
  }

  public bomb(): boolean {
    if (this.state === CellState.Empty) {
      this.state = CellState.Missed;
      return false;
    }
    if (this.state === CellState.Ship) {
      this.state = CellState.ShipBombed;
      console.log('PRG: this.ship', this.ship); // TODO remove this
      return true;
    }
  }

  public update(): void {
    
  }

  public render(ctx: CanvasRenderingContext2D): void {
    switch (this.state) {
      case CellState.Missed:
        ctx.save();
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(
          this.position.x + this.cellSize.x * 0.5,
          this.position.y + this.cellSize.y * 0.5,
          3, 0, 2 * Math.PI, false);
        ctx.stroke();
        ctx.fill();
        ctx.restore();
        break;

      case CellState.Deducted:
        ctx.save();
        ctx.fillStyle = '#ddd';
        ctx.beginPath();
        ctx.arc(
          this.position.x + this.cellSize.x * 0.5,
          this.position.y + this.cellSize.y * 0.5,
          3, 0, 2 * Math.PI, false);
        ctx.stroke();
        ctx.fill();
        ctx.restore();
        break;

      case CellState.Ship:
        ctx.save();
        ctx.fillStyle = this.playerType === PlayerType.Player ? 'aqua' : 'yellow';
        ctx.fillRect(
          this.position.x,
          this.position.y,
          this.cellSize.x, this.cellSize.y
        );
        ctx.restore();
        break;

      case CellState.ShipBombed:
        ctx.save();
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(
          this.position.x + this.cellSize.x * 0.2,
          this.position.y + this.cellSize.y * 0.2
        );
        ctx.lineTo(
          this.position.x + this.cellSize.x * 0.8,
          this.position.y + this.cellSize.y * 0.8
        );
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(
          this.position.x + this.cellSize.x * 0.2,
          this.position.y + this.cellSize.y * 0.8
        );
        ctx.lineTo(
          this.position.x + this.cellSize.x * 0.8,
          this.position.y + this.cellSize.y * 0.2
        );
        ctx.stroke();
        ctx.restore();
        break;

      case CellState.ShipDestroyed:
        ctx.save();
        ctx.fillStyle = 'aqua';
        ctx.fillRect(
          this.position.x,
          this.position.y,
          this.cellSize.x, this.cellSize.y
        );
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(
          this.position.x + this.cellSize.x * 0.2,
          this.position.y + this.cellSize.y * 0.2
        );
        ctx.lineTo(
          this.position.x + this.cellSize.x * 0.8,
          this.position.y + this.cellSize.y * 0.8
        );
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(
          this.position.x + this.cellSize.x * 0.2,
          this.position.y + this.cellSize.y * 0.8
        );
        ctx.lineTo(
          this.position.x + this.cellSize.x * 0.8,
          this.position.y + this.cellSize.y * 0.2
        );
        ctx.stroke();
        ctx.restore();
        break;

      case CellState.Hollow:
        ctx.save();
        ctx.fillStyle = '#ddd';
        ctx.fillRect(
          this.position.x,
          this.position.y,
          this.cellSize.x, this.cellSize.y
        );
        ctx.restore();
        break;

      default:
        break;
    }

  }

}