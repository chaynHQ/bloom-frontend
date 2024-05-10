import { Typography, CardContent, Card, Button } from "@mui/material"
import Link from "../common/Link";
import { useTranslations } from "next-intl"
import DeleteAccountModal from "./DeleteAccountModal";
import { useState } from "react";

const formCardStyle = {
  width: { xs: '100%', sm: '70%', md: '45%' },
  alignSelf: 'flex-start',
} as const;

const AccountActions = () => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const onDeleteModalClose = () => setIsDeleteModalOpen(false)
  const onDeleteModalOpen = () => setIsDeleteModalOpen(true)
  const t = useTranslations('Account.accountSettings');
  return (
    <>
      <Card sx={formCardStyle} >
        <CardContent>
          <Typography variant="h2" component="h2">
            {t('actions.title')}
          </Typography>
          <Typography fontSize="1rem !important">
            {t('actions.desc')}
          </Typography>
          <div style={{ display: "inline-flex", width: "100%", flexWrap: "wrap" }}>
            <Button
              sx={{ mt: 2, mr: 1.5, }}
              component={Link}
              href='/auth/reset-password'
              variant="contained"
              fullWidth
              color="secondary"
            >
              {t('actions.button.resetPass')}
            </Button>
            <Button variant='outlined' color='error' fullWidth onClick={onDeleteModalOpen} sx={{ mt: 2, mr: 1.5, }} >
              {t('actions.button.delAcc')}
            </Button>
          </div>
        </CardContent>
      </Card>
      <DeleteAccountModal open={isDeleteModalOpen} onClose={onDeleteModalClose} />
    </>
  )
}

export default AccountActions
