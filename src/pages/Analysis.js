import React, { useState } from 'react';
import './Analysis.css';
import API_CONFIG from '../data/apiConfig';

const Analysis = () => {
  const [queryType, setQueryType] = useState('prompts'); // 'prompts' or 'responses'
  
  // Separate filter states for prompts and responses
  const [promptFilters, setPromptFilters] = useState({
    searchText: ''
  });
  const [responseFilters, setResponseFilters] = useState({
    promptId: '',
    llm: '',
    jailbroken: ''
  });
  
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);

  // Handle tab switch - clear results and reset offset
  const handleQueryTypeChange = (newType) => {
    setQueryType(newType);
    setResults([]);
    setOffset(0);
  };

  const handlePromptFilterChange = (key, value) => {
    setPromptFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResponseFilterChange = (key, value) => {
    setResponseFilters(prev => ({ ...prev, [key]: value }));
  };

  const executeQuery = async () => {
    setIsLoading(true);
    setResults([]);
    setOffset(0);

    try {
      let url;
      const params = new URLSearchParams();

      if (queryType === 'prompts') {
        url = API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.PROMPTS);
        if (limit) params.append('limit', limit);
        if (offset) params.append('offset', offset);
      } else {
        url = API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.RESPONSES);
        if (responseFilters.llm) {
          params.append('llm', responseFilters.llm);
        }
        if (responseFilters.jailbroken !== '') {
          // Backend expects string 'true' or 'false', or we can send boolean
          // Let's send as string to match URL param format
          params.append('jailbroken', responseFilters.jailbroken);
        }
        if (responseFilters.promptId) {
          params.append('prompt_id', responseFilters.promptId);
        }
        if (limit) params.append('limit', limit);
        if (offset) params.append('offset', offset);
      }

      if (params.toString()) {
        url += '?' + params.toString();
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        // Filter results client-side for text search on prompts
        let filteredResults = data.data || [];
        
        if (queryType === 'prompts' && promptFilters.searchText) {
          const searchLower = promptFilters.searchText.toLowerCase();
          filteredResults = filteredResults.filter(item => 
            item.text?.toLowerCase().includes(searchLower) ||
            item.note?.toLowerCase().includes(searchLower)
          );
        }

        // For responses, also apply client-side filtering if needed
        if (queryType === 'responses') {
          // Additional client-side filtering can be added here if needed
          // The backend should handle most filtering, but we can refine here
        }

        setResults(filteredResults);
      } else {
        throw new Error(data.error || 'Failed to fetch data');
      }
    } catch (error) {
      console.error('Error executing query:', error);
      alert('Error executing query: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPromptResponses = async (promptId) => {
    try {
      const url = API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.PROMPT_RESPONSES(promptId));
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        return data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching prompt responses:', error);
      return [];
    }
  };

  return (
    <div className="analysis-page">
      <div className="analysis-container">
        <h2 className="analysis-title">Database Analysis</h2>
        
        <div className="query-controls">
          <div className="query-type-selector">
            <label>
              <input
                type="radio"
                value="prompts"
                checked={queryType === 'prompts'}
                onChange={(e) => handleQueryTypeChange(e.target.value)}
              />
              <span>Prompts</span>
            </label>
            <label>
              <input
                type="radio"
                value="responses"
                checked={queryType === 'responses'}
                onChange={(e) => handleQueryTypeChange(e.target.value)}
              />
              <span>Responses</span>
            </label>
          </div>

          <div className="filters-section">
            {queryType === 'prompts' ? (
              <div className="filter-group">
                <label>Search Text (in prompt or note)</label>
                <input
                  type="text"
                  placeholder="Search prompts..."
                  value={promptFilters.searchText}
                  onChange={(e) => handlePromptFilterChange('searchText', e.target.value)}
                />
              </div>
            ) : (
              <>
                <div className="filter-group">
                  <label>Prompt ID</label>
                  <input
                    type="number"
                    placeholder="Filter by prompt ID"
                    value={responseFilters.promptId}
                    onChange={(e) => handleResponseFilterChange('promptId', e.target.value)}
                  />
                </div>
                <div className="filter-group">
                  <label>LLM</label>
                  <input
                    type="text"
                    placeholder="Filter by LLM (e.g., openai:gpt-3.5-turbo)"
                    value={responseFilters.llm}
                    onChange={(e) => handleResponseFilterChange('llm', e.target.value)}
                  />
                </div>
                <div className="filter-group">
                  <label>Jailbroken</label>
                  <select
                    value={responseFilters.jailbroken}
                    onChange={(e) => handleResponseFilterChange('jailbroken', e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </>
            )}

            <div className="filter-group">
              <label>Limit</label>
              <input
                type="number"
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value) || 50)}
                min="1"
                max="1000"
              />
            </div>
          </div>

          <button 
            className="query-btn"
            onClick={executeQuery}
            disabled={isLoading}
          >
            {isLoading ? 'Querying...' : 'Execute Query'}
          </button>
        </div>

        {results.length > 0 && (
          <div className="results-section">
            <h3>Results ({results.length})</h3>
            <div className="results-table">
              {queryType === 'prompts' ? (
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Text</th>
                      <th>Note</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((prompt) => (
                      <tr key={prompt.id}>
                        <td>{prompt.id}</td>
                        <td className="text-cell">{prompt.text}</td>
                        <td className="note-cell">{prompt.note || '-'}</td>
                        <td>
                          <button 
                            className="view-responses-btn"
                            onClick={async () => {
                              const responses = await fetchPromptResponses(prompt.id);
                              alert(`This prompt has ${responses.length} response(s)`);
                            }}
                          >
                            View Responses
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Prompt ID</th>
                      <th>LLM</th>
                      <th>Response</th>
                      <th>Jailbroken</th>
                      <th>Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((response) => (
                      <tr key={response.id}>
                        <td>{response.id}</td>
                        <td>{response.prompt_id}</td>
                        <td>{response.llm}</td>
                        <td className="text-cell">{response.response}</td>
                        <td>
                          <span className={response.jailbroken ? 'jailbroken-badge' : 'not-jailbroken-badge'}>
                            {response.jailbroken ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="note-cell">{response.note || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {results.length === 0 && !isLoading && (
          <div className="no-results">
            <p>No results found. Execute a query to see data.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analysis;
