import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SupabaseDataService } from '@/services/supabaseDataService';

/**
 * usePermissions - fetches effective permissions + feature flags from roles
 * Returns: { loading, permissions:Set, hasPermission(fn), featureFlags:Set, hasFeature(fn), refresh() }
 */
export default function usePermissions() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [perms, setPerms] = useState(new Set());
  const [features, setFeatures] = useState(new Set());

  const load = useCallback(async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      // Effective permissions JSON array
      const eff = await SupabaseDataService.getEffectivePermissions(profile.id);
      if (Array.isArray(eff)) setPerms(new Set(eff));
      // Collect feature flags from roles
      try {
        const roles = await SupabaseDataService.listUserRoles(profile.id);
        const flags = new Set();
        (roles||[]).forEach(r => {
          (r.feature_flags||[]).forEach(f => flags.add(f));
        });
        setFeatures(flags);
      } catch {/* ignore */}
    } finally { setLoading(false); }
  }, [profile?.id]);

  useEffect(()=>{ load(); }, [load]);

  const hasPermission = useCallback((p) => profile?.role === 'admin' || perms.has(p), [perms, profile?.role]);
  const hasFeature = useCallback((f) => features.has(f) || profile?.role === 'admin', [features, profile?.role]);

  return { loading, permissions: perms, hasPermission, featureFlags: features, hasFeature, refresh: load };
}
