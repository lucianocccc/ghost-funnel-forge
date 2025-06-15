
import React from 'react';
import { usePasswordReset } from '@/hooks/usePasswordReset';
import ResetPasswordSuccess from './components/ResetPasswordSuccess';
import ResetPasswordError from './components/ResetPasswordError';
import ResetPasswordLoading from './components/ResetPasswordLoading';
import ResetPasswordForm from './components/ResetPasswordForm';

interface ResetPasswordFormProps {
  onBackToLogin: () => void;
}

const ResetPasswordFormContainer: React.FC<ResetPasswordFormProps> = ({ onBackToLogin }) => {
  const {
    loading,
    success,
    sessionReady,
    verificationError,
    handleResetPassword
  } = usePasswordReset();

  if (success) {
    return <ResetPasswordSuccess onBackToLogin={onBackToLogin} />;
  }

  if (verificationError) {
    return <ResetPasswordError error={verificationError} onBackToLogin={onBackToLogin} />;
  }

  if (!sessionReady) {
    return <ResetPasswordLoading />;
  }

  return (
    <ResetPasswordForm
      onSubmit={handleResetPassword}
      onBackToLogin={onBackToLogin}
      loading={loading}
    />
  );
};

export default ResetPasswordFormContainer;
