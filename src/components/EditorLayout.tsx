import React, { useState, useEffect, useRef } from 'react';
import Editor from './Editor';
import ResponsePanel from './ResponsePanel';
import Tabs from './Tabs';
import { File, Message, PromptVersion } from '../types';
import { generateUniqueId } from '../utils/helpers';
import { useApiService } from '../utils/api';

const MAX_VERSIONS = 10;
const MIN_PANEL_WIDTH = 300;

const EditorLayout: React.FC = () => {
  const [files, setFiles] = useState<File[]>(() => {
    const stored = localStorage.getItem('promptFiles');
    if (!stored) {
      return [{
        id: generateUniqueId(),
        name: 'prompt1.txt',
        content: '# System Prompt\nYou are a helpful assistant.',
        active: true,
        versions: [{
          id: generateUniqueId(),
          content: '# System Prompt\nYou are a helpful assistant.',
          timestamp: Date.now()
        }]
      }];
    }
    
    const parsedFiles = JSON.parse(stored);
    const activeFileId = localStorage.getItem('activeFileId');
    
    return parsedFiles.map((file: File) => ({
      ...file,
      active: file.id === activeFileId
    }));
  });

  const [activeFile, setActiveFile] = useState<File>(() => {
    const activeFileId = localStorage.getItem('activeFileId');
    return files.find(file => file.id === activeFileId) || files[0];
  });

  const [chatHistory, setChatHistory] = useState<Message[]>(() => {
    const stored = localStorage.getItem('chatHistory');
    return stored ? JSON.parse(stored) : [{ role: 'user', content: '' }];
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editorWidth, setEditorWidth] = useState<number>(400);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { callApi, compareVersions } = useApiService();

  useEffect(() => {
    localStorage.setItem('promptFiles', JSON.stringify(files));
    const activeFile = files.find(file => file.active);
    if (activeFile) {
      localStorage.setItem('activeFileId', activeFile.id);
    }
  }, [files]);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    const storedWidth = localStorage.getItem('editorWidth');
    if (storedWidth) {
      setEditorWidth(Number(storedWidth));
    }
  }, []);

  useEffect(() => {
    if (!isDragging) {
      localStorage.setItem('editorWidth', String(editorWidth));
    }
  }, [isDragging, editorWidth]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = e.clientX - containerRect.left;
      const containerWidth = containerRef.current.offsetWidth;
      
      if (newWidth >= MIN_PANEL_WIDTH && newWidth <= containerWidth - MIN_PANEL_WIDTH) {
        setEditorWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleFileSelect = (fileId: string) => {
    const newFiles = files.map(file => ({
      ...file,
      active: file.id === fileId
    }));
    setFiles(newFiles);
    const selectedFile = files.find(file => file.id === fileId);
    if (selectedFile) {
      setActiveFile(selectedFile);
      setChatHistory([{ role: 'user', content: '' }]);
      setError(null);
    }
  };

  const handleAddFile = () => {
    const initialContent = '# System Prompt\nYou are a helpful assistant.';
    const newFile: File = {
      id: generateUniqueId(),
      name: `prompt${files.length + 1}.txt`,
      content: initialContent,
      active: true,
      versions: [{
        id: generateUniqueId(),
        content: initialContent,
        timestamp: Date.now()
      }]
    };
    
    const newFiles = files.map(file => ({
      ...file,
      active: false
    }));
    
    setFiles([...newFiles, newFile]);
    setActiveFile(newFile);
    setChatHistory([{ role: 'user', content: '' }]);
    setError(null);
  };

  const handleRemoveFile = (fileId: string) => {
    if (files.length === 1) return;
    
    const fileIndex = files.findIndex(file => file.id === fileId);
    const newFiles = files.filter(file => file.id !== fileId);
    
    if (activeFile.id === fileId) {
      const newActiveIndex = fileIndex === 0 ? 0 : fileIndex - 1;
      newFiles[newActiveIndex].active = true;
      setActiveFile(newFiles[newActiveIndex]);
      setChatHistory([{ role: 'user', content: '' }]);
      setError(null);
    }
    
    setFiles(newFiles);
  };

  const handleRenameFile = (fileId: string, newName: string) => {
    const newFiles = files.map(file => 
      file.id === fileId ? { ...file, name: newName } : file
    );
    setFiles(newFiles);
    if (activeFile.id === fileId) {
      setActiveFile({ ...activeFile, name: newName });
    }
  };

  const handleContentChange = (fileId: string, newContent: string) => {
    const newFiles = files.map(file => {
      if (file.id === fileId) {
        return { ...file, content: newContent };
      }
      return file;
    });
    setFiles(newFiles);
    if (activeFile.id === fileId) {
      setActiveFile({ ...activeFile, content: newContent });
    }
  };

  const handleMessageEdit = (index: number, newContent: string) => {
    const newHistory = [...chatHistory];
    newHistory[index] = { ...newHistory[index], content: newContent };
    setChatHistory(newHistory);
  };

  const createNewVersion = async (file: File): Promise<PromptVersion[]> => {
    const currentVersions = file.versions || [];
    const lastVersion = currentVersions[0];
    
    if (!lastVersion || lastVersion.content !== file.content) {
      const description = lastVersion ? await compareVersions(lastVersion.content, file.content) : null;
      
      const newVersion: PromptVersion = {
        id: generateUniqueId(),
        content: file.content,
        timestamp: Date.now(),
        description
      };
      
      return [newVersion, ...currentVersions].slice(0, MAX_VERSIONS);
    }
    
    return currentVersions;
  };

  const handleSubmit = async (messageIndex: number) => {
    const userMessage = chatHistory[messageIndex];
    if (!userMessage.content.trim() || userMessage.role !== 'user') return;

    setIsLoading(true);
    setError(null);

    const relevantHistory = chatHistory.slice(0, messageIndex);
    const updatedHistory = [...relevantHistory, userMessage];

    try {
      const versions = await createNewVersion(activeFile);
      const newFiles = files.map(file => 
        file.id === activeFile.id ? { ...file, versions } : file
      );
      setFiles(newFiles);
      setActiveFile({ ...activeFile, versions });

      const response = await callApi(activeFile.content, userMessage.content, relevantHistory);
      const newAssistantMessage: Message = { role: 'assistant', content: response };
      const newUserMessage: Message = { role: 'user', content: '' };
      setChatHistory([...updatedHistory, newAssistantMessage, newUserMessage]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Failed to get response:', error);
      setChatHistory([...updatedHistory, { role: 'user', content: '' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreVersion = (version: PromptVersion) => {
    const newFiles = files.map(file => {
      if (file.id === activeFile.id) {
        return { ...file, content: version.content };
      }
      return file;
    });
    setFiles(newFiles);
    setActiveFile({ ...activeFile, content: version.content });
  };

  const handleClearChat = () => {
    setChatHistory([{ role: 'user', content: '' }]);
    setError(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <Tabs 
        files={files} 
        onSelectFile={handleFileSelect} 
        onAddFile={handleAddFile} 
        onRemoveFile={handleRemoveFile}
        onRenameFile={handleRenameFile}
      />
      <div className="flex-1 flex relative overflow-hidden" ref={containerRef}>
        <div style={{ width: editorWidth, minWidth: MIN_PANEL_WIDTH }} className="border-r border-[#252525]">
          <Editor 
            content={activeFile.content}
            versions={activeFile.versions || []}
            onChange={(newContent) => handleContentChange(activeFile.id, newContent)}
            onRestoreVersion={handleRestoreVersion}
          />
        </div>
        <div
          className={`w-1 bg-[#252525] cursor-col-resize hover:bg-[#007acc] transition-colors ${
            isDragging ? 'bg-[#007acc]' : ''
          }`}
          onMouseDown={handleMouseDown}
        />
        <div className="flex-1 flex flex-col h-full">
          <ResponsePanel 
            messages={chatHistory} 
            isLoading={isLoading} 
            error={error}
            onMessageEdit={handleMessageEdit}
            onSubmit={handleSubmit}
            onClear={handleClearChat}
          />
        </div>
      </div>
    </div>
  );
};

export default EditorLayout;