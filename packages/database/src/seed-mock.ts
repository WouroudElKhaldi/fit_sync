import { prisma } from './index';

async function seedMockData() {
  console.log('--- STARTING FITSYNC MOCK DATA SEEDER ---');

  // 1. Fetch any existing trainers
  const trainers = await prisma.user.findMany({
    where: { role: 'TRAINER' }
  });

  if (trainers.length === 0) {
    console.log('No trainers found in the database. Please sign up a trainer first in the web UI!');
    return;
  }

  // 2. Fetch some existing exercises and equipment to construct realistic workouts
  const exercises = await prisma.exercise.findMany({ take: 10 });
  if (exercises.length === 0) {
    console.log('No exercises found. Please run the base seeder or ensure master_exercises.json has been seeded.');
    return;
  }

  const now = new Date();

  for (const trainer of trainers) {
    console.log(`Seeding mock clients & workouts for Trainer: ${trainer.fullName} (${trainer.email})`);

    // 3. Create mock clients if not already existing
    const mockClientData = [
      {
        email: `sarah.fit.${trainer.email.replace('@', '_')}@example.com`,
        username: `sarah_fit_${trainer.username}`,
        fullName: `Sarah Jenkins (${trainer.fullName.split(' ')[0]})`,
        bio: 'Goal: Rebuild postpartum core strength and cardiovascular capacity.',
        weightUnit: 'KG' as const,
        lengthUnit: 'CM' as const
      },
      {
        email: `david.athlete.${trainer.email.replace('@', '_')}@example.com`,
        username: `david_athlete_${trainer.username}`,
        fullName: `David Miller (${trainer.fullName.split(' ')[0]})`,
        bio: 'Goal: Powerlifting hypertrophy, specializing in low-bar squats.',
        weightUnit: 'KG' as const,
        lengthUnit: 'CM' as const
      },
      {
        email: `emma.wellness.${trainer.email.replace('@', '_')}@example.com`,
        username: `emma_wellness_${trainer.username}`,
        fullName: `Emma Watson (${trainer.fullName.split(' ')[0]})`,
        bio: 'Goal: Improving flexibility, joint mobility, and lean mass.',
        weightUnit: 'KG' as const,
        lengthUnit: 'CM' as const
      }
    ];

    const clients = [];
    for (const cData of mockClientData) {
      let clientUser = await prisma.user.findUnique({
        where: { email: cData.email }
      });

      if (!clientUser) {
        clientUser = await prisma.user.create({
          data: {
            email: cData.email,
            username: cData.username,
            fullName: cData.fullName,
            passwordHash: '$2b$10$wouroudMockHashForTesting1234567890',
            role: 'USER',
            isVerified: true,
            bio: cData.bio,
            weightUnit: cData.weightUnit,
            lengthUnit: cData.lengthUnit,
            trainerId: trainer.id
          }
        });
        console.log(`Created mock client: ${clientUser.fullName}`);
      } else {
        // Ensure trainer relationship is correct
        clientUser = await prisma.user.update({
          where: { id: clientUser.id },
          data: { trainerId: trainer.id }
        });
        console.log(`Verified client relationship for: ${clientUser.fullName}`);
      }
      clients.push(clientUser);
    }

    // 4. Create Biometric Logs for each client (historical timeline)
    for (const client of clients) {
      const logCount = await prisma.biometricLog.count({ where: { userId: client.id } });
      if (logCount === 0) {
        console.log(`Creating biometric timeline for ${client.fullName}...`);
        const baseWeight = client.email.includes('sarah') ? 64.0 : client.email.includes('david') ? 85.0 : 58.0;
        
        // Seed 6 biometric logs over the past 3 months
        for (let i = 5; i >= 0; i--) {
          const loggedDate = new Date(now.getTime() - i * 15 * 24 * 60 * 60 * 1000);
          const variance = Math.sin(i) * 0.8 - (5 - i) * 0.4;
          await prisma.biometricLog.create({
            data: {
              userId: client.id,
              weight: baseWeight + variance,
              height: 170.0,
              loggedAt: loggedDate
            }
          });
        }
      }
    }

    // 5. Create Workout Plans & Sessions
    for (const client of clients) {
      const plansCount = await prisma.workoutPlan.count({ where: { clientId: client.id } });
      if (plansCount === 0) {
        console.log(`Seeding workout history and future pipeline for ${client.fullName}...`);

        // Workout 1: Completed, Reviewed (Historical)
        const pastPlan1 = await prisma.workoutPlan.create({
          data: {
            title: 'Full Body Conditioning A',
            description: 'High-intensity conditioning to kickstart metabolic load.',
            scheduledDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            createdById: trainer.id,
            clientId: client.id,
          }
        });
        
        for (let i = 0; i < Math.min(3, exercises.length); i++) {
          const we = await prisma.workoutExercise.create({
            data: {
              workoutPlanId: pastPlan1.id,
              exerciseId: exercises[i].id,
              orderIndex: i,
              restTimeSec: 60,
              notes: 'Execute with perfect eccentric control.'
            }
          });
          for (let s = 0; s < 3; s++) {
            await prisma.workoutSet.create({
              data: {
                workoutExerciseId: we.id,
                setIndex: s,
                expectedReps: 10,
                expectedWeight: 40 + i * 10,
              }
            });
          }
        }

        const session1 = await prisma.workoutSession.create({
          data: {
            workoutPlanId: pastPlan1.id,
            startedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 - 3600 * 1000),
            completedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
            totalVolume: 1200.0,
            clientNotes: 'Felt strong, but shoulders were fatigued by the final set.',
            trainerFeedback: 'Excellent form on the primary movements. Keep pushing the tempo.',
            trainerRating: 5
          }
        });

        const pastSets1 = await prisma.workoutSet.findMany({
          where: { workoutExercise: { workoutPlanId: pastPlan1.id } }
        });
        for (const set of pastSets1) {
          await prisma.workoutSet.update({
            where: { id: set.id },
            data: {
              actualReps: set.expectedReps,
              actualWeight: set.expectedWeight,
              status: 'COMPLETED',
              workoutSessionId: session1.id
            }
          });
        }

        // Workout 2: Completed, NEEDS REVIEW
        const pastPlan2 = await prisma.workoutPlan.create({
          data: {
            title: 'Power Hypertrophy Push',
            description: 'Focusing on chest volume and explosive push velocity.',
            scheduledDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            createdById: trainer.id,
            clientId: client.id,
          }
        });

        for (let i = 1; i < Math.min(4, exercises.length); i++) {
          const we = await prisma.workoutExercise.create({
            data: {
              workoutPlanId: pastPlan2.id,
              exerciseId: exercises[i].id,
              orderIndex: i - 1,
              restTimeSec: 90,
              notes: 'Max effort push phase.'
            }
          });
          for (let s = 0; s < 3; s++) {
            await prisma.workoutSet.create({
              data: {
                workoutExerciseId: we.id,
                setIndex: s,
                expectedReps: 8,
                expectedWeight: 50 + i * 5,
              }
            });
          }
        }

        const session2 = await prisma.workoutSession.create({
          data: {
            workoutPlanId: pastPlan2.id,
            startedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 - 3600 * 1000),
            completedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
            totalVolume: 1850.0,
            clientNotes: 'Struggled a bit with the final set of the chest press. Had to drop the weight slightly.',
            trainerFeedback: null,
            trainerRating: null
          }
        });

        const pastSets2 = await prisma.workoutSet.findMany({
          where: { workoutExercise: { workoutPlanId: pastPlan2.id } }
        });
        for (const set of pastSets2) {
          await prisma.workoutSet.update({
            where: { id: set.id },
            data: {
              actualReps: set.expectedReps,
              actualWeight: set.expectedWeight,
              status: 'COMPLETED',
              workoutSessionId: session2.id
            }
          });
        }

        // Workout 3: Scheduled
        const futurePlan = await prisma.workoutPlan.create({
          data: {
            title: 'Core Stability & Mobility 2.0',
            description: 'Joint recovery and pelvic floor alignment work.',
            scheduledDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
            createdById: trainer.id,
            clientId: client.id,
          }
        });

        for (let i = 0; i < Math.min(2, exercises.length); i++) {
          const we = await prisma.workoutExercise.create({
            data: {
              workoutPlanId: futurePlan.id,
              exerciseId: exercises[i].id,
              orderIndex: i,
              restTimeSec: 45,
              notes: 'Focus on nasal breathing.'
            }
          });
          for (let s = 0; s < 2; s++) {
            await prisma.workoutSet.create({
              data: {
                workoutExerciseId: we.id,
                setIndex: s,
                expectedReps: 15,
                expectedWeight: 0,
              }
            });
          }
        }
      }
    }
  }

  console.log('🎉 FITSYNC MOCK DATA SEEDED SUCCESSFULY!');
}

seedMockData()
  .catch((err) => {
    console.error('Error seeding mock data:', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
