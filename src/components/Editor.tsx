import React, { useEffect, useRef, useState } from 'react';
import { History } from 'lucide-react';
import { PromptVersion } from '../types';
import 'microlight';

interface EditorProps {
  content: string;
  versions: PromptVersion[];
  onChange: (content: string) => void;
  onRestoreVersion: (version: PromptVersion) => void;
}

const Editor: React.FC<EditorProps> = ({ content, versions, onChange, onRestoreVersion }) => {
  const [showVersions, setShowVersions] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLPreElement>(null);
  const versionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateHeight = () => {
      if (editorRef.current && previewRef.current) {
        const container = editorRef.current.parentElement;
        if (container) {
          const height = `${container.clientHeight}px`;
          editorRef.current.style.height = height;
          previewRef.current.style.height = height;
        }
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (versionsRef.current && !versionsRef.current.contains(event.target as Node)) {
        setShowVersions(false);
      }
    };

    if (showVersions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showVersions]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    if (previewRef.current) {
      previewRef.current.textContent = e.target.value;
      // @ts-ignore: microlight is added globally
      window.microlight.reset(previewRef.current);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement | HTMLPreElement>) => {
    if (editorRef.current && previewRef.current) {
      if (e.target === editorRef.current) {
        previewRef.current.scrollTop = editorRef.current.scrollTop;
      } else {
        editorRef.current.scrollTop = previewRef.current.scrollTop;
      }
    }
  };

  const handleTab = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      
      const newValue = content.substring(0, start) + '  ' + content.substring(end);
      onChange(newValue);
      
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.selectionStart = editorRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString()}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString()}`;
    } else {
      return date.toLocaleString();
    }
  };

  useEffect(() => {
    if (previewRef.current) {
      previewRef.current.textContent = content;
      // @ts-ignore: microlight is added globally
      window.microlight.reset(previewRef.current);
    }
  }, [content]);

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      <div className="p-2 text-sm text-gray-400 border-b border-[#252525] flex justify-between items-center">
        <span>System Prompt</span>
        <button
          onClick={() => setShowVersions(!showVersions)}
          className={`p-1.5 rounded hover:bg-[#2d2d2d] flex items-center gap-1.5 text-xs transition-colors ${showVersions ? 'bg-[#2d2d2d] text-white' : ''}`}
          title="Version History"
        >
          <History size={14} />
          <span>History</span>
          {versions.length > 1 && (
            <span className="bg-[#007acc] text-white px-1.5 py-0.5 rounded-full text-[10px] font-semibold ml-1">
              {versions.length}
            </span>
          )}
        </button>
      </div>
      <div className="flex-1 overflow-hidden relative">
        <textarea
          ref={editorRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleTab}
          onScroll={handleScroll}
          className="w-full h-full bg-transparent resize-none outline-none font-mono text-sm leading-relaxed p-4 overflow-auto absolute inset-0 text-transparent caret-white"
          spellCheck="false"
        />
        <pre
          ref={previewRef}
          onScroll={handleScroll}
          className="w-full h-full font-mono text-sm leading-relaxed p-4 overflow-auto absolute inset-0 pointer-events-none"
        >{content}</pre>
        {showVersions && versions.length > 0 && (
          <div 
            ref={versionsRef}
            className="absolute right-0 top-0 w-80 bg-[#252526] rounded-md shadow-lg border border-[#3c3c3c] overflow-hidden animate-fadeIn"
            style={{ maxWidth: 'calc(100% - 1rem)' }}
          >
            <div className="p-3 border-b border-[#3c3c3c] bg-[#2d2d2d] flex justify-between items-center">
              <div>
                <h3 className="text-sm font-semibold">Version History</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {versions.length} version{versions.length !== 1 ? 's' : ''} saved
                </p>
              </div>
              <button
                onClick={() => setShowVersions(false)}
                className="text-xs hover:text-white opacity-60 hover:opacity-100"
              >
                Close
              </button>
            </div>
            <div className="max-h-[400px] overflow-auto">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className={`p-3 hover:bg-[#2d2d2d] cursor-pointer group border-b border-[#3c3c3c] last:border-0 ${
                    version.content === content ? 'bg-[#2d2d2d]' : ''
                  }`}
                  onClick={() => {
                    onRestoreVersion(version);
                    setShowVersions(false);
                  }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="text-xs text-gray-400">{formatDate(version.timestamp)}</span>
                      {index === 0 && (
                        <span className="ml-2 text-[10px] bg-[#3c3c3c] text-white px-1.5 py-0.5 rounded-full">
                          Latest
                        </span>
                      )}
                    </div>
                    <button className={`text-xs text-[#007acc] transition-opacity ${
                      version.content === content ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      Restore
                    </button>
                  </div>
                  {version.description && (
                    <div className="text-xs bg-[#1e1e1e] text-gray-300 p-2 rounded mb-2">
                      {version.description}
                    </div>
                  )}
                  <pre className="text-xs font-mono whitespace-pre-wrap overflow-hidden text-gray-300 max-h-24 bg-[#1e1e1e] p-2 rounded">
                    {version.content}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Editor;