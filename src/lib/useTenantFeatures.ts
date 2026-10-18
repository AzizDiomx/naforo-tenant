import { useState, useEffect } from 'react';
import { fetchApi } from './api';

export interface TenantFeatures {
  hasChat: boolean;
  features: string[];
  planCode: string;
  planName: string;
  loading: boolean;
}

export function useTenantFeatures(): TenantFeatures {
  const [featuresData, setFeaturesData] = useState<Omit<TenantFeatures, 'loading'>>(() => {
    try {
      const cached = localStorage.getItem('tenant_features');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (_) {}
    return {
      hasChat: false,
      features: [],
      planCode: 'starter',
      planName: 'Starter',
    };
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetchApi('/tenant-portal/features')
      .then((res) => {
        if (!isMounted || !res) return;
        const normalized = {
          hasChat: Boolean(res.hasChat),
          features: Array.isArray(res.features) ? res.features : [],
          planCode: res.planCode || 'starter',
          planName: res.planName || 'Starter',
        };
        setFeaturesData(normalized);
        try {
          localStorage.setItem('tenant_features', JSON.stringify(normalized));
        } catch (_) {}
      })
      .catch(() => {
        // En cas d'erreur ou d'absence de session, conserver le cache ou la valeur par défaut
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { ...featuresData, loading };
}
