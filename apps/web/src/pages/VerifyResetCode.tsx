import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const VerifyResetCode: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { forgotPassword } = useAuth();

  const email = location.state?.email || '';

  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (code.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit security code.');
      return;
    }

    // Forward straight to Reset Password page with code
    navigate('/reset-password', { state: { email, code: code.trim() } });
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      await forgotPassword(email);
      setSuccessMsg('A new reset code has been sent to your email.');
      setCountdown(30);
    } catch (err: any) {
      console.error('Failed to resend code:', err);
      setErrorMsg(err.message || 'Failed to resend reset code. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center relative overflow-hidden px-4"
      style={{ backgroundImage: 'url("/assets/login_background.png")' }}
    >
      {/* Premium Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-0 pointer-events-none" />

      {/* Aesthetic Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-tertiary/5 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="w-full max-w-[450px] z-10 flex flex-col gap-6">
        {/* Header Branding */}
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="material-symbols-outlined text-primary text-5xl font-light">verified_user</span>
          <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-md">FITSYNC PRO</h1>
          <p className="text-sm font-semibold text-white/70 drop-shadow-sm">Verify Security Reset Code</p>
        </div>

        {/* Error Notification Alert */}
        {errorMsg && (
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-error/20 border border-error/40 text-error text-sm font-bold backdrop-blur-md">
            <span className="material-symbols-outlined text-[20px]">error</span>
            <p className="flex-1">{errorMsg}</p>
          </div>
        )}

        {/* Success Notification Alert */}
        {successMsg && (
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-primary/20 border border-primary/30 text-primary text-sm font-bold backdrop-blur-md">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <p className="flex-1">{successMsg}</p>
          </div>
        )}

        {/* Glass Container */}
        <div 
          className="flex flex-col gap-6 p-8 border border-white/10 rounded-[32px]"
          style={{ 
            pointerEvents: 'auto',
            background: 'linear-gradient(135deg, rgba(18, 28, 42, 0.45), rgba(9, 20, 33, 0.65))',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
          }}
        >
          <div className="flex flex-col gap-1 text-center">
            <h2 className="text-xl font-bold tracking-tight text-white">Enter Reset Code</h2>
            <p className="text-xs text-white/60 px-4">
              We sent a 6-digit security code to: <br/>
              <span className="font-bold text-white">{email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Reset Code Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-wider font-bold text-white/70 pl-1 text-center">6-Digit Security Code</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-white/40 text-[20px]">security</span>
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="123456"
                  className="bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-center font-bold tracking-[6px] text-lg w-full text-white outline-none focus:border-primary placeholder:text-white/20 transition-all focus:bg-black/40"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full font-bold flex items-center justify-center gap-2"
            >
              Verify Code
              <span className="material-symbols-outlined text-[18px]">check</span>
            </button>
          </form>

          {/* Resend Code Section */}
          <div className="flex justify-center items-center gap-1.5 text-xs text-white/50 font-bold">
            Didn't receive the code?
            <button
              type="button"
              onClick={handleResend}
              disabled={countdown > 0 || isLoading}
              className={`font-black uppercase tracking-wider ${
                countdown > 0 ? 'text-white/30 cursor-not-allowed' : 'text-primary hover:brightness-110'
              }`}
            >
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
            </button>
          </div>
        </div>

        {/* Change Email link */}
        <div className="text-center">
          <button
            onClick={() => navigate('/forgot-password')}
            className="text-xs font-bold text-primary hover:brightness-110 flex items-center justify-center gap-1.5 mx-auto"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Change Request Email
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyResetCode;
