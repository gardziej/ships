import { randomInt } from "../utils/random";
import Ships from "./ships";
import Vector2 from "./vector2";

class BestMoveFinder {

  private dataForFinder: string[][];

  get width(): number {
    return this.dataForFinder[0].length;
  }

  get height(): number {
    return this.dataForFinder.length;
  }

  trigger() {
    return this.findBestMove([
      ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
    ]);
  }

  findBestMove(dataForFinder: string[][]): Vector2 {
    this.dataForFinder = dataForFinder;
    const partlyDestroyedCoordsList: Vector2[] = this.findPartlyDestroyedCoordsList();
    let possibleBestMoves: Vector2[] = [];
    if (partlyDestroyedCoordsList.length) {
      possibleBestMoves = partlyDestroyedCoordsList.reduce((prev, curr) => {
        prev.push(...this.getPossibleMovesNearCoords(curr));
        return prev;
      }, []);
      return this.getRandomElementFromArray(possibleBestMoves);
    }
    else {
      const size: number = this.findMaxMissingSize();
      const matrix: number[][] = this.createMatrix(size);
      const bestMoveValue: number = matrix.flat().sort((a,b ) => b - a)[0];
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x <= this.width; x++) {
          if (matrix[y][x] === bestMoveValue) {
            possibleBestMoves.push(new Vector2(x, y));
          }
        }
      }
    }
    return this.getRandomElementFromArray(possibleBestMoves);
  }

  findMaxMissingSize() {
    const defSizes = Ships.getDefaultShipsCollection().map(s => s.size);
    this.findShips().map(s => s.size).forEach(size => {
      const i = defSizes.findIndex(ds => ds === size);
      if (i !== -1) defSizes.splice(i, 1);
    });
    return defSizes.length && defSizes.sort().reverse()[0];
  }

  createMatrix(size: number): number[][] {
    const matrix: number[][] = Array.from(Array(10), () => new Array(10).fill(0));
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x <= this.width - size; x++) {
        let canBePlaced: boolean = true;
        for (let t = x; t < size + x; t++) {
          if (this.getValueAtCords(new Vector2(t, y)) !== '_') {
            canBePlaced = false;
          }
        }
        if (canBePlaced) {
          for (let t = x; t < size + x; t++) {
            matrix[y][t] += 1;
          }
        }
      }
    }

    for (let x = 0; x <= this.width; x++) {
      for (let y = 0; y < this.height - size; y++) {
        let canBePlaced: boolean = true;
        for (let t = y; t < size + y; t++) {
          if (this.getValueAtCords(new Vector2(x, t)) !== '_') {
            canBePlaced = false;
          }
        }
        if (canBePlaced) {
          for (let t = y; t < size + y; t++) {
            matrix[t][x] += 1;
          }
        }
      }
    }

    return matrix;
  }

  getPossibleMovesNearCoords(cellCoords: Vector2): Vector2[] {
    return [
      new Vector2(cellCoords.x - 1, cellCoords.y),
      new Vector2(cellCoords.x, cellCoords.y - 1),
      new Vector2(cellCoords.x + 1, cellCoords.y),
      new Vector2(cellCoords.x, cellCoords.y + 1)
    ].filter((coords: Vector2) => this.getValueAtCords(coords) === '_');
  }

  findPartlyDestroyedCoordsList(): Vector2[] {
    const partlyDestroyedCoords: Vector2[] = [];
    this.dataForFinder.flat().forEach((element: string, index: number) => {
      if (element === 'X') {
        partlyDestroyedCoords.push(
          new Vector2(
            Math.floor(index % this.width),
            Math.floor(index / this.height)
          )
        );
      }
    });
    return partlyDestroyedCoords;
  }

  findEmptyCoordsList(): Vector2[] {
    const partlyDestroyedCoords: Vector2[] = [];
    this.dataForFinder.flat().forEach((element: string, index: number) => {
      if (element === '_') {
        partlyDestroyedCoords.push(
          new Vector2(
            Math.floor(index % this.width),
            Math.floor(index / this.height)
          )
        );
      }
    });
    return partlyDestroyedCoords;
  }

  private getValueAtCords(coords: Vector2): string {
    if (coords.x < 0 || coords.y < 0 || coords.x >= this.width || coords.y >= this.height) {
      return null;
    }
    return this.dataForFinder[coords.y][coords.x];
  }

  private getRandomElementFromArray<T>(arr: T[]): T {
    if (!arr || arr.length === 0) return null;
    return arr[randomInt(0, arr.length - 1)];
  }


  private findShips() {
    const finds = [];
    //Horizontal
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.getValueAtCords(new Vector2(x, y)) === 'D') {
          const start = x;
          let end = start;
          while (this.getValueAtCords(new Vector2(++x, y)) === 'D') {
            end = x;
          }
          if (start !== end) {
            finds.push({
              coords: new Vector2(start, y),
              size: end - start + 1
            });
          }
          else {
            if (this.getValueAtCords(new Vector2(start, y + 1)) !== 'D' &&
              this.getValueAtCords(new Vector2(start, y - 1)) !== 'D') {
              finds.push({
                coords: new Vector2(start, y),
                size: 1
              });
            }
          }
        }
      }
    }
    //Vertical
    for (let x = 0; x < this.height; x++) {
      for (let y = 0; y < this.width; y++) {
        if (this.getValueAtCords(new Vector2(x, y)) === 'D') {
          const start = y;
          let end = start;
          while (this.getValueAtCords(new Vector2(x, ++y)) === 'D') {
            end = y;
          }
          if (start !== end) {
            finds.push({
              coords: new Vector2(x, start),
              size: end - start + 1
            });
          }
        }
      }
    }
    return finds;
  }

}

const bestMoveFinder: BestMoveFinder = new BestMoveFinder();
export default bestMoveFinder;