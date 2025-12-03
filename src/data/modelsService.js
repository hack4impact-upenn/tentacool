/**
 * Models service for fetching and managing LLM models.
 * Uses the API endpoint to dynamically fetch models from providers
 * instead of using a static JSON file.
 */

import API_CONFIG from './apiConfig';

/**
 * Fetch available models from a provider's API
 * @param {string} provider - The provider name (e.g., 'openai')
 * @returns {Promise<Object>} - Object with models data
 */
export const fetchModelsFromProvider = async (provider) => {
  try {
    const url = API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.LLM_FETCH_MODELS(provider));
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching models from ${provider}:`, error);
    throw error;
  }
};

/**
 * Get available providers
 * @returns {Promise<Array>} - Array of provider names
 */
export const getProviders = async () => {
  try {
    const url = API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.LLM_PROVIDERS);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch providers: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data.providers || [];
  } catch (error) {
    console.error('Error fetching providers:', error);
    throw error;
  }
};

/**
 * Get models grouped by provider
 * Fetches all available providers and their models from the API
 * @returns {Promise<Object>} - Object with providers as keys and models as values
 */
export const getModelsByProvider = async () => {
  try {
    const providers = await getProviders();
    const modelsByProvider = {};
    
    // Fetch models for each provider
    for (const provider of providers) {
      try {
        const modelsData = await fetchModelsFromProvider(provider);
        // Extract text_models from the response
        const textModels = modelsData.data?.text_models || [];
        modelsByProvider[provider] = textModels.map(model => ({
          id: model.id,
          name: model.id,
          created: model.created,
          owned_by: model.owned_by
        }));
      } catch (error) {
        console.error(`Failed to fetch models for ${provider}:`, error);
        // Continue with other providers even if one fails
        modelsByProvider[provider] = [];
      }
    }
    
    return modelsByProvider;
  } catch (error) {
    console.error('Error getting models by provider:', error);
    throw error;
  }
};

/**
 * Get all models as a flat list
 * @returns {Promise<Array>} - Array of all models with provider info
 */
export const getAllModels = async () => {
  try {
    const modelsByProvider = await getModelsByProvider();
    const allModels = [];
    
    for (const [provider, models] of Object.entries(modelsByProvider)) {
      for (const model of models) {
        allModels.push({
          ...model,
          provider: provider
        });
      }
    }
    
    return allModels;
  } catch (error) {
    console.error('Error getting all models:', error);
    throw error;
  }
};

/**
 * Get models for a specific provider
 * @param {string} provider - The provider name
 * @returns {Promise<Array>} - Array of models for the provider
 */
export const getModelsForProvider = async (provider) => {
  try {
    const modelsData = await fetchModelsFromProvider(provider);
    const textModels = modelsData.data?.text_models || [];
    return textModels.map(model => ({
      id: model.id,
      name: model.id,
      created: model.created,
      owned_by: model.owned_by,
      provider: provider
    }));
  } catch (error) {
    console.error(`Error getting models for ${provider}:`, error);
    throw error;
  }
};

