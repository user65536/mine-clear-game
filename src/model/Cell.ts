import { makeAutoObservable } from 'mobx';
import { CellCoordinate } from './CellCoordinate';
import { CellStatus } from './CellStatus';

export interface CellOptions {
  coordinate: CellCoordinate;
}

export class Cell {
  status: CellStatus = CellStatus.initial;

  mine: boolean = false;

  coordinate: CellCoordinate;

  aroundMineCount = 0;

  get x() {
    return this.coordinate[0];
  }

  get y() {
    return this.coordinate[1];
  }

  get openable() {
    return this.status === CellStatus.initial;
  }

  constructor(options: CellOptions) {
    this.coordinate = options.coordinate;
    makeAutoObservable(this);
  }

  setStatus(status: CellStatus) {
    this.status = status;
  }

  addAroundMineCount() {
    this.aroundMineCount += 1;
  }

  layMine() {
    this.mine = true;
  }
}
