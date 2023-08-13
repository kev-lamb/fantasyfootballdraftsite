import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import DraftBoard from './components/Draftboard';
import Players from './components/Players';
import Draft from './components/Draft';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(

    <Draft teams={12} rounds={16}/>

);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
