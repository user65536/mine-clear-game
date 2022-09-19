import { Cell } from './Cell';
import { CellCoordinate } from './CellCoordinate';
import { CellStatus } from './CellStatus';
import EventEmitter from 'eventemitter2';
import { makeAutoObservable } from 'mobx';

export interface GameOptions {
  size: [number, number];
  mineCount: number;
}

export class Game {
  ground: Cell[][] = [];

  private openedCount = 0;

  private markedCount = 0;

  ended = false;

  event = new EventEmitter();

  get cells() {
    return this.ground.flat(1);
  }

  get width() {
    return this.options.size[0];
  }

  get height() {
    return this.options.size[1];
  }

  get length() {
    return this.height * this.width;
  }

  constructor(private options: GameOptions) {
    makeAutoObservable(this);
    if (options.mineCount >= this.length) throw new Error('invalid mine count');
    this.initCells();
  }

  reset() {
    this.openedCount = 0;
    this.markedCount = 0;
    this.ended = false;
    this.initCells();
  }

  private coordinate2Number(coordinate: CellCoordinate) {
    return coordinate[0] + coordinate[1] * this.width;
  }

  private number2Coordinate(number: number): CellCoordinate {
    const x = number % this.width;
    const y = Math.floor(number / this.width);
    return [x, y];
  }

  private getCell(coordinate: CellCoordinate): Cell | undefined {
    return this.ground[coordinate[1]]?.[coordinate[0]];
  }

  private initCells() {
    this.ground = new Array(this.height).fill([]);
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.ground[y][x] = new Cell({ coordinate: [x, y] });
      }
    }
  }

  private createRandomCoordinate(excludes: CellCoordinate[]) {
    const length = this.length - 1;
    const randoms: number[] = [];
    while (randoms.length < this.options.mineCount) {
      const random = Math.floor(Math.random() * length);
      if (excludes.some((i) => this.coordinate2Number(i) === random)) continue;
      if (randoms.includes(random)) continue;
      randoms.push(random);
    }
    return randoms.map((i) => this.number2Coordinate(i));
  }

  private calculateCellMineCount(mines: CellCoordinate[]) {
    mines.forEach((coordinate) => {
      const cellsAround = this.getAroundCells(coordinate);
      cellsAround.forEach((cell) => cell.addAroundMineCount());
    });
  }

  private scatterMines(excludes: CellCoordinate[]) {
    const mines = this.createRandomCoordinate(excludes);
    mines.forEach((i) => {
      const cell = this.getCell(i);
      cell?.layMine();
    });
    this.calculateCellMineCount(mines);
  }

  private getAroundCells(coordinate: CellCoordinate) {
    const cells: Cell[] = [];
    for (let xOffset = -1; xOffset <= 1; xOffset++) {
      for (let yOffset = -1; yOffset <= 1; yOffset++) {
        const x = coordinate[0] + xOffset;
        const y = coordinate[1] + yOffset;
        const cell = this.getCell([x, y]);
        if (cell) cells.push(cell);
      }
    }
    return cells;
  }

  private openCellsRecursively(coordinate: CellCoordinate) {
    const cell = this.getCell(coordinate);
    if (!cell) return;
    if (this.openedCount === 0) this.scatterMines([coordinate]);
    if (!cell.openable) return;
    cell.setStatus(CellStatus.opened);
    if (cell.mine) return this.end();
    this.openedCount += 1;
    if (cell.aroundMineCount === 0) {
      const aroundCells = this.getAroundCells(coordinate);
      aroundCells.forEach((i) => this.openCellsRecursively(i.coordinate));
    }
  }

  openCell(coordinate: CellCoordinate) {
    this.openCellsRecursively(coordinate);
    this.judge();
  }

  toggleMark(coordinate: CellCoordinate) {
    const cell = this.getCell(coordinate);
    if (!cell) return;
    if (cell.status === CellStatus.marked) this.removeMark(cell);
    else this.mark(cell);
    this.judge();
  }

  private mark(cell: Cell) {
    if (!cell.openable) return;
    cell?.setStatus(CellStatus.marked);
    this.markedCount += 1;
  }

  private removeMark(cell: Cell) {
    if (cell.status !== CellStatus.marked) return;
    cell.setStatus(CellStatus.initial);
    this.markedCount -= 1;
  }

  private end() {
    this.ended = true;
    this.event.emit('end');
  }

  private isWon() {
    return this.markedCount === this.options.mineCount && this.markedCount + this.openedCount === this.length;
  }

  private judge() {
    if (!this.isWon()) return;
    this.event.emit('win');
  }
}
