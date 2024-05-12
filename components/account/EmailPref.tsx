import { useCallback } from 'react';
import { Typography, CardContent, Card, Box } from '@mui/material'
import { Checkbox, FormControl, FormControlLabel, } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useTranslations } from 'next-intl'
import { useUpdateUserMutation } from '../../app/api';
import { useTypedSelector } from '../../hooks/store';

const formCardStyle = {
  width: { xs: '100%', sm: '70%', md: '45%' },
  marginTop: { xs: '1.5rem', sm: '5rem', md: '6rem' },
  alignSelf: 'flex-start',
} as const;

const EmailPref = () => {
  const [updateUser, { isLoading }] = useUpdateUserMutation()
  const t = useTranslations('Account.accountSettings.emailPref');

  const cPerms = useTypedSelector(state => state.user.contactPermission)
  const sPerms = useTypedSelector(state => state.user.serviceEmailsPermission)

  const onSubmit = useCallback(async (ev: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(ev.currentTarget)
    ev.preventDefault()

    const contactPermission = formData.get('cPerms') === 'on'
    const serviceEmailsPermission = formData.get('sPerms') === 'on'
    const payload = {
      contactPermission, serviceEmailsPermission
    }
    updateUser(payload)
  }, [updateUser])

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
          <Box >
            <FormControl sx={{ marginY: 3, display: 'flex', flexDirection: 'column', gap: 2, }} >
              <FormControlLabel
                label={t('checkbox.emailOnChange')}
                control={
                  <Checkbox
                    name='cPerms'
                    aria-label={t('checkbox.emailOnChange')}
                    defaultChecked={cPerms}
                  // checked={contactPerms}
                  // onClick={() => setContactPerms(curr => !curr)}
                  />
                }
              />
              <FormControlLabel
                label={t('checkbox.emailOnCourse')}
                control={
                  <Checkbox
                    name='sPerms'
                    aria-label={t('checkbox.emailOnCourse')}
                    defaultChecked={sPerms}
                  // checked={emailPerms}
                  // onChange={() => setEmailPerms(curr => !curr)}
                  />
                }
              />
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
