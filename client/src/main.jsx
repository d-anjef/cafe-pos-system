import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BranchProvider } from './context/BranchContext';
import { ThemeProvider } from './context/ThemeContext';
import App from './App';
import PWAManager from './components/PWAManager';
import { Toaster } from 'react-hot-toast';  
import ErrorBoundary from './components/ErrorBoundary';

import './index.css';
import './styles/global.css';
import './styles/nuvlyx-theme.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <BranchProvider>
              <ErrorBoundary>
            <App />
              </ErrorBoundary>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1a1a1a',
                  color: '#fff',
                  borderRadius: '10px',
                  padding: '14px 18px',
                  fontSize: '14px',
                  fontWeight: 500,
                  border: '1px solid rgba(212, 175, 55, 0.2)'
                },
                success: {
                  iconTheme: {
                    primary: '#d4af37',
                    secondary: '#fff'
                  }
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff'
                  },
                  duration: 5000
                }
              }}
            />
            <PWAManager />
          </BranchProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);