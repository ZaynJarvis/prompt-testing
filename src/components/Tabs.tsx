import React, { useState, useRef } from 'react';
import { Plus, X, Check, X as Cancel } from 'lucide-react';
import { File } from '../types';

interface TabsProps {
  files: File[];
  onSelectFile: (fileId: string) => void;
  onAddFile: () => void;
  onRemoveFile: (fileId: string) => void;
  onRenameFile: (fileId: string, newName: string) => void;
  onReorderFiles: (files: File[]) => void;
}

const Tabs: React.FC<TabsProps> = ({ 
  files, 
  onSelectFile, 
  onAddFile, 
  onRemoveFile,
  onRenameFile,
  onReorderFiles
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const dragOverTabId = useRef<string | null>(null);

  const handleDoubleClick = (file: File) => {
    setEditingId(file.id);
    setEditingName(file.name);
  };

  const handleRename = () => {
    if (editingId && editingName.trim()) {
      onRenameFile(editingId, editingName.trim());
      setEditingId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, fileId: string) => {
    setDraggedId(fileId);
    e.dataTransfer.effectAllowed = 'move';
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setDraggedId(null);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    dragOverTabId.current = null;
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, fileId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    dragOverTabId.current = fileId;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const draggedIndex = files.findIndex(f => f.id === draggedId);
    const targetIndex = files.findIndex(f => f.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;

    const newFiles = [...files];
    const [draggedFile] = newFiles.splice(draggedIndex, 1);
    newFiles.splice(targetIndex, 0, draggedFile);

    onReorderFiles(newFiles);
  };

  return (
    <div className="h-9 bg-[#252526] flex items-center border-b border-[#252525] overflow-x-auto">
      {files.map(file => (
        <div 
          key={file.id} 
          className={`flex items-center h-full px-3 cursor-pointer border-r border-[#252525] ${
            file.active ? 'bg-[#1e1e1e]' : 'hover:bg-[#2d2d2d]'
          } ${draggedId === file.id ? 'opacity-50' : ''}`}
          onClick={() => onSelectFile(file.id)}
          onDoubleClick={() => handleDoubleClick(file)}
          draggable={!editingId}
          onDragStart={(e) => handleDragStart(e, file.id)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, file.id)}
          onDrop={(e) => handleDrop(e, file.id)}
        >
          {editingId === file.id ? (
            <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
              <input
                type="text"
                value={editingName}
                onChange={e => setEditingName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-[#3c3c3c] px-1 rounded w-32 text-sm outline-none"
                autoFocus
              />
              <button 
                onClick={handleRename}
                className="p-1 hover:bg-[#4c4c4c] rounded-sm"
              >
                <Check size={12} />
              </button>
              <button 
                onClick={() => setEditingId(null)}
                className="p-1 hover:bg-[#4c4c4c] rounded-sm"
              >
                <Cancel size={12} />
              </button>
            </div>
          ) : (
            <>
              <span className="text-sm mr-2">{file.name}</span>
              <button 
                className="opacity-60 hover:opacity-100 p-1 rounded-sm hover:bg-[#3c3c3c]"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFile(file.id);
                }}
                disabled={files.length === 1}
              >
                <X size={14} />
              </button>
            </>
          )}
        </div>
      ))}
      <button 
        className="px-2 h-full hover:bg-[#2d2d2d]"
        onClick={onAddFile}
      >
        <Plus size={16} />
      </button>
    </div>
  );
};

export default Tabs;