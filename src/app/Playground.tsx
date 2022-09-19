import { observer } from 'mobx-react';
import { FC, useEffect, useMemo } from 'react';
import { CellStatus, Game, GameOptions } from '../model';
import styled from 'styled-components';
import mineImg from './img/mine.png';
import flagImg from './img/flag.png';
import classNames from 'classnames';

export interface PlaygroundOptions extends GameOptions {
  cellSize: number;
}

export const Playground: FC<PlaygroundOptions> = observer((props) => {
  const game = useMemo(() => new Game(props), []);
  (window as any).game = game;
  const { cellSize } = props;

  useEffect(() => {
    const win = () => {
      window.alert('win');
    };
    const reset = () => {
      if (game.ended) game.reset();
    };
    const end = () => {};
    game.event.on('win', win);
    game.event.on('end', end);
    window.addEventListener('keydown', reset);
    return () => {
      game.event.off('win', win);
      game.event.off('end', end);
      window.removeEventListener('keydown', reset);
    };
  }, []);

  return (
    <GroundWrapper style={{ width: game.width * cellSize, height: game.height * cellSize }}>
      {game.cells.map((cell) => {
        const opened = cell.status === CellStatus.opened && !cell.mine;
        const diedCell = cell.status === CellStatus.opened && cell.mine;
        const showMine = game.ended && cell.mine;
        const marked = cell.status === CellStatus.marked;
        let src: string = '';
        if (marked) src = flagImg;
        if (diedCell || showMine) src = mineImg;
        return (
          <Cell
            key={`${cell.x}-${cell.y}`}
            className={classNames({ died: diedCell, opened })}
            style={{ width: cellSize, height: cellSize, left: cell.x * cellSize, top: cell.y * cellSize }}
            onClick={() => game.openCell(cell.coordinate)}
            onContextMenu={(e) => {
              e.preventDefault();
              game.toggleMark(cell.coordinate);
            }}
          >
            {src && <img src={src}></img>}
            {opened && cell.aroundMineCount !== 0 && cell.aroundMineCount}
          </Cell>
        );
      })}
      <ShadowImg src={mineImg}></ShadowImg>
      <ShadowImg src={flagImg}></ShadowImg>
    </GroundWrapper>
  );
});

const GroundWrapper = styled.div`
  position: relative;
  margin: 100px auto 0;
  border: 1px solid rgba(0, 0, 0, 0.12);
`;

const Cell = styled.div`
  position: absolute;
  border: 0.5px solid rgb(0 0 0 / 15%);
  background-color: rgb(208, 208, 208);
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;

  &.died {
    background-color: rgb(232, 53, 53);
  }

  &.opened {
    background-color: rgb(231, 231, 231);
  }

  & img {
    width: 100%;
    height: 100%;
  }
`;

const ShadowImg = styled.img`
  width: 0;
  height: 0;
  position: absolute;
`;
