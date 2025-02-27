import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import PrivacyPolicy from './components/PrivacyPolicy';
import './styles/index.css';

ReactDOM.render(
    <React.StrictMode>
        <App />
        <PrivacyPolicy />
    </React.StrictMode>,
    document.getElementById('root')
);
