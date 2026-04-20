import { useEffect, useState } from 'react';
import { subscribeWebFullAppEnabled } from '../services/webConfigService';

export interface WebFullAppState {
  enabled: boolean;
  ready: boolean;
}

export function useWebFullAppEnabled(): WebFullAppState {
  const [state, setState] = useState<WebFullAppState>({ enabled: false, ready: false });

  useEffect(() => {
    const unsubscribe = subscribeWebFullAppEnabled((enabled) => {
      setState({ enabled, ready: true });
    });
    return unsubscribe;
  }, []);

  return state;
}
