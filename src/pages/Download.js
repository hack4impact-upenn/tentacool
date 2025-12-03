import React, { useState } from 'react';
import './Download.css';
import API_CONFIG from '../data/apiConfig';

const Download = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ prompts: 0, responses: 0 });
  const [hasDownloaded, setHasDownloaded] = useState(false);

  const downloadCSVs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const url = API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.DOWNLOAD_CSV);
      console.log('Downloading CSVs from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      console.log('Content-Type:', response.headers.get('content-type'));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Unexpected content type. Response:', text.substring(0, 200));
        throw new Error('Server returned non-JSON response. Please check the API endpoint.');
      }

      const data = await response.json();
      console.log('Download data received:', { 
        success: data.success, 
        prompts_count: data.data?.prompts_count,
        responses_count: data.data?.responses_count 
      });

      if (data.success) {
        setStats({
          prompts: data.data.prompts_count,
          responses: data.data.responses_count
        });

        // Create and download prompts CSV
        const promptsBlob = new Blob([data.data.prompts], { type: 'text/csv;charset=utf-8;' });
        const promptsUrl = URL.createObjectURL(promptsBlob);
        const promptsLink = document.createElement('a');
        promptsLink.setAttribute('href', promptsUrl);
        promptsLink.setAttribute('download', 'prompts.csv');
        promptsLink.style.visibility = 'hidden';
        document.body.appendChild(promptsLink);
        promptsLink.click();
        document.body.removeChild(promptsLink);

        // Small delay before downloading responses CSV
        setTimeout(() => {
          // Create and download responses CSV
          const responsesBlob = new Blob([data.data.responses], { type: 'text/csv;charset=utf-8;' });
          const responsesUrl = URL.createObjectURL(responsesBlob);
          const responsesLink = document.createElement('a');
          responsesLink.setAttribute('href', responsesUrl);
          responsesLink.setAttribute('download', 'responses.csv');
          responsesLink.style.visibility = 'hidden';
          document.body.appendChild(responsesLink);
          responsesLink.click();
          document.body.removeChild(responsesLink);
          
          // Clean up object URLs after a delay
          setTimeout(() => {
            URL.revokeObjectURL(promptsUrl);
            URL.revokeObjectURL(responsesUrl);
          }, 1000);
          
          setHasDownloaded(true);
        }, 500);
      } else {
        throw new Error(data.error || 'Failed to download CSVs');
      }
    } catch (err) {
      console.error('Error downloading CSVs:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="download-page">
      <div className="download-container">
        <h2 className="download-title">Download Database Data</h2>
        <p className="download-description">
          Download complete CSV files of all prompts and responses from the database.
        </p>

        {isLoading ? (
          <>
            <div className="download-spinner"></div>
            <p>Preparing downloads...</p>
          </>
        ) : error ? (
          <>
            <div className="download-error">✗</div>
            <h3>Download Failed</h3>
            <p className="error-message">{error}</p>
            <button className="download-btn" onClick={downloadCSVs}>
              Try Again
            </button>
          </>
        ) : hasDownloaded ? (
          <>
            <div className="download-success">✓</div>
            <h3>Downloads Complete</h3>
            <p>Your CSV files have been downloaded:</p>
            <div className="download-stats">
              <div className="stat-item">
                <span className="stat-label">Prompts:</span>
                <span className="stat-value">{stats.prompts}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Responses:</span>
                <span className="stat-value">{stats.responses}</span>
              </div>
            </div>
            <p className="download-note">
              Files downloaded: <code>prompts.csv</code> and <code>responses.csv</code>
            </p>
            <button className="download-btn" onClick={downloadCSVs}>
              Download Again
            </button>
          </>
        ) : (
          <button 
            className="download-btn" 
            onClick={downloadCSVs}
            disabled={isLoading}
          >
            Download CSVs
          </button>
        )}
      </div>
    </div>
  );
};

export default Download;

