import { Link as i18nLink, usePathname } from '@/i18n/routing';
import courseIcon from '@/public/course_icon_background.svg';
import { Box, Button, Dialog, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

const LoginDialog = () => {
  const t = useTranslations('Shared');
  const tN = useTranslations('Navigation');

  const pathname = usePathname();

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
        <Box display="flex" flexDirection="row" justifyContent="flex-start" gap={1}>
          <Image src={courseIcon} alt={tN('alt.courseIcon')} width={30} height={30} />
          <Typography variant="h3" mb={0}>
            {t('loginDialog.title')}
          </Typography>
        </Box>
        <Typography variant="body2">{t('loginDialog.description')}</Typography>
        <Box
          gap={1}
          display="flex"
          flexDirection="row"
          justifyContent={['flex-start', 'flex-end']}
          flexWrap="wrap"
        >
          <Button
            qa-id="dialogLoginButton"
            color="secondary"
            variant="outlined"
            size="small"
            component={i18nLink}
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
    </Dialog>
  );
};

export default LoginDialog;
