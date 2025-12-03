/**
 * Global API configuration for Tentacool frontend.
 * This file contains the base URL for the backend API.
 * 
 * For HuggingFace Spaces, the public API URL format is:
 * https://[username]-[space-name].hf.space
 * 
 * You can edit this value to point to a different server if needed.
 */

const API_CONFIG = {
  // Base URL for the backend API
  // HuggingFace Space: https://huggingface.co/spaces/pennh4i/tentacool
  BASE_URL: 'https://pennh4i-tentacool.hf.space',
  
  // API endpoints (relative to BASE_URL)
  ENDPOINTS: {
    // Root endpoint
    ROOT: '/',
    
    // Health check
    HEALTH: '/api/health',
    
    // Prompts
    PROMPTS: '/api/prompts',
    PROMPT_BY_ID: (id) => `/api/prompts/${id}`,
    PROMPT_NOTE: (id) => `/api/prompts/${id}/note`,
    PROMPT_RESPONSES: (id) => `/api/prompts/${id}/responses`,
    PROMPTS_BATCH: '/api/prompts/batch',
    
    // Responses
    RESPONSES: '/api/responses',
    RESPONSE_BY_ID: (id) => `/api/responses/${id}`,
    RESPONSE_NOTE: (id) => `/api/responses/${id}/note`,
    RESPONSE_JAILBROKEN: (id) => `/api/responses/${id}/jailbroken`,
    RESPONSES_BATCH: '/api/responses/batch',
    
    // LLM
    LLM_QUERY: '/api/llm/query',
    LLM_QUERY_BATCH: '/api/llm/query/batch',
    LLM_PROVIDERS: '/api/llm/providers',
    LLM_MODELS: (provider) => `/api/llm/providers/${provider}/models`,
    LLM_FETCH_MODELS: (provider) => `/api/llm/providers/${provider}/models/fetch`,
    
    // Evaluation
    EVALUATE_JAILBREAK: '/api/evaluate/jailbreak',
    
    // Download
    DOWNLOAD_CSV: '/api/download/csv',
  },
  
  // Helper function to get full URL
  getUrl: (endpoint) => {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
  },
  
  // Helper function to update the base URL (for development/testing)
  setBaseUrl: (newUrl) => {
    API_CONFIG.BASE_URL = newUrl;
  }
};

export default API_CONFIG;

