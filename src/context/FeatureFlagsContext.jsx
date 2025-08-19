import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const FeatureFlagsContext = createContext({ flags:{}, loading:true });

export function FeatureFlagsProvider({ children }) {
  const [flags, setFlags] = useState({});
  const [loading, setLoading] = useState(true);

  const loadFlags = async () => {
    try {
      const { data, error } = await supabase.from('feature_flags').select('key, enabled');
      if (!error && data) {
        const map = {};
        data.forEach(f => { map[f.key] = f.enabled; });
        setFlags(map);
      }
    } finally { setLoading(false); }
  };

  useEffect(()=>{ loadFlags(); }, []);

  return (
    <FeatureFlagsContext.Provider value={{ flags, loading, refresh:loadFlags }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlag(key, defaultValue=false) {
  const { flags, loading } = useContext(FeatureFlagsContext);
  if (loading) return defaultValue;
  return flags[key] ?? defaultValue;
}

export function useFlagValue(key, defaultValue=null) {
  const { flags } = useContext(FeatureFlagsContext);
  return flags[key] ?? defaultValue;
}

export function useFeatureFlags() { return useContext(FeatureFlagsContext); }
