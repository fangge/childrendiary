import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import ErrorBoundary from './components/ErrorBoundary';
import LayoutGithub from './components/LayoutGithub';
import HomeGithub from './pages/HomeGithub';

const App = () => {
  return (
    <ErrorBoundary>
      <UserProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL || '/'}>
          <Routes>
            <Route path="/" element={<LayoutGithub />}>
              <Route index element={<HomeGithub />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </ErrorBoundary>
  );
};

export default App;