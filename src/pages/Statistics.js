import React, { useState, useEffect } from 'react';
import './Statistics.css';
import API_CONFIG from '../data/apiConfig';

const Statistics = () => {
  const [stats, setStats] = useState({
    totalPrompts: 0,
    totalResponses: 0,
    overallJailbreakRate: 0,
    bestPrompts: [],
    worstPrompts: [],
    bestLLMs: [],
    worstLLMs: [],
    jailbreakCount: 0,
    notJailbrokenCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setIsLoading(true);
    try {
      // Fetch all prompts
      const promptsResponse = await fetch(
        API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.PROMPTS) + '?limit=1000'
      );
      const promptsData = await promptsResponse.json();
      const prompts = promptsData.success ? promptsData.data : [];

      // Fetch all responses
      const responsesResponse = await fetch(
        API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.RESPONSES) + '?limit=1000'
      );
      const responsesData = await responsesResponse.json();
      const responses = responsesData.success ? responsesData.data : [];

      // Calculate statistics
      const jailbrokenResponses = responses.filter(r => r.jailbroken);
      const notJailbrokenResponses = responses.filter(r => !r.jailbroken);
      
      // Calculate jailbreak rate per prompt
      const promptStats = {};
      prompts.forEach(prompt => {
        const promptResponses = responses.filter(r => r.prompt_id === prompt.id);
        const jailbroken = promptResponses.filter(r => r.jailbroken).length;
        const total = promptResponses.length;
        if (total > 0) {
          promptStats[prompt.id] = {
            prompt,
            jailbreakRate: (jailbroken / total) * 100,
            jailbroken,
            total
          };
        }
      });

      // Calculate jailbreak rate per LLM
      const llmStats = {};
      responses.forEach(response => {
        if (!llmStats[response.llm]) {
          llmStats[response.llm] = { jailbroken: 0, total: 0 };
        }
        llmStats[response.llm].total++;
        if (response.jailbroken) {
          llmStats[response.llm].jailbroken++;
        }
      });

      // Convert to arrays and calculate rates
      const llmStatsArray = Object.entries(llmStats).map(([llm, stats]) => ({
        llm,
        jailbreakRate: (stats.jailbroken / stats.total) * 100,
        jailbroken: stats.jailbroken,
        total: stats.total
      }));

      // Sort prompts by jailbreak rate
      const promptStatsArray = Object.values(promptStats)
        .sort((a, b) => b.jailbreakRate - a.jailbreakRate);

      // Get best and worst prompts (top 5)
      const bestPrompts = promptStatsArray.slice(0, 5);
      const worstPrompts = [...promptStatsArray]
        .sort((a, b) => a.jailbreakRate - b.jailbreakRate)
        .slice(0, 5);

      // Sort LLMs by jailbreak rate
      const sortedLLMs = [...llmStatsArray].sort((a, b) => b.jailbreakRate - a.jailbreakRate);
      const bestLLMs = sortedLLMs.slice(0, 5);
      const worstLLMs = [...sortedLLMs]
        .sort((a, b) => a.jailbreakRate - b.jailbreakRate)
        .slice(0, 5);

      setStats({
        totalPrompts: prompts.length,
        totalResponses: responses.length,
        overallJailbreakRate: responses.length > 0 
          ? (jailbrokenResponses.length / responses.length) * 100 
          : 0,
        bestPrompts,
        worstPrompts,
        bestLLMs,
        worstLLMs,
        jailbreakCount: jailbrokenResponses.length,
        notJailbrokenCount: notJailbrokenResponses.length
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="statistics-page">
        <div className="statistics-container">
          <div className="loading">Loading statistics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="statistics-page">
      <div className="statistics-container">
        <h2 className="statistics-title">Top Statistics</h2>

        {/* Overview Cards */}
        <div className="overview-cards">
          <div className="stat-card">
            <div className="stat-label">Total Prompts</div>
            <div className="stat-value">{stats.totalPrompts}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Responses</div>
            <div className="stat-value">{stats.totalResponses}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Jailbroken</div>
            <div className="stat-value jailbroken">{stats.jailbreakCount}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Overall Jailbreak Rate</div>
            <div className="stat-value">{stats.overallJailbreakRate.toFixed(1)}%</div>
          </div>
        </div>

        {/* Best and Worst Prompts */}
        <div className="stats-section">
          <div className="stats-column">
            <h3 className="section-title">Best Prompts (Highest Jailbreak Rate)</h3>
            {stats.bestPrompts.length > 0 ? (
              <div className="stats-list">
                {stats.bestPrompts.map((item, index) => (
                  <div key={item.prompt.id} className="stat-item">
                    <div className="stat-item-header">
                      <span className="rank">#{index + 1}</span>
                      <span className="rate">{item.jailbreakRate.toFixed(1)}%</span>
                    </div>
                    <div className="stat-item-content">
                      <div className="stat-item-text">{item.prompt.text}</div>
                      <div className="stat-item-meta">
                        {item.jailbroken}/{item.total} responses jailbroken
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">No prompt data available</div>
            )}
          </div>

          <div className="stats-column">
            <h3 className="section-title">Worst Prompts (Lowest Jailbreak Rate)</h3>
            {stats.worstPrompts.length > 0 ? (
              <div className="stats-list">
                {stats.worstPrompts.map((item, index) => (
                  <div key={item.prompt.id} className="stat-item">
                    <div className="stat-item-header">
                      <span className="rank">#{index + 1}</span>
                      <span className="rate">{item.jailbreakRate.toFixed(1)}%</span>
                    </div>
                    <div className="stat-item-content">
                      <div className="stat-item-text">{item.prompt.text}</div>
                      <div className="stat-item-meta">
                        {item.jailbroken}/{item.total} responses jailbroken
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">No prompt data available</div>
            )}
          </div>
        </div>

        {/* Best and Worst LLMs */}
        <div className="stats-section">
          <div className="stats-column">
            <h3 className="section-title">Most Vulnerable LLMs (Highest Jailbreak Rate)</h3>
            {stats.bestLLMs.length > 0 ? (
              <div className="stats-list">
                {stats.bestLLMs.map((item, index) => (
                  <div key={item.llm} className="stat-item">
                    <div className="stat-item-header">
                      <span className="rank">#{index + 1}</span>
                      <span className="rate">{item.jailbreakRate.toFixed(1)}%</span>
                    </div>
                    <div className="stat-item-content">
                      <div className="stat-item-text">{item.llm}</div>
                      <div className="stat-item-meta">
                        {item.jailbroken}/{item.total} responses jailbroken
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">No LLM data available</div>
            )}
          </div>

          <div className="stats-column">
            <h3 className="section-title">Most Secure LLMs (Lowest Jailbreak Rate)</h3>
            {stats.worstLLMs.length > 0 ? (
              <div className="stats-list">
                {stats.worstLLMs.map((item, index) => (
                  <div key={item.llm} className="stat-item">
                    <div className="stat-item-header">
                      <span className="rank">#{index + 1}</span>
                      <span className="rate">{item.jailbreakRate.toFixed(1)}%</span>
                    </div>
                    <div className="stat-item-content">
                      <div className="stat-item-text">{item.llm}</div>
                      <div className="stat-item-meta">
                        {item.jailbroken}/{item.total} responses jailbroken
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">No LLM data available</div>
            )}
          </div>
        </div>

        <button className="refresh-btn" onClick={fetchStatistics}>
          Refresh Statistics
        </button>
      </div>
    </div>
  );
};

export default Statistics;
