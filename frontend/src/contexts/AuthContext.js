import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('liquex_current_user');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    setLoading(false);
  }, []);

  const login = (username, phoneNumber) => {
    const users = JSON.parse(localStorage.getItem('liquex_users') || '[]');
    let user = users.find(u => u.username === username && u.phoneNumber === phoneNumber);
    
    if (!user) {
      // Create new user
      user = {
        id: Date.now().toString(),
        username,
        phoneNumber,
        createdAt: new Date().toISOString()
      };
      users.push(user);
      localStorage.setItem('liquex_users', JSON.stringify(users));
    }
    
    setCurrentUser(user);
    localStorage.setItem('liquex_current_user', JSON.stringify(user));
    return user;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('liquex_current_user');
  };

  const value = {
    currentUser,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};