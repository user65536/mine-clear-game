import React from 'react';
import ReactDOM from 'react-dom';
import { Playground } from './app/Playground';

ReactDOM.render(
  <React.StrictMode>
    <Playground size={[20, 30]} mineCount={10} cellSize={30} />
  </React.StrictMode>,
  document.getElementById('root')
);
