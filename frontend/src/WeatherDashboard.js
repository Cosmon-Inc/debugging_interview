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

    try {
      const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to parse error response" }));
         setError(`Failed to fetch weather: ${response.status} - ${errorData.error || response.statusText}`);
         setLoading(false);
         return;
      }

      const data = await response.json();

      if (data && typeof data.avgTemp !== 'undefined' && typeof data.reqCount !== 'undefined') {
        setWeather(data);
      } else if (data && data.error) {
        setError(data.error || "Received malformed weather data.");
      }
      else {
        setError("Received unexpected data structure from weather API.");
        console.error("Unexpected weather data structure:", data);
      }

    } catch (err) {
      console.error("Error fetching weather:", err);
      setError(err.message || "An unexpected error occurred while fetching weather.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Weather Dashboard (Mock Data)</h2>
      <p>Demonstrates various issues with temperature calculations, mock weather service, backend counters, and configuration management.</p>
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
          <p>Average Temp: {weather.avgTemp !== null && typeof weather.avgTemp !== 'undefined' ? `${weather.avgTemp.toFixed(2)}°C` : 'N/A'}</p>
          <p>Backend API Request Count: {weather.reqCount}</p>
        </div>
      )}
       <p style={{marginTop: '10px', fontSize: '0.9em'}}>
        Try "London", "Paris", "Tokyo", "Berlin", or "Madrid". Check the temperature calculations and request counter behavior.
      </p>
    </div>
  );
}

export default WeatherDashboard; 