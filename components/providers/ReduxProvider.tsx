'use client';

import { AppStore, makeStore } from '@/lib/store';
import { useState } from 'react';
import { Provider } from 'react-redux';

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  // Use lazy initialization with useState to create the store once
  const [store] = useState<AppStore>(() => makeStore());
  return <Provider store={store}>{children}</Provider>;
}
