// src/context/RealtimeContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { realtimeStore } from '../lib/realtimeStore';
import { useAuth } from './AuthContext';

const RealtimeContext = createContext();

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
}

export function RealtimeProvider({ children }) {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const [stats, setStats] = useState({});
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Initialisation après authentification
    if (user && !initialized) {
      initializeUserData();
      setInitialized(true);
    }
  }, [user, initialized]);

  useEffect(() => {
    // Mise à jour périodique des stats
    const interval = setInterval(() => {
      setStats(realtimeStore.getStats());
      setConnected(realtimeStore.connected);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const initializeUserData = async () => {
    if (!user) return;
    try {
      // Charger les données essentielles selon le type d'utilisateur
      const loadPromises = [];

      // Données communes à tous les utilisateurs
      loadPromises.push(
        realtimeStore.primeTable('notifications', {
          filter: `user_id.eq.${user.id}`,
          limit: 100
        })
      );

      // Données spécifiques selon le rôle
      if (user.role === 'admin') {
        // Admin: toutes les données importantes
        loadPromises.push(
          realtimeStore.primeTable('users', { limit: 500 }),
          realtimeStore.primeTable('parcels', { limit: 500 }),
          realtimeStore.primeTable('parcel_submissions', { limit: 200 }),
          realtimeStore.primeTable('transactions', { limit: 200 }),
          realtimeStore.primeTable('municipal_requests', { limit: 100 })
        );
import { useToast } from "@/components/ui/use-toast";
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell } from "../../components/ui/table";
      } else if (user.type?.toLowerCase() === 'vendeur') {
        // Vendeur: ses parcelles et soumissions
        loadPromises.push(
          realtimeStore.primeTable('parcels', {
            filter: `owner_id.eq.${user.id}`,
            limit: 100
          }),
          realtimeStore.primeTable('parcel_submissions', {
            filter: `owner_id.eq.${user.id}`,
            limit: 50
          })
        );
      } else if (user.type?.toLowerCase() === 'particulier') {
        // Particulier: ses favoris, ses demandes
        loadPromises.push(
          realtimeStore.primeTable('user_favorites', {
            filter: `user_id.eq.${user.id}`,
            limit: 50
          }),
          realtimeStore.primeTable('parcels', {
            filter: 'status.eq.active',
            limit: 200
          })
        );
      } else if (user.type?.toLowerCase() === 'banque') {
        // Banque: demandes de financement, garanties, évaluations
        loadPromises.push(
          realtimeStore.primeTable('financing_requests', {
            filter: `bank_id.eq.${user.id}`,
            limit: 100
          }),
          realtimeStore.primeTable('bank_guarantees', {
            filter: `bank_id.eq.${user.id}`,
            limit: 100
          }),
          realtimeStore.primeTable('land_evaluations', {
            filter: `evaluator_id.eq.${user.id}`,
            limit: 100
          })
        );
      } else if (user.type?.toLowerCase() === 'mairie') {
        // Mairie: demandes municipales
        loadPromises.push(
          realtimeStore.primeTable('municipal_requests', {
            filter: `mairie_id.eq.${user.id}`,
            limit: 100
          }),
          realtimeStore.primeTable('building_permits', {
            filter: `mairie_id.eq.${user.id}`,
            limit: 100
          })
        );
      } else if (user.type?.toLowerCase() === 'notaire') {
        // Notaire: transactions, soumissions à reviewer
        loadPromises.push(
          realtimeStore.primeTable('transactions', {
            filter: `notary_id.eq.${user.id}`,
            limit: 100
          }),
          realtimeStore.primeTable('parcel_submissions', {
            filter: 'status.eq.pending',
            limit: 50
          })
        );
      }

      // Messages pour tous les utilisateurs connectés
      loadPromises.push(
        realtimeStore.primeTable('messages', {
          filter: `or(sender_id.eq.${user.id},recipient_id.eq.${user.id})`,
          limit: 100
        })
      );

      // Attendre le chargement
      await Promise.allSettled(loadPromises);
      setConnected(true);

    } catch (error) {
    }
  };

  const invalidateUserData = async () => {
    if (!user) return;
    // Invalider selon le type d'utilisateur
    const invalidatePromises = [];
    
    if (user.role === 'admin') {
      invalidatePromises.push(
        realtimeStore.invalidateTable('users'),
        realtimeStore.invalidateTable('parcels'),
        realtimeStore.invalidateTable('parcel_submissions'),
        realtimeStore.invalidateTable('transactions')
      );
    } else {
      // Invalider les données spécifiques à l'utilisateur
      invalidatePromises.push(
        realtimeStore.invalidateTable('notifications', `user_id.eq.${user.id}`),
        realtimeStore.invalidateTable('messages', `or(sender_id.eq.${user.id},recipient_id.eq.${user.id})`)
      );
    }

    await Promise.allSettled(invalidatePromises);
  };

  const refreshAll = async () => {
    await realtimeStore.invalidateAll();
  };

  // Nettoyage lors de la déconnexion
  useEffect(() => {
    return () => {
      if (initialized) {
        realtimeStore.destroy();
      }
    };
  }, []);

  const contextValue = {
    connected,
    stats,
    initialized,
    initializeUserData,
    invalidateUserData,
    refreshAll,
    realtimeStore
  };

  return (
    <RealtimeContext.Provider value={contextValue}>
      {children}
    </RealtimeContext.Provider>
  );
}
