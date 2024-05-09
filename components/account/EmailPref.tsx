import { Typography, CardContent, Card, Box } from "@mui/material"
import { Checkbox, FormControl, FormControlLabel, } from '@mui/material';
import { LoadingButton } from "@mui/lab";
import { useTranslations } from "next-intl"

const formCardStyle = {
  width: { xs: '100%', sm: '70%', md: '45%' },
  marginTop: { xs: "1.5rem", sm: "5rem", md: "6rem" },
  alignSelf: 'flex-start',
} as const;

const EmailPref = () => {
  const t = useTranslations('Account.accountSettings.emailPref');
  return (
    <Card sx={formCardStyle}>
      <CardContent>
        <Typography variant="h2" component="h2">
          {t('title')}
        </Typography>
        <Typography fontSize="1rem !important">
          {t('desc')}
        </Typography>
        <Box >
          <FormControl sx={{ marginY: 3, display: "flex", flexDirection: "column", gap: 2, }} >
            <FormControlLabel
              label={t('checkbox.emailOnChange')}
              control={
                <Checkbox
                  aria-label={t('contactPermissionLabel')}
                // onChange={(e) => setContactPermissionInput(e.target.value === 'true')}
                />
              }
            />
            <FormControlLabel
              label={t('checkbox.emailOnCourse')}
              control={
                <Checkbox
                  aria-label={t('contactPermissionLabel')}
                // onChange={(e) => setContactPermissionInput(e.target.value === 'true')}
                />
              }
            />
          </FormControl>
        </Box>
        <LoadingButton
          sx={{ mt: 2, mr: 1.5, }}
          variant="contained"
          fullWidth
          color="secondary"
          type="submit"
        >
          {t('button.savePref')}
        </LoadingButton>
      </CardContent>
    </Card >
  )
}

export default EmailPref
