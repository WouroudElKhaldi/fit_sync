import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { prisma } from '@fitsync/database';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  async onModuleInit() {
    this.logger.log('Checking database seed state...');
    try {
      const muscleCount = await prisma.muscle.count();
      if (muscleCount > 0) {
        this.logger.log('Database already seeded. Skipping initial seed.');
        return;
      }

      this.logger.log('Starting deterministic database seeding...');

      // 1. Locate master_exercises.json from various runtime context working directories
      const possiblePaths = [
        path.join(process.cwd(), 'master_exercises.json'),
        path.join(process.cwd(), '../../master_exercises.json'),
      ];

      let seedPath: string | null = null;
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          seedPath = p;
          break;
        }
      }

      if (!seedPath) {
        this.logger.warn(
          'master_exercises.json not found. Please ensure it exists at the project root.',
        );
        return;
      }

      const rawData = fs.readFileSync(seedPath, 'utf-8');
      const data = JSON.parse(rawData);

      // 2. Insert Muscles
      this.logger.log(`Seeding ${data.muscles.length} muscles...`);
      for (const m of data.muscles) {
        await prisma.muscle.upsert({
          where: { name: m.name },
          update: {},
          create: {
            name: m.name,
            category: m.category,
          },
        });
      }

      // 3. Insert Equipment
      this.logger.log(`Seeding ${data.equipment.length} equipment items...`);
      const equipmentMap = new Map<string, string>();
      for (const eqName of data.equipment) {
        const created = await prisma.equipment.upsert({
          where: { name: eqName },
          update: {},
          create: { name: eqName },
        });
        equipmentMap.set(eqName, created.id);
      }

      // 4. Insert Exercises
      this.logger.log(`Seeding ${data.exercises.length} exercises...`);
      for (const ex of data.exercises) {
        const equipmentId = ex.equipment
          ? equipmentMap.get(ex.equipment)
          : undefined;

        // Upsert Exercise
        const exercise = await prisma.exercise.upsert({
          where: { name: ex.name },
          update: {
            description: ex.description,
            steps: ex.steps,
            equipmentId: equipmentId,
          },
          create: {
            name: ex.name,
            description: ex.description,
            steps: ex.steps,
            equipmentId: equipmentId,
          },
        });

        // Insert ExerciseMuscle relational mapping
        for (const mMapping of ex.muscles) {
          const muscleObj = await prisma.muscle.findUnique({
            where: { name: mMapping.name },
          });

          if (muscleObj) {
            await prisma.exerciseMuscle.upsert({
              where: {
                exerciseId_muscleId: {
                  exerciseId: exercise.id,
                  muscleId: muscleObj.id,
                },
              },
              update: {
                targetType: mMapping.type,
              },
              create: {
                exerciseId: exercise.id,
                muscleId: muscleObj.id,
                targetType: mMapping.type,
              },
            });
          }
        }
      }

      this.logger.log('🎉 Database seeding completed successfully!');
    } catch (error) {
      this.logger.error('Failed to seed database:', error);
    }
  }
}
