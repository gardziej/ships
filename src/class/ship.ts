import CellState from "../enum/cellState";
import Direction from "../enum/direction";
import Drawable from "../interfaces/drawable.interface";
import Board from "./board";
import BoardCell from "./boardCell";
import Rectangle from "./rectangle";
import Vector2 from "./vector2";

export default class Ship implements Drawable {

  private background: Rectangle;
  private draggedPossibleRectangle: Rectangle;
  private dragged: boolean = false;
  private draggedCoors: Vector2;
  private draggedDirection: Direction;
  private mouseOffset: Vector2 = Vector2.zero;
  public position: Vector2;

  constructor(
    private board: Board,
    public startCoords: Vector2,
    public size: number,
    public direction: Direction
  ) {
    this.position = new Vector2(
      this.board.position.x + this.board.cellSize.x + this.board.cellSize.x * this.startCoords.x,
      this.board.position.y + this.board.cellSize.y + this.board.cellSize.y * this.startCoords.y,
    );
    this.background = new Rectangle(this.position, this.width, this.height);
    this.draggedPossibleRectangle = new Rectangle(this.position, this.width, this.height);
    this.draggedPossibleRectangle.color = 'green';
    this.draggedCoors = this.startCoords.copy();
    this.draggedDirection = this.direction;
  }

  public startDragging(mousePosition: Vector2): void {
    this.dragged = true;
    this.mouseOffset = new Vector2(
      mousePosition.x - this.position.x,
      mousePosition.y - this.position.y
    );
    this.board.boardData.getCellsCoordsForShip(this).forEach((cell: BoardCell) => cell.state = CellState.Hollow);
  }

  public stopDragging(): void {
    this.dragged = false;
    const cells: BoardCell[] = this.board.boardData.getCellsCoordsForShip(this);
    if (this.board.ships.canAddShip(
      new Ship(this.board, this.draggedCoors, this.size, this.draggedDirection)
    )) {
      cells.forEach((cell: BoardCell) => cell.state = CellState.Empty);
      this.startCoords = this.draggedCoors.copy();
      this.position = new Vector2(
        this.board.position.x + this.board.cellSize.x + this.board.cellSize.x * this.startCoords.x,
        this.board.position.y + this.board.cellSize.y + this.board.cellSize.y * this.startCoords.y,
      );
      this.direction = this.draggedDirection;
      this.updateBackground(this.position);
      this.board.ships.updateBoardData();
    }
    else {
      this.position = new Vector2(
        this.board.position.x + this.board.cellSize.x + this.board.cellSize.x * this.startCoords.x,
        this.board.position.y + this.board.cellSize.y + this.board.cellSize.y * this.startCoords.y,
      );
      cells.forEach((cell: BoardCell) => cell.state = CellState.Ship);
      this.draggedPossibleRectangle = new Rectangle(this.position, this.width, this.height);
      this.draggedCoors = this.startCoords.copy();
      this.draggedDirection = this.direction;
      this.updateBackground(this.position);
    }
  }

  public updatePosition(mousePosition: Vector2) {
    const newPosition = new Vector2(
      mousePosition.x - this.mouseOffset.x,
      mousePosition.y - this.mouseOffset.y
    );
    this.position = newPosition;
    this.updateBackground(newPosition);
    this.updateDraggedPossibleRectangle();
  }

  public updateAfterRotationPosition(mousePosition: Vector2) {
    const newPosition = new Vector2(
      mousePosition.x - this.mouseOffset.y,
      mousePosition.y - this.mouseOffset.x
    );
    [this.mouseOffset.x, this.mouseOffset.y] = [this.mouseOffset.y, this.mouseOffset.x];
    this.position = newPosition;
    this.updateBackground(newPosition);
    this.updateDraggedPossibleRectangle();
  }

  private updateBackground(newPosition: Vector2): void {
    this.background.position = newPosition;
    this.background.width = this.draggedDirection === Direction.Vertical ? this.board.cellSize.x : this.size * this.board.cellSize.x;
    this.background.height = this.draggedDirection === Direction.Vertical ? this.size * this.board.cellSize.y : this.board.cellSize.y;
  }

  private updateDraggedPossibleRectangle(): void {
    this.draggedCoors = new Vector2(
      Math.floor((this.position.x + this.board.cellSize.x / 2 - this.board.position.x - this.board.cellSize.x) / this.board.cellSize.x),
      Math.floor((this.position.y + this.board.cellSize.y / 2 - this.board.position.y - this.board.cellSize.y) / this.board.cellSize.y)
    );
    this.draggedPossibleRectangle.position = new Vector2(
      this.board.position.x + this.board.cellSize.x + this.board.cellSize.x * this.draggedCoors.x,
      this.board.position.y + this.board.cellSize.y + this.board.cellSize.y * this.draggedCoors.y,
    );
    this.draggedPossibleRectangle.width = this.draggedDirection === Direction.Vertical ? this.board.cellSize.x : this.size * this.board.cellSize.x;
    this.draggedPossibleRectangle.height = this.draggedDirection === Direction.Vertical ? this.size * this.board.cellSize.y : this.board.cellSize.y;
    this.draggedPossibleRectangle.color = this.board.ships.canAddShip(
      new Ship(this.board, this.draggedCoors, this.size, this.draggedDirection)
    ) ? 'rgb(10, 242, 10, 0.5)' : 'rgb(242, 10, 10, 0.5)';
  }

  get isDestroyed(): boolean {
    const cells: BoardCell[] = this.board.boardData.getCellsCoordsForShip(this);
    return cells.every((cell: BoardCell) => [CellState.ShipBombed, CellState.ShipDestroyed].includes(cell.state));
  }

  get width(): number {
    return this.direction === Direction.Vertical ? this.board.cellSize.x : this.size * this.board.cellSize.x;
  }

  get height(): number {
    return this.direction === Direction.Vertical ? this.size * this.board.cellSize.y : this.board.cellSize.y;
  }

  public markAsDestroyed(): void {
    const cells: BoardCell[] = this.board.boardData.getCellsCoordsForShip(this);
    cells.forEach((cell: BoardCell) => cell.state = CellState.ShipDestroyed);
  }

  public isMouseOver(mousePosition: Vector2): boolean {
    return Rectangle.containsPoint(this, mousePosition) && !this.dragged;
  }

  public changeDraggedDirection() {
    if (this.draggedDirection === Direction.Horizontal) {
      this.draggedDirection = Direction.Vertical;
    } else {
      this.draggedDirection = Direction.Horizontal;
    }
  }

  public update(): void {
    this.background.color = this.dragged ? 'rgba(0, 255, 255, 0.5)' : 'aqua';
  }

  public render(ctx: CanvasRenderingContext2D): void {
    this.background.render(ctx);
    if (!this.dragged) return;
    if (
      this.draggedCoors.x >= 0 &&
      this.draggedCoors.y >= 0 &&
      this.draggedCoors.x <= (this.draggedDirection === Direction.Horizontal ? this.board.boardData.dim.x - this.size : this.board.boardData.dim.x - 1) &&
      this.draggedCoors.y <= (this.draggedDirection === Direction.Horizontal ? this.board.boardData.dim.y - 1 : this.board.boardData.dim.y - this.size)
    ) {
      this.draggedPossibleRectangle.render(ctx);
    }
  }

}


