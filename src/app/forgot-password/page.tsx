'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Mail, Lock, ArrowLeft, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

type Step = 'email' | 'user-info' | 'otp' | 'password' | 'success';

interface UserInfo {
  name: string;
  employeeId: string;
  email: string;
  role: string;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1: Check email and get user info
  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/password-reset/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Email not found');
      }

      setUserInfo(data.data);
      setStep('user-info');
    } catch (err: any) {
      setError(err.message || 'Failed to find account. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Send OTP
  const handleSendOTP = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/password-reset/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      setSuccess('OTP has been sent to your email address');
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (otp.length !== 4) {
      setError('Please enter a valid 4-digit OTP');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/password-reset/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid OTP');
      }

      setSuccess('OTP verified successfully');
      setStep('password');
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/password-reset/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          newPassword,
          confirmPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/password-reset/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }

      setSuccess('New OTP has been sent to your email');
      setOtp('');
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStepNumber = () => {
    switch (step) {
      case 'email': return 1;
      case 'user-info': return 2;
      case 'otp': return 3;
      case 'password': return 4;
      case 'success': return 5;
      default: return 1;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-between w-full">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Building2 className="h-8 w-8" />
              </div>
              <h1 className="text-2xl font-bold">Office Hub</h1>
            </div>
            
            <div className="space-y-6 mt-16">
              <h2 className="text-4xl font-bold leading-tight">
                Reset Your<br />Password Securely
              </h2>
              <p className="text-xl text-blue-100">
                Receive OTP via Email for quick and secure password recovery
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStepNumber() >= 1 ? 'bg-white text-blue-600' : 'bg-white/30'}`}>
                1
              </div>
              <span className={getStepNumber() >= 1 ? 'text-white' : 'text-blue-200'}>Enter Email</span>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStepNumber() >= 2 ? 'bg-white text-blue-600' : 'bg-white/30'}`}>
                2
              </div>
              <span className={getStepNumber() >= 2 ? 'text-white' : 'text-blue-200'}>Verify Identity</span>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStepNumber() >= 3 ? 'bg-white text-blue-600' : 'bg-white/30'}`}>
                3
              </div>
              <span className={getStepNumber() >= 3 ? 'text-white' : 'text-blue-200'}>Enter OTP</span>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStepNumber() >= 4 ? 'bg-white text-blue-600' : 'bg-white/30'}`}>
                4
              </div>
              <span className={getStepNumber() >= 4 ? 'text-white' : 'text-blue-200'}>New Password</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>

          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold">
                {step === 'email' && 'Forgot Password'}
                {step === 'user-info' && 'Verify Your Identity'}
                {step === 'otp' && 'Enter OTP'}
                {step === 'password' && 'Create New Password'}
                {step === 'success' && 'Password Reset Complete'}
              </CardTitle>
              <CardDescription>
                {step === 'email' && 'Enter your registered email address'}
                {step === 'user-info' && 'Confirm your account details'}
                {step === 'otp' && 'Enter the 4-digit OTP sent to your email'}
                {step === 'password' && 'Create a strong password for your account'}
                {step === 'success' && 'Your password has been updated successfully'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}
              {success && step !== 'success' && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                  {success}
                </div>
              )}

              {/* Step 1: Email Input */}
              {step === 'email' && (
                <form onSubmit={handleCheckEmail} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                        disabled={loading}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Enter the email you used to register your account
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      'Continue'
                    )}
                  </Button>
                </form>
              )}

              {/* Step 2: User Info Confirmation */}
              {step === 'user-info' && userInfo && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
                        {userInfo.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{userInfo.name}</h3>
                        <p className="text-sm text-gray-600">{userInfo.email}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-blue-200">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Employee ID</p>
                        <p className="font-semibold text-gray-900">{userInfo.employeeId}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Role</p>
                        <p className="font-semibold text-gray-900 capitalize">{userInfo.role === 'intern' ? 'Employee' : userInfo.role}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 text-center">
                    Is this your account? Click below to receive an OTP.
                  </p>

                  <Button 
                    onClick={handleSendOTP}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Send OTP to Email
                      </>
                    )}
                  </Button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setUserInfo(null);
                      setError('');
                    }}
                    className="w-full text-sm text-gray-600 hover:text-gray-900"
                  >
                    Not your account? Go back
                  </button>
                </div>
              )}

              {/* Step 3: OTP Verification */}
              {step === 'otp' && (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Enter 4-Digit OTP
                    </label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="0000"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        className="pl-10 text-center text-2xl tracking-[1em] font-mono"
                        maxLength={4}
                        required
                        disabled={loading}
                      />
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                      Check your email inbox for the OTP code
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    disabled={loading || otp.length !== 4}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify OTP'
                    )}
                  </Button>

                  <div className="text-center space-y-2">
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      disabled={loading}
                    >
                      Didn&apos;t receive OTP? Resend
                    </button>
                  </div>
                </form>
              )}

              {/* Step 4: New Password */}
              {step === 'password' && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-10"
                        required
                        disabled={loading}
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                        required
                        disabled={loading}
                        minLength={6}
                      />
                    </div>
                    {newPassword && confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-red-500">Passwords do not match</p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    disabled={loading || newPassword !== confirmPassword || newPassword.length < 6}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resetting Password...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </Button>
                </form>
              )}

              {/* Step 5: Success */}
              {step === 'success' && (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
                    <p className="text-gray-600">
                      Your password has been reset successfully. You can now login with your new password.
                    </p>
                  </div>

                  <Button 
                    onClick={() => router.push('/login')}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    Go to Login
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {step !== 'success' && (
            <p className="mt-6 text-center text-sm text-gray-600">
              Remember your password?{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
