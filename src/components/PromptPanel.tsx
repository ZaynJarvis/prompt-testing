import React, { useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface PromptPanelProps {
  userPrompt: string;
  onChange: (prompt: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const PromptPanel: React.FC<PromptPanelProps> = ({ 
  userPrompt, 
  onChange, 
  onSubmit,
  isLoading
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [userPrompt]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="border-t border-[#252525] p-4">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={userPrompt}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
          className="w-full bg-[#2d2d2d] rounded-lg pl-4 pr-12 py-3 outline-none resize-none font-mono text-sm max-h-32"
          disabled={isLoading}
          rows={1}
        />
        <button
          onClick={onSubmit}
          disabled={isLoading || !userPrompt.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-[#3c3c3c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors opacity-50 hover:opacity-100"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

export default PromptPanel;