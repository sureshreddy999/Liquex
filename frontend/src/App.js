import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import WelcomePage from './pages/WelcomePage';
import MainHub from './pages/MainHub';
import RaiseRequestPage from './pages/RaiseRequestPage';
import RequestResponsePage from './pages/RequestResponsePage';
import ChatPage from './pages/ChatPage';
import './App.css';
//App
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { currentUser } = useAuth();
  return !currentUser ? children : <Navigate to="/welcome" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
          <Routes>
            <Route path="/login" element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } />
            <Route path="/welcome" element={
              <ProtectedRoute>
                <WelcomePage />
              </ProtectedRoute>
            } />
            <Route path="/hub" element={
              <ProtectedRoute>
                <MainHub />
              </ProtectedRoute>
            } />
            <Route path="/raise-request" element={
              <ProtectedRoute>
                <RaiseRequestPage />
              </ProtectedRoute>
            } />
            <Route path="/request/:id" element={
              <ProtectedRoute>
                <RequestResponsePage />
              </ProtectedRoute>
            } />
            <Route path="/chat/:id" element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
