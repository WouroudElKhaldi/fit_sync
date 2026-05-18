import userProfile from './mock_user_profile.json';
import exerciseLibrary from './mock_exercise_library.json';
import workoutSchedule from './mock_workout_schedule.json';

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let schedulesInMemory = [...workoutSchedule];

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
    return schedulesInMemory;
  },

  /**
   * Adds a newly planned workout to the schedule list.
   */
  addWorkoutPlan: async (plan: any) => {
    await delay(300);
    schedulesInMemory.push(plan);
    return { success: true, plan };
  },
  
  /**
   * Logs a completed set.
   * In a real app this would PUT/POST to the server.
   */
  logSetCompletion: async (setId: string, actualReps: number, actualWeight: number) => {
    await delay(300);
    console.log(`[API MOCK] Logged set ${setId} with ${actualReps} reps @ ${actualWeight}kg`);
    
    // Update local set completion status
    schedulesInMemory.forEach(plan => {
      if (plan.exercises) {
        plan.exercises.forEach(ex => {
          if (ex.sets) {
            ex.sets.forEach(set => {
              if (set.id === setId) {
                set.actualReps = actualReps;
                set.actualWeight = actualWeight;
                set.status = 'COMPLETED';
              }
            });
          }
        });
      }
    });

    return { success: true, setId, actualReps, actualWeight, status: 'COMPLETED' };
  }
};
