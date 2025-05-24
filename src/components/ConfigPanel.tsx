import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useModelConfig } from '../contexts/ModelConfigContext';
import { ModelConfig } from '../types';

interface ConfigPanelProps {
  onClose: () => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ onClose }) => {
  const { configs, updateConfigs } = useModelConfig();
  const [formData, setFormData] = useState({
    models: configs.models,
    apiToken: configs.apiToken || '',
    selectedModelId: configs.selectedModelId || configs.models[0]?.modelId || null
  });

  const handleTokenChange = (value: string) => {
    setFormData(prev => ({ ...prev, apiToken: value }));
  };

  const handleModelChange = (index: number, field: keyof ModelConfig, value: string) => {
    const newModels = [...formData.models];
    newModels[index] = { ...newModels[index], [field]: value };
    setFormData(prev => ({ ...prev, models: newModels }));
  };

  const handleAddModel = () => {
    const newModel: ModelConfig = {
      modelId: '',
      modelName: '',
      apiToken: formData.apiToken
    };
    setFormData(prev => ({
      ...prev,
      models: [...prev.models, newModel]
    }));
  };

  const handleRemoveModel = (index: number) => {
    const newModels = formData.models.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      models: newModels,
      selectedModelId: prev.selectedModelId === prev.models[index].modelId
        ? newModels[0]?.modelId || null
        : prev.selectedModelId
    }));
  };

  const handleSelectModel = (modelId: string) => {
    setFormData(prev => ({ ...prev, selectedModelId: modelId }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfigs({
      models: formData.models,
      apiToken: formData.apiToken,
      selectedModelId: formData.selectedModelId
    });
    onClose();
  };

  return (
    <div className="w-full max-w-md bg-[#252526] rounded-lg shadow-xl overflow-hidden animate-fadeIn">
      <div className="p-4 bg-[#333333] flex justify-between items-center">
        <h2 className="text-lg font-semibold">Model Configuration</h2>
        <button 
          onClick={onClose}
          className="p-1 rounded-md hover:bg-[#3c3c3c] transition-colors"
        >
          <X size={18} />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              API Token
            </label>
            <input
              type="password"
              value={formData.apiToken}
              onChange={(e) => handleTokenChange(e.target.value)}
              placeholder="Your API token"
              className="w-full px-3 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded-md focus:outline-none focus:ring-2 focus:ring-[#007acc]"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium">Models</label>
              <button
                type="button"
                onClick={handleAddModel}
                className="text-sm px-2 py-1 rounded flex items-center gap-1 hover:bg-[#3c3c3c] transition-colors"
              >
                <Plus size={14} />
                Add Model
              </button>
            </div>

            {formData.models.map((model, index) => (
              <div key={index} className="space-y-3 p-3 bg-[#1e1e1e] rounded-md relative group">
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleRemoveModel(index)}
                    className="p-1 rounded hover:bg-[#3c3c3c] text-red-400 hover:text-red-300 transition-colors"
                    disabled={formData.models.length === 1}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div>
                  <label className="block text-sm mb-1">Model ID</label>
                  <input
                    type="text"
                    value={model.modelId}
                    onChange={(e) => handleModelChange(index, 'modelId', e.target.value)}
                    placeholder="e.g., ep-20250522185859-p8zg6"
                    className="w-full px-3 py-2 bg-[#252526] border border-[#3c3c3c] rounded-md focus:outline-none focus:ring-2 focus:ring-[#007acc]"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Model Name</label>
                  <input
                    type="text"
                    value={model.modelName}
                    onChange={(e) => handleModelChange(index, 'modelName', e.target.value)}
                    placeholder="e.g., Skylark-Pro"
                    className="w-full px-3 py-2 bg-[#252526] border border-[#3c3c3c] rounded-md focus:outline-none focus:ring-2 focus:ring-[#007acc]"
                  />
                </div>

                <div className="pt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={formData.selectedModelId === model.modelId}
                      onChange={() => handleSelectModel(model.modelId)}
                      className="form-radio text-[#007acc] bg-[#252526] border-[#3c3c3c] focus:ring-[#007acc]"
                    />
                    <span className="ml-2 text-sm">Set as active model</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-6">
          <button
            type="submit"
            className="w-full py-2 px-4 bg-[#007acc] hover:bg-[#0066aa] rounded-md transition-colors"
          >
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConfigPanel;