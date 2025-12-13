import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import DiaryDisplay from './pages/DiaryDisplay';

const App = () => {
  return (
    <ErrorBoundary>
      <UserProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL || '/'}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<DiaryDisplay />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </ErrorBoundary>
  );
};

export default App;