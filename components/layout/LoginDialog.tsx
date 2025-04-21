import { Link as i18nLink, usePathname } from '@/i18n/routing';
import courseIcon from '@/public/course_icon_background.svg';
import { Box, Button, Dialog, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react'; // Import useState

const LoginDialog = () => {
  const t = useTranslations('Shared');
  const tN = useTranslations('Navigation');
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(true); // Control dialog state

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <Box
        style={{
          padding: 30,
          maxWidth: 500,
          display: 'flex',
          gap: 16,
          flexDirection: 'column',
        }}
      >
        {/* Back Button - Closes dialog or navigates back */}
        <Button
          onClick={() => {
            if (window.history.length > 1) {
              router.back(); // Go back if possible
            } else {
              setOpen(false); // Otherwise, just close modal
            }
          }}
          size="small"
          variant="text"
          color="primary"
          style={{ alignSelf: 'flex-start' }}
        >
          ←
        </Button>

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