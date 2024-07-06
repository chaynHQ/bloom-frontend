import { DialogContent, DialogContentText } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import * as React from 'react';

export default function ConfirmDialog({
  isOpen,
  onConfirm,
  title,
  text,
  submitLabel,
  cancelLabel,
}: {
  isOpen: boolean;
  onConfirm: (confirmed: boolean) => void;
  title: string;
  text?: string;
  submitLabel: string;
  cancelLabel: string;
}) {
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
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        {text && (
          <DialogContent>
            <DialogContentText>{text}</DialogContentText>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={handleClose(false)}>{cancelLabel}</Button>
          <Button id="confirm-dialog-submit" onClick={handleClose(true)} autoFocus>
            {submitLabel}
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
