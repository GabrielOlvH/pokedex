// PopupContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const PopupContext = createContext();

export const PopupProvider = ({ children }) => {
  const [popups, setPopups] = useState([]);

  const addPopup = (popup) => {
    setPopups((prev) => [...prev, { ...popup, show: true }]);

    // Automatically hide the popup after a timeout
    setTimeout(() => {
      setPopups((prev) =>
          prev.map(p =>
              p.id === popup.id ? { ...p, show: false } : p
          )
      );

      // Remove the popup from the list after animation ends
      setTimeout(() => {
        removePopup(popup.id);
      }, 500); // Duration of fade-out animation
    }, popup.duration || 3000); // Default duration 3 seconds
  };

  const removePopup = (id) => {
    setPopups((prev) => prev.filter(p => p.id !== id));
  };

  return (
      <PopupContext.Provider value={{ addPopup, removePopup, popups }}>
        {children}
      </PopupContext.Provider>
  );
};

export const usePopups = () => useContext(PopupContext);
