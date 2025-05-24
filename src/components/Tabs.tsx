import React, { useState, useRef } from 'react';
import { Plus, X, Check, X as Cancel } from 'lucide-react';
import { File } from '../types';

interface TabsProps {
  files: File[];
  onSelectFile: (fileId: string) => void;
  onAddFile: () => void;
  onRemoveFile: (fileId: string) => void;
  onRenameFile: (fileId: string, newName: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ 
  files, 
  onSelectFile, 
  onAddFile, 
  onRemoveFile,
  onRenameFile
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [draggedFile, setDraggedFile] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const dragTimeoutRef = useRef<number>();

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

  const handleDragStart = (e: React.DragEvent, fileId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggedFile(fileId);
    // Add a slight delay before adding the dragging class for better UX
    dragTimeoutRef.current = window.setTimeout(() => {
      const element = document.getElementById(`tab-${fileId}`);
      if (element) element.classList.add('opacity-50');
    }, 50);
  };

  const handleDragEnd = () => {
    setDraggedFile(null);
    setDropTarget(null);
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }
    // Remove dragging class from all tabs
    document.querySelectorAll('[id^="tab-"]').forEach(el => {
      el.classList.remove('opacity-50');
    });
  };

  const handleDragOver = (e: React.DragEvent, fileId: string) => {
    e.preventDefault();
    if (draggedFile && draggedFile !== fileId) {
      setDropTarget(fileId);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedFile || draggedFile === targetId) return;

    const sourceIndex = files.findIndex(f => f.id === draggedFile);
    const targetIndex = files.findIndex(f => f.id === targetId);
    
    if (sourceIndex !== -1 && targetIndex !== -1) {
      const newFiles = [...files];
      const [movedFile] = newFiles.splice(sourceIndex, 1);
      newFiles.splice(targetIndex, 0, movedFile);
      
      // Update localStorage with new order
      localStorage.setItem('promptFiles', JSON.stringify(newFiles));
      
      // Force a re-render by updating the parent component
      const updatedFiles = newFiles.map(file => ({
        ...file,
        active: file.id === (files.find(f => f.active)?.id)
      }));
      
      // Update the files state in the parent component
      onSelectFile(updatedFiles.find(f => f.active)?.id || updatedFiles[0].id);
    }
    
    handleDragEnd();
  };

  return (
    <div className="h-9 bg-[#252526] flex items-center border-b border-[#252525] overflow-x-auto">
      {files.map(file => (
        <div 
          key={file.id}
          id={`tab-${file.id}`}
          draggable={!editingId}
          onDragStart={(e) => handleDragStart(e, file.id)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, file.id)}
          onDrop={(e) => handleDrop(e, file.id)}
          className={`flex items-center h-full px-3 cursor-pointer border-r border-[#252525] transition-colors ${
            file.active ? 'bg-[#1e1e1e]' : 'hover:bg-[#2d2d2d]'
          } ${dropTarget === file.id ? 'border-t-2 border-t-[#007acc]' : ''}`}
          onClick={() => onSelectFile(file.id)}
          onDoubleClick={() => handleDoubleClick(file)}
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