import React, { useState, useEffect } from 'react';
import './Home.css';
import { getModelsByProvider } from '../data/modelsService';
import API_CONFIG from '../data/apiConfig';

const Home = () => {
  const [view, setView] = useState(1); // 1: Input, 2: Checking, 3: Results
  const [prompt, setPrompt] = useState('');
  const [promptNote, setPromptNote] = useState('');
  const [modelsByProvider, setModelsByProvider] = useState({});
  const [selectedModels, setSelectedModels] = useState(new Set());
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Fetch models on component mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const models = await getModelsByProvider();
        setModelsByProvider(models);
        // Select all models by default
        const allModelIds = [];
        Object.values(models).forEach(providerModels => {
          providerModels.forEach(model => {
            allModelIds.push(`${model.provider}:${model.id}`);
          });
        });
        setSelectedModels(new Set(allModelIds));
      } catch (error) {
        console.error('Error fetching models:', error);
      }
    };
    fetchModels();
  }, []);

  // Toggle model selection
  const toggleModel = (provider, modelId) => {
    const key = `${provider}:${modelId}`;
    setSelectedModels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  // Toggle all models
  const toggleAllModels = () => {
    const allModelIds = [];
    Object.entries(modelsByProvider).forEach(([provider, models]) => {
      models.forEach(model => {
        allModelIds.push(`${provider}:${model.id}`);
      });
    });
    
    if (selectedModels.size === allModelIds.length) {
      setSelectedModels(new Set());
    } else {
      setSelectedModels(new Set(allModelIds));
    }
  };

  // Send queries to selected models
  const handleSubmit = async () => {
    if (!prompt.trim() || selectedModels.size === 0) {
      alert('Please enter a prompt and select at least one model');
      return;
    }

    setIsLoading(true);
    setView(2);
    setResponses([]);

    try {
      // Prepare queries
      const queries = [];
      selectedModels.forEach(modelKey => {
        const [provider, modelId] = modelKey.split(':');
        queries.push({
          id: modelKey,
          provider: provider,
          model: modelId,
          prompt: prompt
        });
      });

      // Send batch query
      const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.LLM_QUERY_BATCH), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ queries })
      });

      const data = await response.json();
      
      if (data.success) {
        // Format responses - only include successful ones with valid data
        const formattedResponses = data.data.results
          .filter(result => {
            // Only include successful responses with valid provider, model, and response text
            return result.status === 'success' && 
                   result.provider && 
                   result.model && 
                   result.response;
          })
          .map(result => ({
            id: result.id,
            provider: result.provider,
            model: result.model,
            prompt: prompt,
            response: result.response,
            status: result.status,
            error: result.error,
            jailbroken: false, // Will be set after evaluation
            note: ''
          }));

        console.log('Formatted responses (filtered):', formattedResponses);
        console.log('Total successful responses:', formattedResponses.length);
        
        setResponses(formattedResponses);
        
        // Evaluate jailbreaks
        if (formattedResponses.length > 0) {
          setIsEvaluating(true);
          await evaluateJailbreaks(formattedResponses);
        } else {
          // No successful responses, go directly to view 3
          setView(3);
        }
      } else {
        throw new Error(data.error || 'Failed to get responses');
      }
    } catch (error) {
      console.error('Error sending queries:', error);
      alert('Error sending queries: ' + error.message);
      setView(1);
    } finally {
      setIsLoading(false);
    }
  };

  // Evaluate jailbreaks
  const evaluateJailbreaks = async (responsesToEvaluate) => {
    console.log('=== Evaluating Jailbreaks ===');
    console.log('Responses to evaluate:', responsesToEvaluate);
    
    try {
      const evaluationData = responsesToEvaluate.map(r => ({
        id: r.id,
        prompt: r.prompt,
        response: r.response
      }));

      console.log('Evaluation data being sent:', evaluationData);

      const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.EVALUATE_JAILBREAK), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ responses: evaluationData })
      });

      const data = await response.json();
      console.log('Evaluation response:', data);
      
      if (data.success) {
        console.log('Evaluation results:', data.data.results);
        
        // Update responses with jailbreak status
        const updatedResponses = responsesToEvaluate.map(resp => {
          const evalResult = data.data.results.find(r => r.id === resp.id);
          console.log(`Finding eval result for ${resp.id}:`, evalResult);
          
          const updated = {
            ...resp,
            jailbroken: evalResult?.jailbroken || false
          };
          console.log(`Updated response ${resp.id}:`, updated);
          return updated;
        });
        
        console.log('All updated responses:', updatedResponses);
        setResponses(updatedResponses);
        setView(3);
      } else {
        console.error('Evaluation failed:', data.error);
        // Still show results even if evaluation fails
        setView(3);
      }
    } catch (error) {
      console.error('Error evaluating jailbreaks:', error);
      // Still show results even if evaluation fails
      setView(3);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Update response note
  const updateResponseNote = (id, note) => {
    setResponses(prev => prev.map(r => 
      r.id === id ? { ...r, note } : r
    ));
  };

  // Update response jailbroken status
  const updateResponseJailbroken = (id, jailbroken) => {
    setResponses(prev => prev.map(r => 
      r.id === id ? { ...r, jailbroken } : r
    ));
  };

  // Log to database
  const handleLogToDatabase = async () => {
    console.log('=== Log to Database - Starting ===');
    console.log('Prompt:', prompt);
    console.log('Prompt Note:', promptNote);
    console.log('Responses count:', responses.length);
    
    try {
      // Filter out responses that don't have valid data
      const validResponses = responses.filter(r => {
        const isValid = r.provider && r.model && r.response;
        if (!isValid) {
          console.warn('Filtering out invalid response:', r);
        }
        return isValid;
      });
      
      console.log('Valid responses count:', validResponses.length);
      
      if (validResponses.length === 0) {
        throw new Error('No valid responses to log to database');
      }
      
      const requestBody = {
        prompt: {
          text: prompt,
          note: promptNote
        },
        responses: validResponses.map(r => ({
          llm: `${r.provider}:${r.model}`,
          response: r.response,
          jailbroken: r.jailbroken,
          note: r.note
        }))
      };
      
      const apiUrl = API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.PROMPTS_BATCH);
      console.log('Making API call to:', apiUrl);
      console.log('Method: POST');
      console.log('Valid responses being sent:', validResponses.length);
      console.log('Request body structure:', {
        prompt: { text: requestBody.prompt.text.substring(0, 50) + '...', note: requestBody.prompt.note },
        responsesCount: requestBody.responses.length,
        firstResponse: {
          llm: requestBody.responses[0]?.llm,
          hasResponse: !!requestBody.responses[0]?.response,
          jailbroken: requestBody.responses[0]?.jailbroken
        }
      });
      
      console.log('Starting fetch...');
      const fetchStartTime = Date.now();
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const fetchDuration = Date.now() - fetchStartTime;
      console.log(`Fetch completed in ${fetchDuration}ms`);
      console.log('API Response Status:', response.status, response.statusText);
      console.log('API Response OK:', response.ok);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }
      
      console.log('Parsing JSON response...');
      const data = await response.json();
      console.log('API Response Data:', data);
      
      if (data.success) {
        console.log('✓ Successfully logged to database');
        console.log('Prompt ID:', data.data?.prompt_id);
        console.log('Response IDs:', data.data?.responses?.ids);
        console.log('Total responses logged:', data.data?.responses?.count);
        setShowConfirmation(true);
        setTimeout(() => {
          setShowConfirmation(false);
          // Reset to view 1
          setView(1);
          setPrompt('');
          setPromptNote('');
          setResponses([]);
          console.log('✓ Reset to view 1');
        }, 2000);
      } else {
        console.error('✗ API returned error:', data.error);
        throw new Error(data.error || 'Failed to log to database');
      }
    } catch (error) {
      console.error('✗ Error logging to database:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      alert('Error logging to database: ' + error.message);
    }
    console.log('=== Log to Database - Finished ===');
  };

  // View 1: Chat box + model selection
  if (view === 1) {
    return (
      <div className="home-page">
        <div className="home-container">
          <h2 className="home-title">Test Your Prompt</h2>
          
          <div className="chat-box">
            <textarea
              className="chat-input"
              placeholder="Enter your prompt here..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
            />
          </div>

          <div className="models-selection">
            <div className="models-header">
              <h3>Select Models</h3>
              <button 
                className="toggle-all-btn"
                onClick={toggleAllModels}
              >
                {selectedModels.size === Object.values(modelsByProvider).flat().length 
                  ? 'Deselect All' 
                  : 'Select All'}
              </button>
            </div>
            
            <div className="models-list">
              {Object.entries(modelsByProvider).map(([provider, models]) => (
                <div key={provider} className="provider-group">
                  <h4 className="provider-name">{provider.toUpperCase()}</h4>
                  <div className="models-grid">
                    {models.map(model => {
                      const key = `${provider}:${model.id}`;
                      const isSelected = selectedModels.has(key);
                      return (
                        <label key={key} className="model-checkbox">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleModel(provider, model.id)}
                          />
                          <span>{model.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            className="submit-btn"
            onClick={handleSubmit}
            disabled={!prompt.trim() || selectedModels.size === 0}
          >
            Run on Selected Models
          </button>
        </div>
      </div>
    );
  }

  // View 2: Responses received, checking jailbroken
  if (view === 2) {
    return (
      <div className="home-page">
        <div className="home-container">
          <h2 className="home-title">Responses Received</h2>
          
          {responses.length === 0 && isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner-large"></div>
              <h3>Fetching Responses</h3>
              <p>Sending queries to {selectedModels.size} model(s)...</p>
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          ) : (
            <div className="responses-list">
              {responses.map((resp, index) => (
                <div key={resp.id || index} className="response-card">
                  <div className="response-header">
                    <span className="response-model">{resp.provider}:{resp.model}</span>
                    <div className="response-status">
                      {isEvaluating ? (
                        <>
                          <span className="spinner"></span>
                          <span>Checking jailbroken</span>
                        </>
                      ) : (
                        <span>Processing...</span>
                      )}
                    </div>
                  </div>
                  <div className="response-content">
                    {resp.response || (resp.error ? `Error: ${resp.error}` : 'Waiting for response...')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // View 3: Jailbreak toggles, notes, log button
  if (view === 3) {
    return (
      <div className="home-page">
        <div className="home-container">
          {showConfirmation && (
            <div className="confirmation-message">
              ✓ Successfully logged to database!
            </div>
          )}
          
          <h2 className="home-title">Review Results</h2>
          
          <div className="prompt-section">
            <h3>Prompt</h3>
            <div className="prompt-text">{prompt}</div>
            <textarea
              className="prompt-note-input"
              placeholder="Add a note about this prompt..."
              value={promptNote}
              onChange={(e) => setPromptNote(e.target.value)}
              rows={2}
            />
          </div>

          <div className="responses-list">
            {responses.map((resp, index) => (
              <div key={resp.id || index} className="response-card">
                <div className="response-header">
                  <span className="response-model">{resp.provider}:{resp.model}</span>
                  <div className="jailbreak-toggle">
                    <label>
                      <input
                        type="checkbox"
                        checked={resp.jailbroken}
                        onChange={(e) => updateResponseJailbroken(resp.id, e.target.checked)}
                      />
                      <span className={resp.jailbroken ? 'jailbroken' : 'not-jailbroken'}>
                        {resp.jailbroken ? 'Yes' : 'No'}
                      </span>
                    </label>
                  </div>
                </div>
                <div className="response-content">{resp.response}</div>
                <textarea
                  className="response-note-input"
                  placeholder="Add a note about this response..."
                  value={resp.note}
                  onChange={(e) => updateResponseNote(resp.id, e.target.value)}
                  rows={2}
                />
              </div>
            ))}
          </div>

          <button 
            className="log-btn"
            onClick={handleLogToDatabase}
          >
            Log to Database
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default Home;
