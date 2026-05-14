import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@fitsync/database';

@Injectable()
export class TrainerProfileService {
  // Trainer: get their own public-facing coaching profile
  async getProfile(userId: string) {
    const profile = await prisma.trainerProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
    if (!profile) throw new NotFoundException('Trainer profile not found');
    return profile;
  }

  // Trainer: update certifications, specialties, bio, education
  async updateProfile(
    userId: string,
    payload: {
      bio?: string;
      education?: string;
      certifications?: string[];
      specialties?: string[];
      marketplaceActive?: boolean;
    },
  ) {
    const profile = await prisma.trainerProfile.findUnique({
      where: { userId },
    });
    if (!profile) throw new NotFoundException('Trainer profile not found');

    return prisma.trainerProfile.update({
      where: { userId },
      data: {
        bio: payload.bio,
        education: payload.education,
        certifications: payload.certifications,
        specialties: payload.specialties,
        marketplaceActive: payload.marketplaceActive,
      },
    });
  }

  // Admin/System: update trainer rating after a session review
  async updateRating(userId: string, newRating: number) {
    const profile = await prisma.trainerProfile.findUnique({
      where: { userId },
    });
    if (!profile) throw new NotFoundException('Trainer profile not found');

    const totalScore = profile.rating * profile.reviewCount + newRating;
    const newReviewCount = profile.reviewCount + 1;
    const averageRating = totalScore / newReviewCount;

    return prisma.trainerProfile.update({
      where: { userId },
      data: {
        rating: Math.round(averageRating * 10) / 10,
        reviewCount: newReviewCount,
      },
    });
  }

  // Public: list all active trainers available in the marketplace
  async listActiveTrainers(search?: string) {
    return prisma.trainerProfile.findMany({
      where: {
        marketplaceActive: true,
        OR: search
          ? [
              { user: { fullName: { contains: search, mode: 'insensitive' } } },
              { specialties: { hasSome: [search] } },
              { bio: { contains: search, mode: 'insensitive' } },
            ]
          : undefined,
      },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { rating: 'desc' },
    });
  }
}
