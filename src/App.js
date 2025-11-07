import { useState } from 'react';
import './App.css';

// Dummy LLMs configuration
const DUMMY_LLMS = [
  { id: 'gpt4', name: 'GPT-4', color: '#10a37f' },
  { id: 'claude', name: 'Claude', color: '#d97757' },
  { id: 'gemini', name: 'Gemini', color: '#4285f4' },
  { id: 'llama', name: 'Llama', color: '#0467df' }
];

// Mock API call to simulate LLM responses
const mockLLMQuery = async (llmId, query) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  const responses = {
    gpt4: `GPT-4 response to: "${query}"\n\nThis is a simulated response from GPT-4. In production, this would be the actual API response.`,
    claude: `Claude response to: "${query}"\n\nThis is a simulated response from Claude. The backend will handle the real API integration.`,
    gemini: `Gemini response to: "${query}"\n\nThis is a simulated response from Gemini. Replace with actual API calls when backend is ready.`,
    llama: `Llama response to: "${query}"\n\nThis is a simulated response from Llama. This demonstrates the multi-LLM comparison interface.`
  };
  
  return responses[llmId] || 'No response available';
};

// QueryInput Component
function QueryInput({ query, setQuery, onSubmit, isLoading }) {
  return (
    <div className="query-input-container">
      <h1 className="gaegu-bold app-title">Multi-LLM Query</h1>
      <textarea
        className="gaegu-regular query-textarea"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter your query here..."
        disabled={isLoading}
      />
      <button
        className="gaegu-bold query-button"
        onClick={onSubmit}
        disabled={isLoading || !query.trim()}
      >
        {isLoading ? 'Querying...' : 'Query All LLMs'}
      </button>
    </div>
  );
}

// LLMResponseCard Component
function LLMResponseCard({ llm, response, isLoading }) {
  return (
    <div className="llm-card">
      <div className="llm-header gaegu-bold" style={{ borderLeftColor: llm.color }}>
        {llm.name}
      </div>
      <div className="llm-response gaegu-regular">
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        ) : response ? (
          <>
            <pre className="response-text">{response.text}</pre>
            <div className="response-metadata gaegu-regular">
              {new Date(response.timestamp).toLocaleTimeString()}
            </div>
          </>
        ) : (
          <p className="placeholder-text">Response will appear here...</p>
        )}
      </div>
    </div>
  );
}

// ResponseGrid Component
function ResponseGrid({ llms, responses, loadingStates }) {
  return (
    <div className="response-grid">
      {llms.map((llm) => (
        <LLMResponseCard
          key={llm.id}
          llm={llm}
          response={responses[llm.id]}
          isLoading={loadingStates[llm.id]}
        />
      ))}
    </div>
  );
}

// Main App Component
function App() {
  const [query, setQuery] = useState('');
  const [responses, setResponses] = useState({});
  const [loadingStates, setLoadingStates] = useState({});

  const handleQuerySubmit = async () => {
    if (!query.trim()) return;

    // Reset responses and set all to loading
    setResponses({});
    const newLoadingStates = {};
    DUMMY_LLMS.forEach(llm => {
      newLoadingStates[llm.id] = true;
    });
    setLoadingStates(newLoadingStates);

    // Query all LLMs simultaneously
    const promises = DUMMY_LLMS.map(async (llm) => {
      try {
        const text = await mockLLMQuery(llm.id, query);
        const response = {
          text,
          timestamp: Date.now()
        };
        
        // Update individual response as it comes in
        setResponses(prev => ({
          ...prev,
          [llm.id]: response
        }));
        
        setLoadingStates(prev => ({
          ...prev,
          [llm.id]: false
        }));
      } catch (error) {
        setResponses(prev => ({
          ...prev,
          [llm.id]: { text: 'Error fetching response', timestamp: Date.now() }
        }));
        
        setLoadingStates(prev => ({
          ...prev,
          [llm.id]: false
        }));
      }
    });

    await Promise.all(promises);
  };

  const isAnyLoading = Object.values(loadingStates).some(loading => loading);

  return (
    <div className="App">
      <QueryInput
        query={query}
        setQuery={setQuery}
        onSubmit={handleQuerySubmit}
        isLoading={isAnyLoading}
      />
      <ResponseGrid
        llms={DUMMY_LLMS}
        responses={responses}
        loadingStates={loadingStates}
      />
    </div>
  );
}

export default App;
