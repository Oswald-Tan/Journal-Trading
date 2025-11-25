// contexts/ModalContext.jsx
import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext();

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider = ({ children }) => {
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);

  const openBalanceModal = () => {
    console.log("ModalContext: Opening Balance Modal");
    setShowBalanceModal(true);
  };

  const closeBalanceModal = () => {
    setShowBalanceModal(false);
  };

  const value = {
    showBalanceModal,
    showTargetModal,
    openBalanceModal,
    closeBalanceModal,
    setShowTargetModal,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};