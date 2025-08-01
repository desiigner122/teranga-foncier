import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('authUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse auth user from localStorage", error);
      localStorage.removeItem('authUser');
    } finally {
       setLoading(false);
    }
  }, []);

  const login = (userData) => {
    localStorage.setItem('authUser', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('authUser');
    setUser(null);
  };

  const updateUserProfile = (updatedData) => {
     if (user) {
       const newUser = { ...user, ...updatedData };
       localStorage.setItem('authUser', JSON.stringify(newUser));
       setUser(newUser);
     }
  };


  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isAgent: user?.role === 'agent',
    login,
    logout,
    updateUserProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children} 
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};