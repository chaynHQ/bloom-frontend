'use client';

import { Link as i18nLink } from '@/i18n/routing';
import { CONTACT_SUPPORT_SIGNPOST_CLICKED } from '@/lib/constants/events';
import { ContactFormType } from '@/lib/utils/contactForm';
import { getImageSizes } from '@/lib/utils/imageSizes';
import logEvent from '@/lib/utils/logEvent';
import illustrationPerson4Peach from '@/public/illustration_person4_peach.svg';
import CloseRounded from '@mui/icons-material/CloseRounded';
import {
  Box,
  Button,
  Checkbox,
  Collapse,
  FormControlLabel,
  IconButton,
  Link,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useId, useState } from 'react';

const headerStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 1,
} as const;

const headerRuleStyle = {
  ...headerStyle,
  pb: 1.25,
  mb: 2.5,
  borderBottom: '1px solid',
  borderColor: 'cardBorder',
} as const;

export const DialogHeader = ({
  titleId,
  title,
  onClose,
}: {
  titleId: string;
  title?: string;
  onClose: () => void;
}) => {
  const t = useTranslations('Contact.shared');
  return (
    <Box sx={title ? headerRuleStyle : headerStyle}>
      {title ? (
        <Typography
          id={titleId}
          variant="h3"
          component="h2"
          // The theme gives any <h2> in a Dialog a paper background; undo it here.
          sx={{ mt: 0.25, mb: 0, '&&': { backgroundColor: 'transparent' } }}
        >
          {title}
        </Typography>
      ) : (
        <Box sx={{ flex: 1 }} />
      )}
      <IconButton aria-label={t('close')} onClick={onClose} edge="end" sx={{ mt: -0.5, mr: -1 }}>
        <CloseRounded />
      </IconButton>
    </Box>
  );
};

const optionalTagStyle = { color: 'grey.600', fontWeight: 400, ml: 1 } as const;

export const OptionalTag = () => {
  const t = useTranslations('Contact.shared');
  return (
    <Typography component="span" variant="caption" sx={optionalTagStyle}>
      {t('optionalTag')}
    </Typography>
  );
};

// Positioned off-screen rather than display:none — some bots skip hidden fields
// but still fill positioned ones.
const honeypotStyle = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
} as const;

