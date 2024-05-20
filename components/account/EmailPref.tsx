import { useCallback, useState } from 'react';
import { Typography, Container, CardContent, Card, Box } from '@mui/material'
import { Checkbox, FormControl, FormControlLabel, } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useTranslations } from 'next-intl'
import { useUpdateUserMutation } from '../../app/api';
import { useTypedSelector } from '../../hooks/store';
import { ErrorDisplay } from '../../constants/common';

const formCardStyle = {
  width: { xs: '100%', sm: '70%', md: '45%' },
  alignSelf: 'flex-start',
} as const;

const EmailPref = () => {
  const [updateUser, { isLoading }] = useUpdateUserMutation()
  const [error, setError] = useState<ErrorDisplay>();

  const t = useTranslations('Account.accountSettings.emailPref');
  const tA = useTranslations('Account.accountSettings');

  const contactPermission = useTypedSelector(state => state.user.contactPermission)
  const servicePermission = useTypedSelector(state => state.user.serviceEmailsPermission)

  const onSubmit = useCallback(async (ev: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(ev.currentTarget)
    ev.preventDefault()

    const contactPermission = formData.get('contactPermission') === 'on'
    const serviceEmailsPermission = formData.get('servicePermission') === 'on'
    const payload = {
      contactPermission, serviceEmailsPermission
    }

    try {
      await updateUser(payload);
    } catch (error) {
      setError(tA.rich('updateError'));
    }
  }, [updateUser, tA])

  return (
    <Card sx={formCardStyle}>
      <CardContent>
        <form onSubmit={onSubmit}>
          <Typography variant='h2' component='h2'>
            {t('title')}
          </Typography>
          <Typography fontSize='1rem !important'>
            {t('desc')}
          </Typography>
          <Box>
            <FormControl sx={{ marginY: 3, display: 'flex', flexDirection: 'column', gap: 2, }} >
              <FormControlLabel
                label={t('checkbox.emailOnChange')}
                control={
                  <Checkbox
                    name='contactPermission'
                    aria-label={t('checkbox.emailOnChange')}
                    defaultChecked={contactPermission}
                  />
                }
              />
              <FormControlLabel
                label={t('checkbox.emailOnCourse')}
                control={
                  <Checkbox
                    name='servicePermission'
                    aria-label={t('checkbox.emailOnCourse')}
                    defaultChecked={servicePermission}
                  />
                }
              />
              {error && (
                <Typography color="error.main" mb={'1rem !important'}>
                  {error}
                </Typography>
              )}
            </FormControl>
          </Box>
          <LoadingButton
            sx={{ mt: 2, mr: 1.5, }}
            variant='contained'
            fullWidth
            loading={isLoading}
            color='secondary'
            type='submit'
          >
            {t('button.savePref')}
          </LoadingButton>
        </form>
      </CardContent>
    </Card >
  )
}

export default EmailPref
