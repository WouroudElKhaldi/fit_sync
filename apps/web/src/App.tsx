import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import WorkoutPlanner from './pages/WorkoutPlanner';
import AccountSettings from './pages/AccountSettings';
import TrainerProfile from './pages/TrainerProfile';
import TrainerPortfolioEditor from './pages/TrainerPortfolioEditor';
import Messages from './pages/Messages';
import ClientsList from './pages/ClientsList';
import ClientDetails from './pages/ClientDetails';
import WorkoutManagement from './pages/WorkoutManagement';
import WorkoutBuilder from './pages/WorkoutBuilder';
import ExerciseManagement from './pages/ExerciseManagement';
import EquipmentManagement from './pages/EquipmentManagement';
import SessionReview from './pages/SessionReview';
import TraineeProfile from './pages/TraineeProfile';
import SupportPage from './pages/SupportPage';

import Login from './pages/Login';
import SignUp from './pages/SignUp';
import EmailVerification from './pages/EmailVerification';
import ForgotPassword from './pages/ForgotPassword';
import VerifyResetCode from './pages/VerifyResetCode';
import ResetPassword from './pages/ResetPassword';

import { AuthProvider, useAuth } from './context/AuthContext';

function NavigationWrapper() {
  const { user, token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background gap-4">
        <span className="material-symbols-outlined text-primary text-5xl animate-spin font-light">progress_activity</span>
        <p className="text-sm font-semibold text-on-surface-variant/60">Restoring Athlete Session...</p>
      </div>
    );
  }

  // Session exists but account is unverified -> Force verification page access
  if (token && user && !user.isVerified) {
    return (
      <Routes>
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="*" element={<Navigate to="/verify-email" state={{ email: user.email }} replace />} />
      </Routes>
    );
  }

  // Guest/Unauthenticated users gate
  if (!token || !user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-reset-code" element={<VerifyResetCode />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Authenticated and fully verified user routes
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/planner" element={<WorkoutPlanner />} />
        <Route path="/workouts" element={<WorkoutManagement />} />
        <Route path="/workout-builder" element={<WorkoutBuilder />} />
        <Route path="/exercises" element={<ExerciseManagement />} />
        <Route path="/equipment" element={<EquipmentManagement />} />
        <Route path="/session-review" element={<SessionReview />} />
        <Route path="/settings" element={<AccountSettings />} />
        <Route path="/profile" element={<TrainerProfile />} />
        <Route path="/profile/:id" element={<TrainerProfile />} />
        <Route path="/portfolio" element={<TrainerPortfolioEditor />} />
        <Route path="/chat" element={<Messages />} />
        <Route path="/clients" element={<ClientsList />} />
        <Route path="/clients/:id" element={<ClientDetails />} />
        <Route path="/trainee/:id" element={<TraineeProfile />} />
        <Route path="/support" element={<SupportPage />} />
        {/* Fallback back to home dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NavigationWrapper />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
