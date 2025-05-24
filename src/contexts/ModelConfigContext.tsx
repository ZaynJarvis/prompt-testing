import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ModelConfigs, ModelConfig } from '../types';

interface ModelConfigContextType {
  configs: ModelConfigs;
  updateConfigs: (newConfigs: ModelConfigs) => void;
  selectedModel: ModelConfig | null;
}

const defaultConfigs: ModelConfigs = {
  models: [],
  selectedModelId: null,
  apiToken: ''
};

const ModelConfigContext = createContext<ModelConfigContextType>({
  configs: defaultConfigs,
  updateConfigs: () => {},
  selectedModel: null
});

export const useModelConfig = () => useContext(ModelConfigContext);

interface ModelConfigProviderProps {
  children: ReactNode;
}

export const ModelConfigProvider: React.FC<ModelConfigProviderProps> = ({ children }) => {
  const [configs, setConfigs] = useState<ModelConfigs>(() => {
    const stored = localStorage.getItem('modelConfigs');
    return stored ? JSON.parse(stored) : defaultConfigs;
  });

  const selectedModel = configs.selectedModelId
    ? configs.models.find(model => model.modelId === configs.selectedModelId) || null
    : configs.models[0] || null;

  useEffect(() => {
    localStorage.setItem('modelConfigs', JSON.stringify(configs));
  }, [configs]);

  const updateConfigs = (newConfigs: ModelConfigs) => {
    setConfigs(newConfigs);
  };

  return (
    <ModelConfigContext.Provider value={{ configs, updateConfigs, selectedModel }}>
      {children}
    </ModelConfigContext.Provider>
  );
};