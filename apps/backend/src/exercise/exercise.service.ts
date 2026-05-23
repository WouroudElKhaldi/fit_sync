import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@fitsync/database';

@Injectable()
export class ExerciseService {
  async findAllExercises(search?: string, page = 1, limit = 20, muscleCategory?: string) {
    const skip = (page - 1) * limit;

    const conditions: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    if (search) {
      conditions.push(`e.name ILIKE $${paramCount}`);
      params.push(`%${search}%`);
      paramCount++;
    }

    if (muscleCategory && muscleCategory !== 'All') {
      conditions.push(`e.id IN (
        SELECT em_sub."exerciseId"
        FROM "ExerciseMuscle" em_sub
        JOIN "Muscle" m_sub ON em_sub."muscleId" = m_sub.id
        WHERE m_sub.category ILIKE $${paramCount}
      )`);
      params.push(`%${muscleCategory}%`);
      paramCount++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 1. Get total count using a single query
    const countQuery = `
      SELECT COUNT(*)::int as count 
      FROM "Exercise" e
      ${whereClause}
    `;
    const countResult = await prisma.$queryRawUnsafe<{ count: number }[]>(countQuery, ...params);
    const total = countResult[0]?.count || 0;

    // 2. Get paginated items with joined details using CTE pagination + LEFT JOIN
    const dataQuery = `
      WITH paginated_exercises AS (
        SELECT e.id, e.name, e.description, e.steps, e."equipmentId"
        FROM "Exercise" e
        ${whereClause}
        ORDER BY e.name ASC
        LIMIT $${paramCount} OFFSET $${paramCount + 1}
      )
      SELECT 
        pe.id, pe.name, pe.description, pe.steps, pe."equipmentId",
        eq.id as eq_id, eq.name as eq_name,
        em."muscleId", em."targetType",
        m.id as m_id, m.name as m_name, m.category as m_category
      FROM paginated_exercises pe
      LEFT JOIN "Equipment" eq ON eq.id = pe."equipmentId"
      LEFT JOIN "ExerciseMuscle" em ON em."exerciseId" = pe.id
      LEFT JOIN "Muscle" m ON m.id = em."muscleId"
      ORDER BY pe.name ASC;
    `;

    const rows = await prisma.$queryRawUnsafe<any[]>(
      dataQuery,
      ...params,
      limit,
      skip,
    );

    // Group the flat results into the nested models expected by the client
    const exerciseMap = new Map<string, any>();

    for (const row of rows) {
      if (!exerciseMap.has(row.id)) {
        exerciseMap.set(row.id, {
          id: row.id,
          name: row.name,
          description: row.description,
          steps: row.steps || [],
          equipmentId: row.equipmentId,
          equipment: row.eq_id
            ? {
                id: row.eq_id,
                name: row.eq_name,
              }
            : null,
          muscles: [],
        });
      }

      if (row.muscleId) {
        const musclesArr = exerciseMap.get(row.id).muscles;
        const exists = musclesArr.some((m: { muscleId: any; }) => m.muscleId === row.muscleId);
        if (!exists) {
          musclesArr.push({
            exerciseId: row.id,
            muscleId: row.muscleId,
            targetType: row.targetType,
            muscle: {
              id: row.m_id,
              name: row.m_name,
              category: row.m_category,
            },
          });
        }
      }
    }

    const items = Array.from(exerciseMap.values());

    return {
      data: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAllMuscles() {
    return prisma.muscle.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  async findAllEquipment() {
    return prisma.equipment.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findExercisesByMuscle(muscleId: string) {
    const muscle = await prisma.muscle.findUnique({
      where: { id: muscleId },
    });

    if (!muscle) {
      throw new NotFoundException('Muscle group not found');
    }

    // Query exercise associations targeting this specific muscle ID
    const mappings = await prisma.exerciseMuscle.findMany({
      where: { muscleId },
      include: {
        exercise: {
          include: {
            equipment: true,
            muscles: {
              include: { muscle: true },
            },
          },
        },
      },
    });

    return mappings.map((m) => ({
      targetType: m.targetType,
      exercise: m.exercise,
    }));
  }

  async findExerciseById(exerciseId: string) {
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
      include: {
        equipment: true,
        muscles: {
          include: { muscle: true },
        },
      },
    });

    if (!exercise) {
      throw new NotFoundException('Exercise movement not found');
    }

    return exercise;
  }
}
