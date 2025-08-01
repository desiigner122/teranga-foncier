import React, { createContext, useState, useEffect } from 'react';

export const ComparisonContext = createContext();

export const ComparisonProvider = ({ children }) => {
  const [comparisonList, setComparisonList] = useState(() => {
    const localData = localStorage.getItem('comparisonList');
    return localData ? JSON.parse(localData) : [];
  });

  useEffect(() => {
    localStorage.setItem('comparisonList', JSON.stringify(comparisonList));
  }, [comparisonList]);

  const addToCompare = (parcelId) => {
    // Limit comparison to e.g., 4 items
    if (comparisonList.length < 4 && !comparisonList.includes(parcelId)) {
      setComparisonList(prevList => [...prevList, parcelId]);
    } else if (comparisonList.length >= 4) {
       // Optionally show a toast message here
       console.warn("Maximum comparison limit reached (4 items).");
    }
  };

  const removeFromCompare = (parcelId) => {
    setComparisonList(prevList => prevList.filter(id => id !== parcelId));
  };

  const clearCompare = () => {
    setComparisonList([]);
  };

  return (
    <ComparisonContext.Provider value={{ comparisonList, addToCompare, removeFromCompare, clearCompare }}>
      {children}
    </ComparisonContext.Provider>
  );
};