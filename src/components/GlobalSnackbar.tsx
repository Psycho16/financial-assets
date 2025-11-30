import Snackbar, { type SnackbarCloseReason } from '@mui/material/Snackbar';
import { observer } from 'mobx-react-lite';
import { alertStore } from '../stores/AlertStore';
import Alert from '@mui/material/Alert';

const GlobalSnackbar = observer(() => {
  const handleClose = (_: Event | React.SyntheticEvent<Element, Event>, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') {
      return;
    }
    alertStore.hideSnackbar();
  };

  return (
    <Snackbar
      open={alertStore.isShowing}
      autoHideDuration={alertStore.autoHideDuration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert onClose={handleClose} severity={alertStore.severity} sx={{ width: '100%' }}>
        {alertStore.message}
      </Alert>
    </Snackbar>
  );
});

export default GlobalSnackbar;