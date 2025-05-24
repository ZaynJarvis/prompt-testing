import React, { useRef, useEffect } from 'react';
import { Loader2, Send } from 'lucide-react';
import { Message } from '../types';

interface ResponsePanelProps {
  messages: Message[];
  isLoading: boolean;
  error?: string | null;
  onMessageEdit: (index: number, newContent: string) => void;
  onSubmit: (index: number) => void;
}

const ResponsePanel: React.FC<ResponsePanelProps> = ({ 
  messages, 
  isLoading, 
  error,
  onMessageEdit,
  onSubmit
}) => {
  const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

  useEffect(() => {
    messages.forEach((_, index) => {
      const textarea = textareaRefs.current[index];
      if (textarea) {
        const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
        const minHeight = textarea.value ? Math.max(textarea.scrollHeight, lineHeight) : lineHeight;
        textarea.style.height = `${minHeight}px`;
      }
    });
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, index: number) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit(index);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>, index: number) => {
    const textarea = e.target;
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
    textarea.style.height = `${lineHeight}px`;
    const height = Math.max(textarea.scrollHeight, lineHeight);
    textarea.style.height = `${height}px`;
    onMessageEdit(index, textarea.value);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-2 text-sm text-gray-400 border-b border-[#252525] flex justify-between items-center">
        <span>Chat History</span>
        {error && <span className="text-red-400 text-xs">{error}</span>}
      </div>
      <div className="flex-1 overflow-auto p-2">
        <div className="space-y-2">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`group flex items-start gap-2 p-2 rounded ${
                message.role === 'user' ? 'bg-[#2d2d2d]' : 'bg-[#1e1e1e] border border-[#3c3c3c]'
              }`}
            >
              <div className="shrink-0 w-16 text-xs text-gray-400 pt-1">
                {message.role === 'user' ? 'You' : 'Assistant'}
              </div>
              <div className="flex-1 relative">
                <textarea
                  ref={el => textareaRefs.current[index] = el}
                  value={message.content}
                  onChange={(e) => handleInput(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  placeholder={message.role === 'user' ? "Type your message... (Press Enter to send, Shift+Enter for new line)" : "Assistant's response"}
                  className="w-full bg-transparent border-none outline-none resize-none font-mono text-sm leading-6 min-h-[24px]"
                  disabled={message.role === 'assistant' || isLoading}
                  rows={1}
                />
                {message.role === 'user' && message.content.trim() && (
                  <button
                    onClick={() => onSubmit(index)}
                    disabled={isLoading}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[#3c3c3c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors opacity-50 group-hover:opacity-100"
                  >
                    <Send size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center justify-center p-2">
              <Loader2 className="animate-spin mr-2" size={14} />
              <span className="text-sm">Generating response...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResponsePanel;