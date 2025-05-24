import React, { useState } from 'react';
import EditorLayout from './components/EditorLayout';
import Header from './components/Header';
import ConfigPanel from './components/ConfigPanel';
import { ModelConfigProvider } from './contexts/ModelConfigContext';

function App() {
  const [showConfig, setShowConfig] = useState(false);

  return (
    <ModelConfigProvider>
      <div className="flex flex-col h-screen bg-[#1e1e1e] text-white overflow-hidden">
        <Header onConfigClick={() => setShowConfig(!showConfig)} />
        <div className="flex-1 flex relative overflow-hidden">
          <EditorLayout />
          {showConfig && (
            <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center">
              <ConfigPanel onClose={() => setShowConfig(false)} />
            </div>
          )}
        </div>
      </div>
    </ModelConfigProvider>
  );
}

export default App;