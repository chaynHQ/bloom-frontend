import { LoadingButton } from '@mui/lab';
import { Box, Button, Modal, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useDeleteUserMutation } from '../../app/api';
import { getAuth } from 'firebase/auth'

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: 'calc(100vw - 2rem)', sm: '90%' },
  maxWidth: '700px',
  maxHeight: '75vh',
  borderRadius: '20px',
  bgcolor: 'background.paper',
} as const;

const modalContentStyle = {
  maxWidth: 800,
  margin: 'auto',
  paddingX: { xs: 2, sm: 4 },
  paddingY: { xs: 4, sm: 6 },
} as const;

interface Props {
  open: boolean;
  onClose: () => void
}

const DeleteAccountModal = ({ open, onClose }: Props) => {
  const [deleteUser, { isLoading }] = useDeleteUserMutation()

  const onUserDelete = () => {
    const auth = getAuth()
    const currUser = auth.currentUser

    if (currUser === null) {
      return
    }

    deleteUser(currUser)
  }

  const t = useTranslations('Account.accountSettings');

  return (
    <Modal
      {...{ open, onClose }}
      aria-labelledby='modal-title'
      aria-describedby='modal-description'
    >
      <Box sx={modalStyle}>
        <Box sx={modalContentStyle}>
          <Typography id='modal-title' component='h2' variant='h2'>
            {t('actions.button.delAcc')} ?
          </Typography>
          <Typography id='modal-description' fontStyle='italic'>
            {t('actions.desc')}
          </Typography>
          <div style={{ display: 'inline-flex', width: '100%', flexWrap: 'wrap', marginTop: '20px', gap: 8 }}>
            <LoadingButton
              color='error'
              loading={isLoading}
              onClick={() => onUserDelete()}
              variant='outlined'
            >
              {t('actions.button.delAcc')}
            </LoadingButton>
            <Button
              color='secondary'
              variant='contained'
              onClick={onClose}
            >
              {t('actions.button.cancel')}
            </Button>
          </div>
        </Box>
      </Box>
    </Modal>
  );
};

export default DeleteAccountModal;
