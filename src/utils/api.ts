import { useModelConfig } from '../contexts/ModelConfigContext';
import { Message } from '../types';

export const useApiService = () => {
  const { configs, selectedModel } = useModelConfig();

  const compareVersions = async (oldContent: string, newContent: string) => {
    if (!selectedModel || !configs.apiToken) {
      throw new Error('Missing model configuration. Please set up your model ID and API token.');
    }

    const messages = [
      {
        role: 'system',
        content: [{ type: 'text', text: 'You are a helpful assistant that describes differences between two versions of text in a concise way, using less than 20 words.' }]
      },
      {
        role: 'user',
        content: [{ 
          type: 'text', 
          text: `Describe the difference between these two versions:\n\nOLD VERSION:\n${oldContent}\n\nNEW VERSION:\n${newContent}` 
        }]
      }
    ];

    try {
      const response = await fetch('https://ark-cn-beijing.bytedance.net/api/v3/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${configs.apiToken}`
        },
        body: JSON.stringify({
          model: selectedModel.modelId,
          messages
        })
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const messageContent = data.choices[0].message.content;
      
      if (Array.isArray(messageContent)) {
        return messageContent[0].text;
      }
      return messageContent;
    } catch (error) {
      console.error('Failed to generate version description:', error);
      return null;
    }
  };

  const callApi = async (systemPrompt: string, userPrompt: string, chatHistory: Message[] = []) => {
    if (!selectedModel || !configs.apiToken) {
      throw new Error('Missing model configuration. Please set up your model ID and API token.');
    }

    const messages = [
      {
        role: 'system',
        content: [{ type: 'text', text: systemPrompt }]
      },
      ...chatHistory.map(msg => ({
        role: msg.role,
        content: [{ type: 'text', text: msg.content }]
      })),
      {
        role: 'user',
        content: [{ type: 'text', text: userPrompt }]
      }
    ];

    try {
      const response = await fetch('https://ark-cn-beijing.bytedance.net/api/v3/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${configs.apiToken}`
        },
        body: JSON.stringify({
          model: selectedModel.modelId,
          messages
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        const errorMessage = errorData.message || `API Error: ${response.status} - ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data) {
        throw new Error('API returned empty response');
      }

      if (!Array.isArray(data.choices) || data.choices.length === 0) {
        throw new Error('API response missing choices array or empty choices');
      }

      const firstChoice = data.choices[0];
      if (!firstChoice.message) {
        throw new Error('API response missing message in first choice');
      }

      let messageContent = firstChoice.message.content;
      
      if (typeof messageContent === 'string') {
        messageContent = [{ type: 'text', text: messageContent }];
      }
      else if (messageContent && typeof messageContent === 'object' && !Array.isArray(messageContent)) {
        messageContent = [messageContent];
      }
      else if (!Array.isArray(messageContent)) {
        throw new Error('API response has invalid message content format');
      }

      const firstContent = messageContent[0];
      if (!firstContent || typeof firstContent.text !== 'string') {
        if (typeof messageContent[0] === 'string') {
          return messageContent[0];
        }
        throw new Error('API response content missing text or text is not a string');
      }

      return firstContent.text;
    } catch (error) {
      console.error('API Call Error:', error);
      if (error instanceof Error) {
        throw new Error(`API Error: ${error.message}`);
      }
      throw new Error('An unexpected error occurred while calling the API');
    }
  };

  return { callApi, compareVersions };
};