'use client';

import { useState, useRef, KeyboardEvent, ClipboardEvent } from 'react';
import { Mail, ArrowRight } from 'lucide-react';

interface OTPVerificationProps {
  email: string;
  transactionId: string;
  onVerify: (otp: string) => Promise<void>;
  onResend?: () => Promise<void>;
  isLoading?: boolean;
}

export default function OTPVerification({
  email,
  transactionId,
  onVerify,
  onResend,
  isLoading = false,
}: OTPVerificationProps) {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState<string>('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);

    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, index) => {
      if (index < 6) {
        newOtp[index] = char;
      }
    });
    setOtp(newOtp);
    setError('');

    // Focus the last filled input or first empty one
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async () => {
    const otpValue = otp.join('');

    if (otpValue.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    try {
      await onVerify(otpValue);
    } catch (err) {
      setError('Invalid OTP. Please try again.');
    }
  };

  const handleResend = async () => {
    if (onResend) {
      setOtp(['', '', '', '', '', '']);
      setError('');
      try {
        await onResend();
      } catch (err) {
        setError('Failed to resend OTP. Please try again.');
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/10 backdrop-blur-md shadow-2xl rounded-xl p-8 border border-white/20">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Verify Your Email</h1>
          <p className="text-gray-300">
            We sent a 6-digit code to
          </p>
          <p className="text-blue-400 font-medium mt-1">{email}</p>
        </div>

        <div className="space-y-6">
          {/* OTP Input */}
          <div>
            <label className="block text-sm font-medium text-white mb-3 text-center">
              Enter verification code
            </label>
            <div className="flex gap-2 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={isLoading}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-white/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  autoFocus={index === 0}
                />
              ))}
            </div>
            {error && (
              <div className="mt-3 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-100 text-sm text-center font-medium">{error}</p>
              </div>
            )}
          </div>

          {/* Verify Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading || otp.some((digit) => !digit)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Verifying...
              </>
            ) : (
              <>
                Verify Email
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {/* Resend OTP */}
          {onResend && (
            <div className="text-center">
              <p className="text-gray-300 text-sm">
                Didn't receive the code?{' '}
                <button
                  onClick={handleResend}
                  disabled={isLoading}
                  className="text-blue-400 hover:text-blue-300 font-medium disabled:opacity-50"
                >
                  Resend OTP
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
