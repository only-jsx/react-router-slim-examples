import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <h1>This part is routed by the Browser History</h1>
        <App />
        <h1>This part is routed by the URL hash</h1>
        <App hash/>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);
