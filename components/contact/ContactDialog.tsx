'use client';

import { usePathname } from '@/i18n/routing';
import { CONTACT_DIALOG_OPENED, CONTACT_FORM_SWITCHED } from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import { ContactFormType, ContactFormValues, ContactPayloadContext } from '@/lib/utils/contactForm';
import logEvent from '@/lib/utils/logEvent';
import { Box, Dialog } from '@mui/material';
import { useLocale } from 'next-intl';
import { useEffect, useId, useMemo, useState } from 'react';
import ContactFormBody from './ContactFormBody';

// Bottom sheet on mobile, centred dialog on desktop (as ResourceFeedbackDialog).
// `background.default` is lighter than the default pink paper.
const dialogPaperStyle = {
  m: 0,
  width: '100%',
  maxWidth: { xs: '100%', sm: 600 },
  backgroundColor: 'background.default',
  borderRadius: { xs: '16px 16px 0 0', sm: '20px' },
  position: { xs: 'fixed', sm: 'static' },
  bottom: { xs: 0, sm: 'auto' },
} as const;

const dialogStyle = {
  '& .MuiDialog-container': { alignItems: { xs: 'flex-end', sm: 'center' } },
} as const;

const bodyStyle = {
  display: 'flex',
  flexDirection: 'column',
  p: { xs: 3, sm: 4.5 },
  maxHeight: { xs: '88vh', sm: '82vh' },
  overflowY: 'auto',
} as const;

interface ContactDialogProps {
  open: boolean;
  initialType: ContactFormType;
  source: string;
  prefill?: Partial<ContactFormValues>;
  onClose: () => void;
}

export default function ContactDialog({
  open,
  initialType,
  source,
  prefill,
  onClose,
}: ContactDialogProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const titleId = useId();

  const userId = useTypedSelector((state) => state.user.id);
  const userEmail = useTypedSelector((state) => state.user.email);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);

  const [type, setType] = useState<ContactFormType>(initialType);
  const [currentSource, setCurrentSource] = useState(source);

  useEffect(() => {
    logEvent(CONTACT_DIALOG_OPENED, { type: initialType, source });
    // The provider keys a fresh mount per open, so this fires once per open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ctx: ContactPayloadContext = useMemo(
    () => ({
      pagePath: pathname,
      pageUrl:
        typeof window === 'undefined'
          ? ''
          : window.location.origin + window.location.pathname + window.location.search,
      locale,
      signedIn: !!userId,
      userId: userId ?? '',
      partner: partnerAdmin?.partner?.name ?? partnerAccesses?.[0]?.partner?.name ?? '',
      appVersion: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? 'local',
      source: currentSource,
    }),
    [pathname, locale, userId, partnerAccesses, partnerAdmin, currentSource],
  );

  const handleSwitch = (next: ContactFormType) => {
    logEvent(CONTACT_FORM_SWITCHED, { from: type, to: next });
    setCurrentSource('switch');
    setType(next);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby={titleId}
      slotProps={{ paper: { sx: dialogPaperStyle } }}
      sx={dialogStyle}
    >
      <Box sx={bodyStyle}>
        <ContactFormBody
          type={type}
          titleId={titleId}
          initialEmail={userEmail ?? ''}
          prefill={prefill}
          ctx={ctx}
          onSwitch={handleSwitch}
          onClose={onClose}
        />
      </Box>
    </Dialog>
  );
}
