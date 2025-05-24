import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // You can create a basic index.css if needed
import App from './App';
// import reportWebVitals from './reportWebVitals'; // REMOVED

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// reportWebVitals(); // REMOVED 