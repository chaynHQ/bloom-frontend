import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import { useTranslations } from 'next-intl';
import * as React from 'react';

export default function ConfirmEmailUpdateModal({
  isOpen,
  onConfirm,
}: {
  isOpen: boolean;
  onConfirm: (confirmed: boolean) => void;
}) {
  const t = useTranslations('Account.accountSettings.profileSettings');
  const handleClose = (confirmAction: boolean) => () => {
    onConfirm(confirmAction);
  };

  return (
    <React.Fragment>
      <Dialog
        open={isOpen}
        onClose={handleClose(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{t('confirmDialogueTitle')}</DialogTitle>
        <DialogActions>
          <Button onClick={handleClose(false)}>{t('confirmDialogueCancel')}</Button>
          <Button id="confirm-profile-settings-submit" onClick={handleClose(true)} autoFocus>
            {t('submitLabel')}
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
