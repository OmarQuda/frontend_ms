import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PaymentPage from './pages/PaymentPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/payment">Payment</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/payment" element={<PaymentPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App; 