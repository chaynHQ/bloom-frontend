'use client';

import { Link as i18nLink, usePathname } from '@/i18n/routing';
import courseIcon from '@/public/course_icon_background.svg';
import { rowStyle } from '@/styles/common';
import { ArrowBack } from '@mui/icons-material';
import { Box, Button, Dialog, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const headerContainerStyles = {
  ...rowStyle,
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: 1.5,
} as const;

const LoginDialog = () => {
  const t = useTranslations('Shared');
  const tN = useTranslations('Navigation');
  const pathname = usePathname();
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanGoBack(window.history.length > 1);
  }, []);

  return (
    <Dialog open={true}>
      <Box
        style={{
          padding: 30,
          maxWidth: 500,
          display: 'flex',
          gap: 16,
          flexDirection: 'column',
        }}
      >
        <Box sx={headerContainerStyles}>
          <Image src={courseIcon} alt={tN('alt.courseIcon')} width={60} height={60} />
          <Typography variant="h3" mb={0}>
            {t('loginDialog.title')}
          </Typography>
        </Box>
        <Typography variant="body2">{t('loginDialog.description')}</Typography>
        <Box sx={rowStyle}>
          {/* Back Button - Closes dialog or navigates back */}
          {canGoBack && (
            <Button
              qa-id="dialogBackButton"
              color="secondary"
              variant="outlined"
              size="small"
              startIcon={<ArrowBack />}
              sx={{ px: 2 }}
              onClick={() => {
                router.back(); // Go back if possible
              }}
            >
              {t('loginDialog.backButton')}
            </Button>
          )}
          <Box>
            <Button
              qa-id="dialogLoginButton"
              color="secondary"
              variant="outlined"
              size="small"
              sx={{ mr: 1.5 }}
              href={`/auth/login?return_url=${encodeURIComponent(pathname)}`}
            >
              {t('loginDialog.loginButton')}
            </Button>
            <Button
              qa-id="dialogCreateAccountButton"
              color="secondary"
              variant="contained"
              size="small"
              component={i18nLink}
              href="/auth/register"
            >
              {t('loginDialog.registerButton')}
            </Button>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
};

export default LoginDialog;
