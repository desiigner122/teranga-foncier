// src/context/DemoContext.jsx
import React, { createContext, useContext, useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../../contexts/AuthContext";

const DemoContext = createContext();

export const DemoProvider = ({ children }) => {
  const [demoMode, setDemoMode] = useState(false);
  const [demoUser, setDemoUser] = useState(null);

  const enableDemoMode = (userType = 'admin') => {
    const demoUsers = {
      admin: {
        id: 'demo-admin',
        email: 'demo@admin.com',
        profile: {
          full_name: 'Administrateur Démo',
          type: 'Administrateur',
          role: 'admin',
          verification_status: 'verified'
        }
      },
      particulier: {
        id: 'demo-particulier',
        email: 'demo@particulier.com',
        profile: {
          full_name: 'Utilisateur Démo',
          type: 'Particulier',
          role: 'user',
          verification_status: 'verified'
        }
      },
      banque: {
        id: 'demo-banque',
        email: 'demo@banque.com',
        profile: {
          full_name: 'Banque Démo',
          type: 'Banque',
          role: 'user',
          verification_status: 'verified'
        }
      },
      notaire: {
        id: 'demo-notaire',
        email: 'demo@notaire.com',
        profile: {
          full_name: 'Notaire Démo',
          type: 'Notaire',
          role: 'user',
          verification_status: 'verified'
        }
      },
      mairie: {
        id: 'demo-mairie',
        email: 'demo@mairie.com',
        profile: {
          full_name: 'Mairie Démo',
          type: 'Mairie',
          role: 'user',
          verification_status: 'verified'
        }
      }
    };

    setDemoMode(true);
    setDemoUser(demoUsers[userType] || demoUsers.admin);
  };

  const disableDemoMode = () => {
    setDemoMode(false);
    setDemoUser(null);
  };

  const value = {
    demoMode,
    demoUser,
    enableDemoMode,
    disableDemoMode
  };

  return (
    <DemoContext.Provider value={value}>
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};
