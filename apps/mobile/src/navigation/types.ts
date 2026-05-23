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
  WorkoutBuilder: { defaultDate?: string; addedExercises?: { id: string; name: string }[]; planId?: string } | undefined;
  WorkoutDetails: { planId: string };
  ExerciseSelector: undefined;
  PostWorkoutSummary: { sessionId?: string };
  ActiveChat: { conversationId?: string; isGroup?: boolean; title?: string };
  Settings: undefined;
  Notifications: undefined;
  TrainerProfile: { trainerId?: string };
};

export type MainTabParamList = {
  Home: undefined;
  Log: undefined;
  Analytics: undefined;
  Market: undefined;
  Chat: undefined;
};