export const HoneypotField = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => {
  const t = useTranslations('Contact.shared');
  return (
    <Box sx={honeypotStyle} aria-hidden>
      <label htmlFor="contact-company">{t('honeypotLabel')}</label>
      <input
        id="contact-company"
        name="company"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-label={t('honeypotLabel')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </Box>
  );
};

const deviceConsentStyle = {
  mt: 1,
  mb: 1.5,
  p: 1.5,
  borderRadius: '12px',
  border: '1px solid',
  borderColor: 'inputBorder',
  backgroundColor: 'cardSurface',
} as const;

const consentControlStyle = {
  alignItems: 'flex-start',
  m: 0,
  '& .MuiCheckbox-root': { pt: 0, pl: 0 },
} as const;

const consentDetailStyle = { display: 'block', color: 'grey.700', mt: 0.5 } as const;

export const DeviceDataConsent = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => {
  const t = useTranslations('Contact.shared.deviceConsent');
  const [showDetails, setShowDetails] = useState(false);
  const detailsId = useId();

  return (
    <Box sx={deviceConsentStyle} qa-id="contact-device-consent">
      <FormControlLabel
        sx={consentControlStyle}
        control={
          <Checkbox checked={checked} onChange={(e) => onChange(e.target.checked)} size="small" />
        }
        label={<Typography variant="body2">{t('label')}</Typography>}
      />
      <Box sx={{ pl: 3.5 }}>
        <Link
          component="button"
          type="button"
          variant="caption"
          aria-expanded={showDetails}
          aria-controls={detailsId}
          onClick={() => setShowDetails((v) => !v)}
        >
          {showDetails ? t('hide') : t('show')}
        </Link>
        <Collapse in={showDetails} unmountOnExit>
          <Typography id={detailsId} variant="caption" sx={consentDetailStyle}>
            {t('items')} {t('note')}
          </Typography>
        </Collapse>
      </Box>
    </Box>
  );
};

const signpostStyle = {
  mb: 2.5,
  p: 2,
  borderRadius: '12px',
  border: '1px solid',
  borderColor: 'secondary.main',
  backgroundColor: 'secondary.light',
} as const;

const signpostLinksStyle = { display: 'flex', flexWrap: 'wrap', gap: 2 } as const;

export const SupportSignpost = () => {
  const t = useTranslations('Contact.shared.supportSignpost');
  return (
    <Box sx={signpostStyle}>
      <Typography component="div" variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
        {t('heading')}
      </Typography>
      <Typography component="div" variant="body2" sx={{ mb: 1.5 }}>
        {t('body')}
      </Typography>
      <Box sx={signpostLinksStyle}>
        <Link
          component={i18nLink}
          href="/messaging"
          variant="body2"
          sx={{ fontWeight: 600 }}
          onClick={() => logEvent(CONTACT_SUPPORT_SIGNPOST_CLICKED, { target: 'messaging' })}
        >
          {t('messagingLink')}
        </Link>
        <Link
          href="https://www.chayn.co/help"
          target="_blank"
          rel="noopener noreferrer"
          variant="body2"
          sx={{ fontWeight: 600 }}
          onClick={() => logEvent(CONTACT_SUPPORT_SIGNPOST_CLICKED, { target: 'urgent' })}
        >
          {t('urgentLink')}
        </Link>
      </Box>
    </Box>
  );
};

const switchPromptStyle = {
  mt: 3,
  pt: 2.5,
  borderTop: '1px solid',
  borderColor: 'cardBorder',
} as const;

const switchButtonsStyle = { display: 'flex', flexWrap: 'wrap', gap: 1 } as const;

const switchButtonStyle = {
  borderColor: 'secondary.main',
  color: 'text.primary',
  px: 2,
  py: 0.5,
  fontSize: '0.875rem',
  '&:hover': { borderColor: 'secondary.dark', backgroundColor: 'secondary.light' },
} as const;

const SWITCH_TARGETS: Record<ContactFormType, ContactFormType[]> = {
  bug: ['feedback', 'contact'],
  feedback: ['bug', 'contact'],
  contact: ['bug', 'feedback'],
};

export const SwitchPrompt = ({
  current,
  onSwitch,
}: {
  current: ContactFormType;
  onSwitch: (type: ContactFormType) => void;
}) => {
  const t = useTranslations('Contact');
  return (
    <Box sx={switchPromptStyle}>
      <Typography component="div" variant="body2" sx={{ color: 'grey.700', mb: 1.25 }}>
        {t('shared.switchHeading')}
      </Typography>
      <Box sx={switchButtonsStyle}>
        {SWITCH_TARGETS[current].map((target) => (
          <Button
            key={target}
            qa-id={`contact-switch-${target}`}
            variant="outlined"
            size="small"
            onClick={() => onSwitch(target)}
            sx={switchButtonStyle}
          >
            {t(`${target}.triggerLabel`)}
          </Button>
        ))}
      </Box>
    </Box>
  );
};

const successStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  gap: 1,
  py: 1,
} as const;

const successImageStyle = { position: 'relative', width: 160, height: 160, my: 1 } as const;

export const ContactSuccess = ({
  formType,
  email,
  onClose,
}: {
  formType: ContactFormType;
  email: string;
  onClose: () => void;
}) => {
  const t = useTranslations('Contact.shared.success');
  const tShared = useTranslations('Contact.shared');
  const tImg = useTranslations('Shared');

  const body = email
    ? t('bodyWithEmail', { email })
    : formType === 'bug'
      ? t('bugBody')
      : t('body');

  return (
    <Box sx={successStyle} qa-id="contact-success">
      <Box sx={successImageStyle}>
        <Image
          alt={tImg('alt.personTea')}
          src={illustrationPerson4Peach}
          fill
          sizes={getImageSizes(successImageStyle.width)}
          style={{ objectFit: 'contain' }}
        />
      </Box>
      <Typography variant="h3" component="p" sx={{ mb: 0 }}>
        {t('title')}
      </Typography>
      <Typography component="div" sx={{ maxWidth: 380 }}>
        {body}
      </Typography>
      <Button variant="contained" color="secondary" onClick={onClose} sx={{ mt: 2 }}>
        {tShared('doneButton')}
      </Button>
    </Box>
  );
};
