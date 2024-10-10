'use client';

import { Alert, Snackbar } from '@mui/material';
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    (window as any).Rollbar?.error(error);
  }

  render() {
    return (
      <>
        {this.state.hasError && (
          <Snackbar
            open={this.state.hasError}
            autoHideDuration={6000}
            onClose={() => this.setState({ hasError: false })}
          >
            <Alert
              onClose={() => this.setState({ hasError: false })}
              severity="error"
              sx={{ width: '100%', border: '0.125rem solid #EA0050' }}
            >
              Error occurred - please try again or get in touch
            </Alert>
          </Snackbar>
        )}
        {this.props.children}
      </>
    );
  }
}

export default ErrorBoundary;
