import React, { useRef, useEffect } from 'react';
import { Loader2, Send, Copy, Trash2 } from 'lucide-react';
import { Message } from '../types';

interface ResponsePanelProps {
  messages: Message[];
  isLoading: boolean;
  error?: string | null;
  onMessageEdit: (index: number, newContent: string) => void;
  onSubmit: (index: number) => void;
  onClear: () => void;
}

const ResponsePanel: React.FC<ResponsePanelProps> = ({ 
  messages, 
  isLoading, 
  error,
  onMessageEdit,
  onSubmit,
  onClear
}) => {
  const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messages.forEach((_, index) => {
      const textarea = textareaRefs.current[index];
      if (textarea) {
        const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
        const minHeight = textarea.value ? Math.max(textarea.scrollHeight, lineHeight) : lineHeight;
        textarea.style.height = `${minHeight}px`;
      }
    });

    // Scroll to the bottom when new messages are added
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
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

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-2 text-sm text-gray-400 border-b border-[#252525] flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span>Chat History</span>
          <button
            onClick={onClear}
            className="p-1.5 rounded hover:bg-[#3c3c3c] text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            title="Clear history"
          >
            <Trash2 size={14} />
          </button>
        </div>
        {error && <span className="text-red-400 text-xs">{error}</span>}
      </div>
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-2"
      >
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
                className="w-full bg-transparent border-none outline-none resize-none font-mono text-sm leading-6 min-h-[24px] max-h-[300px] overflow-y-auto pr-16"
                disabled={message.role === 'assistant' || isLoading}
                rows={1}
              />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {message.content.trim() && (
                  <button
                    onClick={() => handleCopy(message.content)}
                    className="p-1.5 rounded hover:bg-[#3c3c3c] opacity-0 group-hover:opacity-100 transition-all"
                    title="Copy message"
                  >
                    <Copy size={12} />
                  </button>
                )}
                {message.role === 'user' && message.content.trim() && (
                  <button
                    onClick={() => onSubmit(index)}
                    disabled={isLoading}
                    className="p-1.5 rounded hover:bg-[#3c3c3c] disabled:opacity-50 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Send size={12} />
                  </button>
                )}
              </div>
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
  );
};

export default ResponsePanel;