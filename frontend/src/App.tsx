import { useState, useEffect, useCallback } from 'react';
import './App.css';

type Url = {
  _id: string;
  originalUrl: string;
  shortUrl: string;
  urlCode: string;
  createdAt: string;
  clicks: number;
};

function App() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [urls, setUrls] = useState<Url[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState('');

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

  const fetchUrls = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/geturl`);
      if (!response.ok) throw new Error('Failed to fetch URLs');
  
      const data = await response.json();
      setUrls(data.urlData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Error fetching URLs:', err.message);
        setError('Could not load URLs. Please try again later.');
      }
    }
  }, [BASE_URL]);

  useEffect(() => {
    fetchUrls();
  }, [fetchUrls]);

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!originalUrl) {
      setError('Please enter a URL');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${BASE_URL}/api/shorten`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ originalUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to shorten URL');
      }

      const data = await response.json();
      setUrls(prevUrls => [data, ...prevUrls.filter(url => url._id !== data._id)]);
      setOriginalUrl('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Something went wrong. Please try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopySuccess('Copied!');
        setTimeout(() => setCopySuccess(''), 2000);
      })
      .catch(() => {
        setError('Failed to copy');
      });
  };

  return (
    <div className="container">
      <h1>URL Shortener</h1>
      
      <form onSubmit={handleSubmit} className="url-form">
        <div className="input-group">
          <input
            type="url"
            placeholder="Enter a long URL"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            required
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Shortening...' : 'Shorten URL'}
          </button>
        </div>
        {error && <p className="error">{error}</p>}
        {copySuccess && <p className="success">{copySuccess}</p>}
      </form>

      <div className="urls-container">
        <h2>Your Shortened URLs</h2>
        {urls.length === 0 ? (
          <p>No URLs shortened yet</p>
        ) : (
          <table className="urls-table">
            <thead>
              <tr>
                <th>Original URL</th>
                <th>Short URL</th>
                <th>Clicks</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {urls?.map((url) => (
                <tr key={url._id}>
                  <td className="original-url" title={url.originalUrl}>
                    {url.originalUrl.length > 30
                      ? `${url.originalUrl.substring(0, 30)}...`
                      : url.originalUrl}
                  </td>
                  <td>
                    <a href={url.shortUrl} target="_blank" rel="noopener noreferrer">
                      {url.shortUrl}
                    </a>
                  </td>
                  <td>{url.clicks}</td>
                  <td>{new Date(url.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="copy-btn"
                      onClick={() => copyToClipboard(url.shortUrl)}
                    >
                      Copy
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default App;