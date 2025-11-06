'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '@/components/AuthForm';
import OTPVerification from '@/components/OTPVerification';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showOTP, setShowOTP] = useState(false);
  const [otpData, setOtpData] = useState<{ email: string; password: string; transactionId?: string } | null>(null);
  const router = useRouter();
  const { isAuthenticated, generateOtp, validateOtp } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push('/dashboard');
    return null;
  }

  const handleSuccess = () => {
    router.push('/dashboard');
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setShowOTP(false);
    setOtpData(null);
  };

  const handleShowOTP = (email: string, password: string) => {
    setOtpData({ email, password });
    // Generate OTP immediately
    handleGenerateOTP(email, password);
  };

  const handleGenerateOTP = async (email: string, password: string) => {
    try {
      const response = await generateOtp(email, password);
      setOtpData({ email, password, transactionId: response.transactionId });
      setShowOTP(true);
    } catch (error) {
      console.error('Failed to generate OTP:', error);
      // Handle error - maybe show a notification
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    if (!otpData || !otpData.transactionId) return;

    await validateOtp(otpData.email, otpData.transactionId, otp);

    // On success, redirect to dashboard
    handleSuccess();
  };

  const handleResendOTP = async () => {
    if (!otpData) return;
    // Regenerate OTP
    await handleGenerateOTP(otpData.email, otpData.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {showOTP && otpData && otpData.transactionId ? (
        <OTPVerification
          email={otpData.email}
          transactionId={otpData.transactionId}
          onVerify={handleVerifyOTP}
          onResend={handleResendOTP}
        />
      ) : (
        <AuthForm
          mode={mode}
          onToggleMode={toggleMode}
          onSuccess={handleSuccess}
          onShowOTP={handleShowOTP}
        />
      )}
    </div>
  );
}