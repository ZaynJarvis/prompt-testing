import React from 'react';
import { Settings } from 'lucide-react';
import { useModelConfig } from '../contexts/ModelConfigContext';

interface HeaderProps {
  onConfigClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onConfigClick }) => {
  const { selectedModel } = useModelConfig();

  return (
    <header className="h-12 bg-[#333333] flex items-center px-4 border-b border-[#252525]">
      <div className="flex-1 flex items-center">
        <h1 className="text-xl font-semibold mr-4">Prompt Tester</h1>
        {selectedModel && (
          <span className="bg-[#007acc] px-2 py-0.5 rounded text-sm">
            {selectedModel.modelName}
          </span>
        )}
      </div>
      <button 
        onClick={onConfigClick}
        className="p-2 rounded-md hover:bg-[#3c3c3c] transition-colors"
        title="Settings"
      >
        <Settings size={20} />
      </button>
    </header>
  );
};

export default Header;