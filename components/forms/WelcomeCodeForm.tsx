import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useGetAutomaticAccessCodeFeatureForPartnerQuery } from '../../app/api';
import { RootState } from '../../app/store';
import { generatePartnerPromoGetStartedEvent } from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import logEvent, { getEventUserData } from '../../utils/logEvent';

const containerStyle = {
  marginY: 3,
} as const;

interface WelcomeCodeFormProps {
  codeParam: string;
  partnerParam: string;
}

const WelcomeCodeForm = (props: WelcomeCodeFormProps) => {
  const { codeParam, partnerParam } = props;
  const t = useTranslations('Welcome');
  const { user, partnerAccesses, partnerAdmin, partners } = useTypedSelector(
    (state: RootState) => state,
  );
  const eventUserData = getEventUserData({ user, partnerAccesses, partnerAdmin });
  useGetAutomaticAccessCodeFeatureForPartnerQuery(partnerParam);
  const [accessCodeRequired, setAccessCodeRequired] = useState<boolean>(true);

  const [codeInput, setCodeInput] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    setCodeInput(codeParam);
  }, [codeParam]);

  useEffect(() => {
    const partner = partners.find((p) => p.name.toLowerCase() === partnerParam.toLowerCase());
    if (partner) {
      const hasAutomaticAccessFeature = partner.partnerFeature.reduce(
        (hasFeature, pf) =>
          hasFeature || (pf.feature.name === 'AUTOMATIC_ACCESS_CODE' && pf.active),
        false,
      );
      setAccessCodeRequired(!hasAutomaticAccessFeature);
    }
  }, [partners, partnerParam]);

  const submitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push({
      pathname: '/auth/register',
      ...(partnerParam && {
        query: { partner: partnerParam.toLocaleLowerCase(), ...(codeInput && { code: codeInput }) },
      }),
    });
  };

  return (
    <Box sx={containerStyle}>
      <form autoComplete="off" onSubmit={submitHandler}>
        <TextField
          id="accessCode"
          value={codeInput}
          onChange={(e) => setCodeInput(e.target.value)}
          label={t.rich('form.codeLabel', { partnerName: partnerParam })}
          variant="standard"
          fullWidth
        />
        <Button
          onClick={() => {
            logEvent(generatePartnerPromoGetStartedEvent(partnerParam), eventUserData);
          }}
          sx={{ mt: 2 }}
          variant="contained"
          fullWidth
          color="secondary"
          type="submit"
        >
          {t('getStarted')}
        </Button>
      </form>
    </Box>
  );
};

export default WelcomeCodeForm;
