import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetPassword } = useAuth();

  const email = location.state?.email || '';
  const code = location.state?.code || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (!email || !code) {
      navigate('/login');
    }
  }, [email, code, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!password.trim() || !confirmPassword.trim()) {
      setErrorMsg('Please fill in all password fields.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword({
        email,
        code,
        newPassword: password,
      });
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error('Reset password failed:', err);
      setErrorMsg(err.message || 'Failed to save new password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalConfirm = () => {
    setShowSuccessModal(false);
    navigate('/login');
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
          <span className="material-symbols-outlined text-primary text-5xl font-light">vpn_key</span>
          <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-md">FITSYNC PRO</h1>
          <p className="text-sm font-semibold text-white/70 drop-shadow-sm">Create Strong Athlete Password</p>
        </div>

        {/* Error Notification Alert */}
        {errorMsg && (
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-error/20 border border-error/40 text-error text-sm font-bold backdrop-blur-md">
            <span className="material-symbols-outlined text-[20px]">error</span>
            <p className="flex-1">{errorMsg}</p>
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
            <h2 className="text-xl font-bold tracking-tight text-white">New Password</h2>
            <p className="text-xs text-white/60">
              Set your new password for account: <br/>
              <span className="font-bold text-white">{email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* New Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-wider font-bold text-white/70 pl-1">New Password</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-white/40 text-[20px]">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-black/30 border border-white/10 rounded-xl py-3 pl-12 pr-12 w-full text-white text-sm outline-none focus:border-primary placeholder:text-white/20 transition-all focus:bg-black/40"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-white/40 hover:text-white flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-wider font-bold text-white/70 pl-1">Confirm New Password</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-white/40 text-[20px]">lock</span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-black/30 border border-white/10 rounded-xl py-3 pl-12 pr-12 w-full text-white text-sm outline-none focus:border-primary placeholder:text-white/20 transition-all focus:bg-black/40"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 text-white/40 hover:text-white flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showConfirmPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full mt-2 font-bold flex items-center justify-center gap-2"
            >
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
              {!isLoading && <span className="material-symbols-outlined text-[18px]">save</span>}
            </button>
          </form>
        </div>
      </div>

      {/* SUCCESS POPUP MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div 
            className="rounded-[28px] border border-outline-variant/20 p-8 w-full max-w-[380px] flex flex-col items-center text-center gap-5 shadow-[0_25px_60px_rgba(0,0,0,0.65)]"
            style={{ background: 'linear-gradient(145deg, #16202e, #091421)' }}
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary flex items-center justify-center shadow-lg shadow-primary/10">
              <span className="material-symbols-outlined text-primary text-4xl">check_circle</span>
            </div>
            
            <div>
              <h3 className="text-2xl font-black tracking-tight text-on-surface">Password Changed!</h3>
              <p className="text-sm text-on-surface-variant/60 leading-relaxed mt-2">
                Your password has been successfully updated. You can now use your new password to sign into your account.
              </p>
            </div>

            <button
              onClick={handleModalConfirm}
              className="btn-primary w-full mt-2 font-bold flex items-center justify-center gap-2"
            >
              Sign In Now
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResetPassword;
