import React from 'react';
import { Settings, Download } from 'lucide-react';
import { useModelConfig } from '../contexts/ModelConfigContext';
import JSZip from 'jszip';

interface HeaderProps {
  onConfigClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onConfigClick }) => {
  const { selectedModel } = useModelConfig();

  const handleExport = async () => {
    const zip = new JSZip();
    
    // Get all files from localStorage
    const promptFiles = localStorage.getItem('promptFiles');
    if (promptFiles) {
      const files = JSON.parse(promptFiles);
      files.forEach((file: { name: string; content: string }) => {
        zip.file(file.name, file.content);
      });
    }

    try {
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'prompt-files.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export files:', error);
    }
  };

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
      <div className="flex items-center gap-2">
        <button 
          onClick={handleExport}
          className="p-2 rounded-md hover:bg-[#3c3c3c] transition-colors"
          title="Export files"
        >
          <Download size={20} />
        </button>
        <button 
          onClick={onConfigClick}
          className="p-2 rounded-md hover:bg-[#3c3c3c] transition-colors"
          title="Settings"
        >
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;