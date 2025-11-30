import { makeAutoObservable } from 'mobx';

type Severity = 'error' | 'warning' | 'info' | 'success'
class AlertStore {
  message: string = '';
  severity: Severity = 'info';
  isShowing = false;
  autoHideDuration = 6000;

  constructor() {
    makeAutoObservable(this);
  }

  showSnackbar(message: string, severity: Severity) {
    this.message = message;
    this.severity = severity;
    this.isShowing = true;
  }

  hideSnackbar() {
    this.isShowing = false;
    setTimeout(() => {
      this.message = '';
    }, 2000)
  }
}

// Export a singleton instance of the store
export const alertStore = new AlertStore();