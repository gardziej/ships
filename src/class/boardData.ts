import { filter } from "rxjs/operators";
import CellState from "../enum/cellState";
import Direction from "../enum/direction";
import PlayerType from "../enum/playerType";
import GameState from "../enum/gameState";
import { mapMouseEventToPosition } from "../utils/rxjsHelpers";
import Board from "./board";
import BoardCell from "./boardCell";
import Mouse from "./mouse";
import Ship from "./ship";
import Vector2 from "./vector2";
import gameStateManager from "./gameStateManager";

export default class BoardData {

  public cells: BoardCell[][] = [];

  constructor(
    private board: Board,
    public dim: Vector2
  ) {
    this.cells = Array.from(Array(10), () => new Array(10));
  }

  get cellsFlatArray(): BoardCell[] {
    return this.cells.flat();
  }

  public handleMouseInput(mouse: Mouse): void {
    mouse.leftClick$.pipe(
      filter(() => Boolean(this.board.playerType === PlayerType.Enemy && gameStateManager.getCurrentGameState() === GameState.PlayerMove)),
      mapMouseEventToPosition()
    ).subscribe((mousePosition: Vector2) => {
      const coords: Vector2 = this.getCellCoordsFromMousePosition(mousePosition);
      if (!coords) return;
      if (!this.getCellAtCords(coords).bomb()) {
        gameStateManager.gameStateChanged$.next(GameState.EnemyMove);
      };
    });
  }

  public updateAfterAddShip(ships: Ship[]): void {
    ships.forEach((ship: Ship) => {
      for (let i = 0; i < ship.size; i++) {
        const coords: Vector2 = ship.direction === Direction.Horizontal
          ? new Vector2(ship.startCoords.x + i, ship.startCoords.y)
          : new Vector2(ship.startCoords.x, ship.startCoords.y + i);
        this.getCellAtCords(coords).state = CellState.Ship;
        this.getCellAtCords(coords).ship = ship;
      }
    });
  }

  public getCellCoordsFromMousePosition(mousePosition: Vector2): Vector2 {
    if (mousePosition.x > this.board.position.x + this.board.cellSize.x &&
      mousePosition.y > this.board.position.y + this.board.cellSize.y &&
      mousePosition.x < this.board.position.x + this.board.width - this.board.cellSize.x &&
      mousePosition.y < this.board.position.y + this.board.height) {
      return new Vector2(
        Math.floor((mousePosition.x - this.board.position.x - this.board.cellSize.x) / this.board.cellSize.x),
        Math.floor((mousePosition.y - this.board.position.y - this.board.cellSize.y) / this.board.cellSize.y)
      );
    }
    return null;
  }

  public getCellsCoordsForShip(ship: Ship): BoardCell[] {
    const cells: BoardCell[] = [];
    for (let i = 0; i < ship.size; i++) {
      const coords: Vector2 = ship.direction === Direction.Horizontal
        ? new Vector2(ship.startCoords.x + i, ship.startCoords.y)
        : new Vector2(ship.startCoords.x, ship.startCoords.y + i);
      cells.push(this.getCellAtCords(coords));
    }
    return cells;
  }

  public getDiagonalCells(coords: Vector2): BoardCell[] {
    const cells: BoardCell[] = [
      this.getCellAtCords(new Vector2(coords.x - 1, coords.y - 1)),
      this.getCellAtCords(new Vector2(coords.x - 1, coords.y + 1)),
      this.getCellAtCords(new Vector2(coords.x + 1, coords.y - 1)),
      this.getCellAtCords(new Vector2(coords.x + 1, coords.y + 1))
    ];
    return cells.filter((cell: BoardCell) => Boolean(cell));
  }

  public getSurroundingCells(coords: Vector2): BoardCell[] {
    const cells: BoardCell[] = [];
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
          cells.push(this.getCellAtCords(new Vector2(coords.x + i, coords.y + j)));
        }
      }
    return cells;
  }

  public createBoardCell(): void {
    for (let i = 0; i < this.dim.x; i++) {
      for (let j = 0; j < this.dim.y; j++) {
        const position = new Vector2(
          this.board.position.x + this.board.cellSize.x + j * this.board.cellSize.x,
          this.board.position.y + this.board.cellSize.y + i * this.board.cellSize.y
        );
        const newCell: BoardCell = new BoardCell(this.board, position, this.board.cellSize.x, this.board.cellSize.y, new Vector2(j, i), this.board.playerType);
        this.addCell(newCell);
      }
    }
  }

  private addCell(newCell: BoardCell) {
    this.cells[newCell.boardCoords.y][newCell.boardCoords.x] = newCell;
  }

  private isCellSave(coords: Vector2): boolean {
    if (coords.x < 0 || coords.y < 0 || coords.x >= this.dim.x || coords.y >= this.dim.y) {
      return true;
    }
    else {
      return [CellState.Empty, CellState.Hollow].includes(this.getCellAtCords(coords).state);
    }
  }

  public getCellAtCords(coords: Vector2): BoardCell {
    return coords.x >= 0 && coords.y >= 0 && coords.x < this.dim.x && coords.y < this.dim.y 
    ? this.cells[coords.y][coords.x] 
    : null;
  }

  public isCellAndSurroundingsSave(coords: Vector2): boolean {
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (!this.isCellSave(new Vector2(coords.x + i, coords.y + j))) {
          return false;
        }
      }
    }
    return true;
  }

}