import { BrowserRouter, Routes, Route } from 'react-router-dom';
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


function App() {
  return (
    <BrowserRouter>
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
          <Route path="/portfolio" element={<TrainerPortfolioEditor />} />
          <Route path="/chat" element={<Messages />} />
          <Route path="/clients" element={<ClientsList />} />
          <Route path="/clients/:id" element={<ClientDetails />} />
          <Route path="/trainee/:id" element={<TraineeProfile />} />
        </Routes>

      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
