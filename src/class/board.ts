import PlayerType from "../enum/playerType";
import Clickable from "../interfaces/clickable.interface";
import Drawable from "../interfaces/drawable.interface";
import { mapMouseEventToPosition } from "../utils/rxjsHelpers";
import BoardCell from "./boardCell";
import BoardData from "./boardData";
import Canvas from "./canvas";
import Mouse from "./mouse";
import Rectangle from "./rectangle";
import Ships from "./ships";
import Vector2 from "./vector2";

export default class Board implements Drawable, Clickable {
  public clickable: boolean = false;
  public background: Rectangle;
  public cellSize: Vector2;
  public boardData: BoardData = new BoardData(this, new Vector2(10, 10));
  private mouseOverCell: Vector2;
  public ships: Ships;
  public editable: boolean = true;

  constructor(
    public position: Vector2,
    public width: number,
    public height: number,
    public playerType: PlayerType,
    public title: string = ''
  ) {
    this.background = new Rectangle(this.position, this.width, this.height);
    this.background.rounds = [10, 10, 10, 10];
    this.cellSize = new Vector2(this.width / 12, this.height / 12);
    this.boardData.createBoardCell();
    this.ships = new Ships(this);
  }

  public isMouseOver(mousePosition: Vector2): boolean {
    return this.playerType === PlayerType.Player 
      ? this.editable && this.ships.isMouseOver(mousePosition)
      : this.boardData.cellsFlatArray.some((cell: BoardCell) => cell.isMouseOver(mousePosition));
  }

  public handleMouseInput(mouse: Mouse, canvas: Canvas): void {
    this.playerType === PlayerType.Player
      ? this.ships.handleMouseInput(mouse, canvas) 
      : this.boardData.handleMouseInput(mouse);

    mouse.move$.pipe(
      mapMouseEventToPosition(),
    ).subscribe((mousePosition: Vector2) => {
      if (mousePosition.x > this.position.x + this.cellSize.x &&
        mousePosition.y > this.position.y + this.cellSize.y &&
        mousePosition.x < this.position.x + this.width - this.cellSize.x &&
        mousePosition.y < this.position.y + this.height) {
        this.mouseOverCell = new Vector2(
          Math.floor((mousePosition.x - this.position.x - this.cellSize.x) / this.cellSize.x),
          Math.floor((mousePosition.y - this.position.y - this.cellSize.y) / this.cellSize.y)
        );
      }
      else {
        this.mouseOverCell = null;
      }
    });
  }

  public addRandomShips() {
    this.ships.addRandomShips();
  }

  public update(): void {
    this.ships.update();
  }

  public render(ctx: CanvasRenderingContext2D): void {
    this.background.render(ctx);
    this.renderCells(ctx);
    this.renderGrid(ctx);
    this.renderTitle(ctx);
    if (this.editable && this.playerType === PlayerType.Player) {
      this.ships.render(ctx);
    }
  }

  public renderTitle(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.font = Math.floor(this.cellSize.x * 2 / 5) + "px Arial";
    ctx.fillStyle = 'white';
    ctx.fillText(this.title, this.position.x + this.cellSize.x / 5, this.position.y - this.cellSize.y * 0.15);
    ctx.restore();
  }

  public renderGrid(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.font = Math.floor(this.cellSize.x * 3 / 5) + "px Arial";
    ctx.textAlign = "center";
    for (let y = this.cellSize.y, i = 1; y < this.height; y += this.cellSize.y, i++) {
      ctx.fillStyle = this.mouseOverCell?.y !== i - 1 ? "#ccc" : 'black';
      ctx.beginPath();
      ctx.moveTo(this.position.x, this.position.y + y);
      ctx.lineTo(this.position.x + this.width, this.position.y + y);
      ctx.stroke();
      if (i <= 10) {
        ctx.fillText(i.toString(), this.position.x + this.cellSize.x / 2, this.position.y + this.cellSize.y * 0.75 + y);
        ctx.fillText(i.toString(), this.position.x + this.width - this.cellSize.x / 2, this.position.y + this.cellSize.y * 0.75 + y);
      }
    }

    for (let x = this.cellSize.x, i = 1; x < this.width; x += this.cellSize.x, i++) {
      ctx.fillStyle = this.mouseOverCell?.x !== i - 1 ? "#ccc" : 'black';
      ctx.beginPath();
      ctx.moveTo(this.position.x + x, this.position.y);
      ctx.lineTo(this.position.x + x, this.position.y + this.height);
      ctx.stroke();
      if (i <= 10) {
        ctx.fillText(String.fromCharCode(64 + i), this.position.x + x + this.cellSize.x / 2, this.position.y + this.cellSize.y * 0.75);
        ctx.fillText(String.fromCharCode(64 + i), this.position.x + x + this.cellSize.x / 2, this.position.y + this.height - this.cellSize.y * 0.25);
      }
    }
    ctx.restore();
  }

  public renderCells(ctx: CanvasRenderingContext2D): void {
    this.boardData.cellsFlatArray.forEach((cell: BoardCell) => cell.render(ctx));
  }

  public logData() {
    for (let i = 0; i < this.boardData.dim.x; i++) {
      let row: string = '';
      for (let j = 0; j < this.boardData.dim.y; j++) {
        row += this.boardData.getCellAtCords(new Vector2(j, i)).stateSign + ' ';
      }
      console.log(row);
    }
  }

}