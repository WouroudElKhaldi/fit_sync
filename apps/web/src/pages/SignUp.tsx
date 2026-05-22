import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const role = 'TRAINER';

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !username.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        fullName: fullName.trim(),
        username: username.toLowerCase().trim(),
        email: email.toLowerCase().trim(),
        password,
        role,
      });
      // Registration successful -> verify email
      navigate('/verify-email', { state: { email: email.toLowerCase().trim() } });
    } catch (err: any) {
      console.error('Registration error:', err);
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center relative overflow-hidden px-4 py-12"
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
          <span className="material-symbols-outlined text-primary text-5xl font-light">fitness_center</span>
          <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-md">FITSYNC PRO</h1>
          <p className="text-sm font-semibold text-white/70 drop-shadow-sm">Create Coach Profile</p>
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
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold tracking-tight text-white">Create Account</h2>
            <p className="text-xs text-white/60">
              Note: This portal is for Trainers. Athletes must sign up via the mobile app.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-wider font-bold text-white/70 pl-1">Full Name</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-white/40 text-[20px]">badge</span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="bg-black/30 border border-white/10 rounded-xl py-3 pl-12 pr-4 w-full text-white text-sm outline-none focus:border-primary placeholder:text-white/20 transition-all focus:bg-black/40"
                  required
                />
              </div>
            </div>

            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-wider font-bold text-white/70 pl-1">Username</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-white/40 text-[20px]">person</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. janedoe"
                  className="bg-black/30 border border-white/10 rounded-xl py-3 pl-12 pr-4 w-full text-white text-sm outline-none focus:border-primary placeholder:text-white/20 transition-all focus:bg-black/40"
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-wider font-bold text-white/70 pl-1">Email Address</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-white/40 text-[20px]">mail</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="athlete@fitsync.pro"
                  className="bg-black/30 border border-white/10 rounded-xl py-3 pl-12 pr-4 w-full text-white text-sm outline-none focus:border-primary placeholder:text-white/20 transition-all focus:bg-black/40"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-wider font-bold text-white/70 pl-1">Password</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-white/40 text-[20px]">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••• (min 8 chars)"
                  className="bg-black/30 border border-white/10 rounded-xl py-3 pl-12 pr-12 w-full text-white text-sm outline-none focus:border-primary placeholder:text-white/20 transition-all focus:bg-black/40"
                  required
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full mt-2 font-bold flex items-center justify-center gap-2"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
              {!isLoading && <span className="material-symbols-outlined text-[18px]">check</span>}
            </button>
          </form>
        </div>

        {/* Toggle View */}
        <div className="text-center text-sm font-semibold text-white/60">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary hover:brightness-110">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
