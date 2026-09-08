'use client';

import { ContactFormType, ContactFormValues } from '@/lib/utils/contactForm';
import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import ContactDialog from './ContactDialog';

interface OpenOptions {
  type: ContactFormType;
  source: string;
  prefill?: Partial<ContactFormValues>;
}

interface ContactDialogContextValue {
  open: (options: OpenOptions) => void;
  close: () => void;
}

const ContactDialogContext = createContext<ContactDialogContextValue | null>(null);

export const useContactDialog = () => {
  const context = useContext(ContactDialogContext);
  if (!context) {
    throw new Error('useContactDialog must be used within a ContactDialogProvider');
  }
  return context;
};

export function ContactDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<OpenOptions>({ type: 'contact', source: 'unknown' });
  // Bumped on every open so ContactDialog remounts with fresh form state.
  const [instance, setInstance] = useState(0);

  const open = useCallback((next: OpenOptions) => {
    setOptions(next);
    setInstance((count) => count + 1);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(() => ({ open, close }), [open, close]);

  return (
    <ContactDialogContext.Provider value={value}>
      {children}
      <ContactDialog
        key={instance}
        open={isOpen}
        initialType={options.type}
        source={options.source}
        prefill={options.prefill}
        onClose={close}
      />
    </ContactDialogContext.Provider>
  );
}
