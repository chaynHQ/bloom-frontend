import { Typography, CardContent, Card, Button } from "@mui/material"
import { LoadingButton } from "@mui/lab";
import { useTranslations } from "next-intl"

const formCardStyle = {
  width: { xs: '100%', sm: '70%', md: '45%' },
  alignSelf: 'flex-start',
} as const;

const AccountActions = () => {
  const t = useTranslations('Account.accountSettings');
  return (
    <Card sx={formCardStyle} >
      <CardContent>
        <Typography variant="h2" component="h2">
          {t('actions.title')}
        </Typography>
        <Typography fontSize="1rem !important">
          {t('actions.desc')}
        </Typography>
        <div style={{ display: "inline-flex", width: "100%", flexWrap: "wrap" }}>
          <LoadingButton
            sx={{ mt: 2, mr: 1.5, }}
            variant="contained"
            fullWidth
            color="secondary"
            type="submit"
          >
            {t('actions.button.resetPass')}
          </LoadingButton>
          <Button variant='outlined' color='error'
            fullWidth
            sx={{ mt: 2, mr: 1.5, }}
          >
            Delete Account
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default AccountActions
