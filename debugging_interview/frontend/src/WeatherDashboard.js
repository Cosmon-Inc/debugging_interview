import React, { useState } from 'react';

function WeatherDashboard() {
  const [city, setCity] = useState('London');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    setWeather(null);

    // --- Bug 4 (Frontend): Async/Promise Handling ---
    // An unhandled promise rejection can occur if the fetch fails
    // and there's no .catch() or try/catch block.
    try {
      // Note: The backend expects 'city' as query param, not 'cityName' as in original README.
      // The Nginx proxy routes /api/* to the backend.
      const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);

      // --- Bug 9: Data Validation Failure (Frontend) ---
      // Not checking response.ok before attempting to parse JSON.
      // If response is an error (e.g., 500), response.json() might fail or return unexpected structure.
      if (!response.ok) {
        // INTENTIONAL BUG: If this block is missing or doesn't throw,
        // the code might proceed with a bad response.
        const errorData = await response.json().catch(() => ({ message: "Failed to parse error response" })); // Try to parse error
        // throw new Error(errorData.error || `API Error: ${response.status} ${response.statusText}`);
        // For the bug, we'll set an error state but not throw, to see how it's handled.
         setError(`Failed to fetch weather: ${response.status} - ${errorData.error || response.statusText}`);
         setLoading(false);
         return; // Stop further processing
      }

      const data = await response.json();

      // --- Bug 9: Data Validation Failure (Frontend) ---
      // Assuming 'data' object always has 'avgTemp' and 'reqCount'.
      // If the API changes or returns an error object structured differently, this will break.
      if (data && typeof data.avgTemp !== 'undefined' && typeof data.reqCount !== 'undefined') {
        setWeather(data);
      } else if (data && data.error) {
        // This case is handled if response.ok was false and errorData was parsed.
        // But if response.ok was true, but data is malformed, this is another check.
        setError(data.error || "Received malformed weather data.");
      }
      else {
        // INTENTIONAL BUG: If data is not in the expected format and no error field,
        // this sets a generic error. The candidate should debug why.
        setError("Received unexpected data structure from weather API.");
        console.error("Unexpected weather data structure:", data);
      }

    } catch (err) {
      // This catch handles network errors or errors from `throw new Error` above.
      console.error("Error fetching weather:", err);
      setError(err.message || "An unexpected error occurred while fetching weather.");
      // --- Bug 4 (Frontend): Async/Promise Handling ---
      // If this catch block itself had an async operation that wasn't awaited or handled,
      // that could also lead to an unhandled promise rejection.
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Weather Dashboard</h2>
      <p>Demonstrates: Bug 1 (Logical Error in avg temp calc), Bug 2 (API Misuse on backend), Bug 4 (Concurrency on backend counter), Bug 7 (Backend Error Handling), Bug 10 (Config on backend).</p>
      <input
        type="text"
        placeholder="Enter city"
        value={city}
        onChange={e => setCity(e.target.value)}
      />
      <button onClick={fetchWeather} disabled={loading}>
        {loading ? 'Fetching...' : 'Get Weather'}
      </button>

      {error && <p className="error">Error: {error}</p>}
      
      {weather && !error && (
        <div>
          <h3>Weather for {weather.city || city}</h3>
          {/* Bug 1 (Logical Error) will be visible here if avgTemp is wrong */}
          <p>Average Temp: {weather.avgTemp !== null && typeof weather.avgTemp !== 'undefined' ? `${weather.avgTemp.toFixed(2)}°C` : 'N/A'}</p>
          {/* Bug 4 (Concurrency Issue) will affect reqCount */}
          <p>Backend API Request Count: {weather.reqCount}</p>
        </div>
      )}
       <p style={{marginTop: '10px', fontSize: '0.9em'}}>
        Try "London" or any city. If avg temp is "Infinity" or NaN, that's Bug 1 (Logical Error).
        If you get an error about API parameters, that's Bug 2 (API Misuse).
        The request counter demonstrates Bug 4 (Concurrency).
      </p>
    </div>
  );
}

export default WeatherDashboard; 