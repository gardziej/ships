import { Observable, Subject } from "rxjs";
import { concatMap, tap, takeUntil, filter, switchMap } from "rxjs/operators";
import Direction from "../enum/direction";
import { ShipType } from "../interfaces/shipType";
import { randomInt } from "../utils/random";
import { mapMouseEventToPosition } from "../utils/rxjsHelpers";
import Board from "./board";
import BoardData from "./boardData";
import Canvas from "./canvas";
import Mouse from "./mouse";
import Ship from "./ship";
import Vector2 from "./vector2";

export default class Ships {
  private destroy$: Subject<boolean> = new Subject();
  public ships: Ship[] = [];
  private boardData: BoardData;
  public draggedShip: Ship;

  constructor(private board: Board) {
    this.boardData = board.boardData;
  }

  public getUndestroyedShipsNumber(): number {
    return this.ships.filter((ship: Ship) => !ship.isDestroyed).length;
  }

  public isMouseOver(mousePosition: Vector2): boolean {
    return this.ships.some((ship: Ship) => ship.isMouseOver(mousePosition));
  }

  public handleMouseInput(mouse: Mouse, canvas: Canvas): void {
    const leftClick$: Observable<MouseEvent> = mouse.leftClick$.pipe(
      takeUntil(this.destroy$),
      filter(() => Boolean(this.board.editable))
    );

    leftClick$.pipe(
      mapMouseEventToPosition(),
      filter((mousePosition: Vector2) => this.isMouseOver(mousePosition)),
      tap((mousePosition: Vector2) => {
        const draggedShipIndex: number = this.ships.findIndex((ship: Ship) => ship.isMouseOver(mousePosition));
        if (draggedShipIndex !== -1) {
          this.draggedShip = this.ships[draggedShipIndex];
        }
        this.ships.splice(draggedShipIndex, 1);
        this.ships.push(this.draggedShip);
        this.draggedShip.startDragging(mousePosition);
        canvas.setMoveCursor();
      }),
      concatMap(() => mouse.move$.pipe(
        mapMouseEventToPosition(),
        takeUntil(mouse.leftUp$.pipe(
          mapMouseEventToPosition(),
          tap(() => {
            this.draggedShip.stopDragging();
            this.draggedShip = null;
          })
        ))
      )
      )
    ).subscribe((mousePosition: Vector2) => {
      this.draggedShip.updatePosition(mousePosition);
    });

    leftClick$.pipe(
      switchMap(() => mouse.rightClick$.pipe(
        mapMouseEventToPosition(),
        filter(() => Boolean(this.draggedShip)),
        takeUntil(mouse.leftUp$)
      ))
    ).subscribe((mousePosition: Vector2) => {
      this.draggedShip.changeDraggedDirection();
      this.draggedShip.updateAfterRotationPosition(mousePosition);
    });
  }

  public update(): void {
    this.ships.forEach((ship: Ship) => ship.update());
    this.ships.sort((shipA: Ship, shipB: Ship) => shipA.size - shipB.size);
  }

  public render(ctx: CanvasRenderingContext2D): void {
    this.ships.forEach((ship: Ship) => ship.render(ctx));
  }

  public addRandomShips() {
    const shipsToSet: ShipType[] = Ships.getDefaultShipsCollection();
    while (shipsToSet.length) {
      const shipType: ShipType = shipsToSet.pop();
      while (!this.addRandomShip(shipType));
    }
  }

  private addRandomShip(shipType: ShipType): boolean {
    const possShips = this.getAllPossibleToAddShips(shipType);
    if (possShips.length === 0) {
      return false;
    }
    const randomShip: Ship = possShips[randomInt(0, possShips.length - 1)];
    return this.addShip(randomShip);
  }

  public addShip(ship: Ship): boolean {
    if (!this.canAddShip(ship)) {
      return false;
    }
    this.ships.push(ship);
    this.updateBoardData();
    return true;
  }

  public updateBoardData() {
    this.boardData.updateAfterAddShip(this.ships);
  }

  private getAllPossibleToAddShips(shipType: ShipType): Ship[] {
    return [
      ...this.getAllPossibleToAddDirectionShips(shipType, Direction.Horizontal),
      ...this.getAllPossibleToAddDirectionShips(shipType, Direction.Vertical)
    ];
  }

  private getAllPossibleToAddDirectionShips(shipType: ShipType, direction: Direction): Ship[] {
    const possibleShips: Ship[] = [];
    if (direction === Direction.Horizontal) {
      for (let i = 0; i < this.boardData.dim.x - shipType.size; i++) {
        for (let j = 0; j < this.boardData.dim.y; j++) {
          const possibleShip: Ship = new Ship(this.board, new Vector2(i, j), shipType.size, direction);
          if (this.canAddShip(possibleShip)) {
            possibleShips.push(possibleShip);
          }
        }
      }
    }
    if (direction === Direction.Vertical) {
      for (let i = 0; i < this.boardData.dim.x; i++) {
        for (let j = 0; j < this.boardData.dim.y - shipType.size; j++) {
          const possibleShip: Ship = new Ship(this.board, new Vector2(i, j), shipType.size, direction);
          if (this.canAddShip(possibleShip)) {
            possibleShips.push(possibleShip);
          }
        }
      }
    }
    return possibleShips;
  }

  public canAddShip(ship: Ship): boolean {

    if (ship.startCoords.x < 0 || ship.startCoords.y < 0 ||
      ship.startCoords.x > (ship.direction === Direction.Horizontal ? this.board.boardData.dim.x - ship.size : this.board.boardData.dim.x - 1) ||
      ship.startCoords.y > (ship.direction === Direction.Horizontal ? this.board.boardData.dim.y - 1 : this.board.boardData.dim.y - ship.size)
    ) {
      return false;
    }

    let coords: Vector2;
    for (let i = 0; i < ship.size; i++) {
      coords = ship.direction === Direction.Horizontal ? new Vector2(ship.startCoords.x + i, ship.startCoords.y) : new Vector2(ship.startCoords.x, ship.startCoords.y + i);
      if (!this.boardData.isCellAndSurroundingsSave(coords)) {
        return false;
      }
    }
    return true;
  }

  static getDefaultShipsCollection(): ShipType[] {
    return [
      { size: 1 }, { size: 1 }, { size: 1 }, { size: 1 },
      { size: 2 }, { size: 2 }, { size: 2 },
      { size: 3 }, { size: 3 },
      { size: 4 }
    ];
  }

  public destroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}