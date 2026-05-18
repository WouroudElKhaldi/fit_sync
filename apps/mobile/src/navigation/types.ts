export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  EmailVerification: { email: string };
  ForgotPassword: undefined;
  VerifyResetCode: { email: string };
  ResetPassword: { email: string; code: string };
  RoleSelection: undefined;
  MainTabs: undefined;
  WorkoutLogger: { planId: string };
  WorkoutBuilder: { defaultDate?: string; addedExerciseNames?: string[] } | undefined;
  ExerciseSelector: undefined;
  PostWorkoutSummary: undefined;
  ActiveChat: undefined;
  Settings: undefined;
  TrainerProfile: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Log: undefined;
  Analytics: undefined;
  Market: undefined;
  Chat: undefined;
};
