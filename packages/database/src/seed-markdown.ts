import { prisma } from './index';
import * as fs from 'fs';
import * as path from 'path';

async function seedFromMarkdown() {
  console.log('--- STARTING MARKDOWN PARSER AND SEEDER ---');

  // Paths to markdown files
  const musclesPath = path.join(__dirname, '../muscles.md');
  const equipementsPath = path.join(__dirname, '../equipements.md');
  const exercicesPath = path.join(__dirname, '../exercices.md');

  // Helper to read and split into lines
  const getLines = (filePath: string) => {
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      return [];
    }
    return fs.readFileSync(filePath, 'utf-8')
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);
  };

  // 1. Seed Muscles
  console.log('Parsing muscles.md...');
  const muscleLines = getLines(musclesPath);
  let activeMuscleCategory = 'Other';
  const seededMuscles: { id: string; name: string; category: string }[] = [];

  for (const line of muscleLines) {
    // Check if category header
    const catMatch = line.match(/^(\d+)\.\s+([^(]+)/);
    if (catMatch) {
      activeMuscleCategory = catMatch[2].trim();
      // Simplify category name
      if (activeMuscleCategory.includes('Chest')) activeMuscleCategory = 'Chest';
      else if (activeMuscleCategory.includes('Back')) activeMuscleCategory = 'Back';
      else if (activeMuscleCategory.includes('Shoulders')) activeMuscleCategory = 'Shoulders';
      else if (activeMuscleCategory.includes('Arms')) activeMuscleCategory = 'Arms';
      else if (activeMuscleCategory.includes('Legs')) activeMuscleCategory = 'Legs';
      else if (activeMuscleCategory.includes('Core')) activeMuscleCategory = 'Core';
      continue;
    }

    // Check if it is a muscle item (has description after colon)
    if (line.includes(':')) {
      const parts = line.split(':');
      const name = parts[0].trim();
      const desc = parts.slice(1).join(':').trim();

      // Skip lines that are general section descriptions
      if (name.match(/^\d+$/) || name.toLowerCase().includes('group') || name.toLowerCase().includes('musculature')) {
        continue;
      }

      console.log(`Upserting Muscle: ${name} (${activeMuscleCategory})`);
      const muscleObj = await prisma.muscle.upsert({
        where: { name },
        update: { category: activeMuscleCategory },
        create: { name, category: activeMuscleCategory }
      });
      seededMuscles.push(muscleObj);
    }
  }

  // 2. Seed Equipment
  console.log('Parsing equipements.md...');
  const equipLines = getLines(equipementsPath);
  const seededEquipment: { id: string; name: string }[] = [];

  for (const line of equipLines) {
    // Skip category headers (e.g. "1. Free Weights & Functional Iron") or description lines
    if (line.match(/^\d+\./) || line.startsWith('The ') || line.startsWith('Essential ') || line.startsWith('Targeted ') || line.startsWith('Mechanical ') || line.startsWith('Equipment ')) {
      continue;
    }
    // Skip subheaders
    if (line.endsWith('Group') || line.endsWith('Group)') || line.includes('Shoulders & Arms') || line.includes('Lower Body')) {
      continue;
    }

    // Extract name (part before parentheses)
    let name = line;
    if (line.includes('(')) {
      name = line.split('(')[0].trim();
    }

    if (name.length < 3) continue;

    console.log(`Upserting Equipment: ${name}`);
    const eqObj = await prisma.equipment.upsert({
      where: { name },
      update: {},
      create: { name }
    });
    seededEquipment.push(eqObj);
  }

  // 3. Seed Exercises
  console.log('Parsing exercices.md...');
  const exerciseLines = getLines(exercicesPath);
  let activeExerciseCategory = 'Other';

  for (const line of exerciseLines) {
    // Check if category header
    const catMatch = line.match(/^(\d+)\.\s+([^(]+)/);
    if (catMatch) {
      activeExerciseCategory = catMatch[2].trim();
      if (activeExerciseCategory.includes('Chest')) activeExerciseCategory = 'Chest';
      else if (activeExerciseCategory.includes('Back')) activeExerciseCategory = 'Back';
      else if (activeExerciseCategory.includes('Shoulders')) activeExerciseCategory = 'Shoulders';
      else if (activeExerciseCategory.includes('Legs')) activeExerciseCategory = 'Legs';
      else if (activeExerciseCategory.includes('Arms')) activeExerciseCategory = 'Arms';
      else if (activeExerciseCategory.includes('Core')) activeExerciseCategory = 'Core';
      else if (activeExerciseCategory.includes('Cardio')) activeExerciseCategory = 'Cardio';
      continue;
    }

    // Skip section details / subheaders (like "Horizontal Pressing")
    if (line.includes('Exercises ') || line.includes('compound ') || line.includes('isolation ') || line.includes('separating ') || line.includes('split ') || line.includes('flexion ') || line.includes('Dynamic ') || line.toLowerCase().endsWith('pressing') || line.toLowerCase().endsWith('pulling') || line.toLowerCase().endsWith('isolation') || line.toLowerCase().endsWith('flexion') || line.toLowerCase().endsWith('extension') || line.toLowerCase().endsWith('conditioning') || line.toLowerCase().includes('group')) {
      continue;
    }

    // Item check
    let exerciseName = line;
    if (line.includes('(')) {
      exerciseName = line.split('(')[0].trim();
    }

    if (exerciseName.length < 3) continue;

    // Determine equipment assignment based on keywords in name
    let matchedEquipmentId: string | null = null;
    const lowerName = exerciseName.toLowerCase();
    
    for (const eq of seededEquipment) {
      const eqLower = eq.name.toLowerCase();
      // Exact or partial matching
      if (lowerName.includes(eqLower) || (eqLower === 'barbell' && lowerName.includes('barbell')) || (eqLower === 'dumbbell' && lowerName.includes('dumbbell')) || (eqLower === 'kettlebell' && lowerName.includes('kettlebell')) || (eqLower === 'ez-curl bar' && lowerName.includes('ez-bar')) || (eqLower === 'cable crossover tower' && lowerName.includes('cable'))) {
        matchedEquipmentId = eq.id;
        break;
      }
    }

    // Default matching for general items
    if (!matchedEquipmentId) {
      if (lowerName.includes('barbell')) {
        const eq = seededEquipment.find(e => e.name.toLowerCase().includes('barbell'));
        if (eq) matchedEquipmentId = eq.id;
      } else if (lowerName.includes('dumbbell')) {
        const eq = seededEquipment.find(e => e.name.toLowerCase().includes('dumbbell'));
        if (eq) matchedEquipmentId = eq.id;
      } else if (lowerName.includes('cable')) {
        const eq = seededEquipment.find(e => e.name.toLowerCase().includes('cable') || e.name.toLowerCase().includes('trainer'));
        if (eq) matchedEquipmentId = eq.id;
      } else if (lowerName.includes('kettlebell')) {
        const eq = seededEquipment.find(e => e.name.toLowerCase().includes('kettlebell'));
        if (eq) matchedEquipmentId = eq.id;
      } else if (lowerName.includes('machine') || lowerName.includes('press machine') || lowerName.includes('pulldown') || lowerName.includes('pec deck')) {
        const eq = seededEquipment.find(e => e.name.toLowerCase().includes('machine') || e.name.toLowerCase().includes('press'));
        if (eq) matchedEquipmentId = eq.id;
      }
    }

    console.log(`Upserting Exercise: ${exerciseName} (Equipment matched: ${matchedEquipmentId ? 'YES' : 'NONE'})`);
    const exerciseObj = await prisma.exercise.upsert({
      where: { name: exerciseName },
      update: {
        description: `Targeting ${activeExerciseCategory} muscle group.`,
        equipmentId: matchedEquipmentId
      },
      create: {
        name: exerciseName,
        description: `Targeting ${activeExerciseCategory} muscle group.`,
        steps: ['Perform with proper form.', 'Ensure full range of motion.'],
        equipmentId: matchedEquipmentId
      }
    });

    // Match muscles belonging to this exercise category as PRIMARY targets
    const categoryMuscles = seededMuscles.filter(m => m.category.toLowerCase() === activeExerciseCategory.toLowerCase());
    for (const m of categoryMuscles) {
      // Connect
      await prisma.exerciseMuscle.upsert({
        where: {
          exerciseId_muscleId: {
            exerciseId: exerciseObj.id,
            muscleId: m.id
          }
        },
        update: {
          targetType: 'PRIMARY'
        },
        create: {
          exerciseId: exerciseObj.id,
          muscleId: m.id,
          targetType: 'PRIMARY'
        }
      });
    }
  }

  console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
}

seedFromMarkdown()
  .catch((err) => {
    console.error('Error seeding from markdown:', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
