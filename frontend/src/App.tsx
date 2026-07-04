import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';

function App() {
  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden">
      <Toolbar />
      <Canvas />
    </div>
  );
}

export default App;
