import React, { useState, useEffect } from 'react';

function WeatherDashboard() {
  const [city, setCity] = useState('London');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);

  // Performance bug: Expensive synchronous computation on every render
  // This requires React Profiler to identify the performance bottleneck
  const performExpensiveCalculation = () => {
    console.log('Performing expensive weather analysis...');
    let result = 0;
    // Simulate complex weather pattern analysis - blocks main thread
    for (let i = 0; i < 5000000; i++) {
      result += Math.sin(i) * Math.cos(i) * Math.random();
      // Additional nested loops to make it more expensive
      if (i % 1000 === 0) {
        for (let j = 0; j < 1000; j++) {
          result += Math.sqrt(j);
        }
      }
    }
    return result;
  };

  // This runs on EVERY render, causing severe performance issues
  const expensiveWeatherAnalysis = performExpensiveCalculation();

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    setWeather(null);

    try {
      const response = await fetch(`http://localhost:5000/api/weather?city=${encodeURIComponent(city)}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to parse error response" }));
         setError(`Failed to fetch weather: ${response.status} - ${errorData.error || response.statusText}`);
         setLoading(false);
         return;
      }

      const data = await response.json();

      if (data && typeof data.avgTemp !== 'undefined' && typeof data.reqCount !== 'undefined') {
        setWeather(data);
        // Add to search history
        setSearchHistory(prev => [...prev, { city, timestamp: Date.now(), temp: data.avgTemp }]);
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

  // Additional expensive operation that runs on every input change
  const handleCityChange = (e) => {
    const newCity = e.target.value;
    setCity(newCity);
    
    // Performance bug: Expensive operation on every keystroke
    // This will cause UI to freeze during typing - requires profiler to identify
    if (newCity.length > 2) {
      let validationResult = 0;
      for (let i = 0; i < 1000000; i++) {
        validationResult += newCity.charCodeAt(i % newCity.length);
      }
      console.log('City validation score:', validationResult);
    }
  };

  return (
    <div className="container">
      <h2>Weather Dashboard (Mock Data)</h2>
      <p>Demonstrates various issues with temperature calculations, mock weather service, backend counters, and configuration management.</p>
      
      <div style={{ marginBottom: '10px' }}>
        <p>Weather Analysis Score: {expensiveWeatherAnalysis.toFixed(2)}</p>
        <p>Search History: {searchHistory.length} searches</p>
      </div>
      
      <input
        type="text"
        placeholder="Enter city"
        value={city}
        onChange={handleCityChange} // This will cause performance issues on every keystroke
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
      
      {searchHistory.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <h4>Recent Searches:</h4>
          <ul style={{ fontSize: '0.8em' }}>
            {searchHistory.slice(-3).map((search, index) => (
              <li key={index}>
                {search.city}: {search.temp.toFixed(1)}°C
              </li>
            ))}
          </ul>
        </div>
      )}
      
       <p style={{marginTop: '10px', fontSize: '0.9em'}}>
        Try "London", "Paris", "Tokyo", "Berlin", or "Madrid". Check the temperature calculations and request counter behavior.
        <br />
        <strong>Note:</strong> Type in the city input to experience performance issues that require profiling to diagnose.
      </p>
    </div>
  );
}

export default WeatherDashboard; 