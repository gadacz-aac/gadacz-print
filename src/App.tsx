import { Layer, Stage } from 'react-konva'
import './App.css'
import SymbolCard from './components/SymbolCard';
import Konva from 'konva';
import { useState } from 'react';

export type CommunicationSymbol = {
  id: string;
  x: number;
  y: number;
}

const App = () => {
  const [symbols, setSymbols] = useState<CommunicationSymbol[]>([]);

  function handleAddSymbol(evt: Konva.KonvaEventObject<MouseEvent>): void {
    setSymbols(prevSymbols => {
      console.log(prevSymbols)
      const lastId = prevSymbols[prevSymbols.length - 1]?.id ?? -1;
      const id = `symbol_${lastId + 1}`

      return [...prevSymbols, { id, x: evt.evt.clientX, y: evt.evt.clientY, }]
    });
  }

  function handleDragEnd(evt: Konva.KonvaEventObject<DragEvent>) {
    const id = evt.target.id();
    setSymbols(
      symbols.map((symbol) => {
        if (symbol.id === id) {
          return {
            ...symbol,
            x: evt.target.x(),
            y: evt.target.y(),
          };
        }
        return symbol;
      })
    );
  }

  return (
    <Stage width={window.innerWidth} height={window.innerHeight} onClick={handleAddSymbol}>
      <Layer>
        {symbols.map(e => (
          <SymbolCard key={e.id} symbol={e} onDragEnd={handleDragEnd} />
        ))}
      </Layer>
    </Stage>
  )
};

export default App;

