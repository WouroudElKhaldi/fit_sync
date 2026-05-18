import userProfile from './mock_user_profile.json';
import exerciseLibrary from './mock_exercise_library.json';
import workoutSchedule from './mock_workout_schedule.json';

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  /**
   * Fetches the current user's profile information, including their trainer details.
   */
  getUserProfile: async () => {
    await delay(500); // Simulate network latency
    return userProfile;
  },

  /**
   * Fetches the available exercise library, including equipment and muscles.
   */
  getExerciseLibrary: async () => {
    await delay(500);
    return exerciseLibrary;
  },

  /**
   * Fetches the workout schedule for the user, including exercises and sets.
   */
  getWorkoutSchedule: async () => {
    await delay(500);
    return workoutSchedule;
  },
  
  /**
   * Logs a completed set.
   * In a real app this would PUT/POST to the server.
   */
  logSetCompletion: async (setId: string, actualReps: number, actualWeight: number) => {
    await delay(300);
    console.log(`[API MOCK] Logged set ${setId} with ${actualReps} reps @ ${actualWeight}kg`);
    return { success: true, setId, actualReps, actualWeight, status: 'COMPLETED' };
  }
};
