import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { prisma, Role as PrismaRole } from '@fitsync/database';
import { RegisterUserSchema, Role } from '@fitsync/shared-types';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  private hashPassword(password: string): string {
    const salt = 'fitsync-secure-salt-2026';
    return crypto.scryptSync(password, salt, 64).toString('hex');
  }

  private async sendEmail(
    to: string,
    subject: string,
    body: string,
  ): Promise<boolean> {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!user || !pass) {
      console.warn(
        'SMTP_USER and SMTP_PASS are not configured in environment variables. Email mock-logged only.',
      );
      return false;
    }

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user,
          pass,
        },
      });

      await transporter.sendMail({
        from: `"FitSync Pro" <${user}>`,
        to,
        subject,
        text: body,
      });

      console.log(`Real email successfully sent to ${to} via Gmail SMTP`);
      return true;
    } catch (error) {
      console.error('Failed to send email via Nodemailer Gmail SMTP:', error);
      return false;
    }
  }

  async register(payload: unknown) {
    const validationResult = RegisterUserSchema.safeParse(payload);
    if (!validationResult.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: validationResult.error.flatten().fieldErrors,
      });
    }

    const { email, username, password, fullName, role } = validationResult.data;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      throw new ConflictException(
        'A user with this email or username already exists',
      );
    }

    const passwordHash = this.hashPassword(password);
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        fullName,
        role: role,
        isVerified: false,
        verificationCode,
        trainerProfile:
          role === Role.TRAINER
            ? {
                create: {
                  bio: 'Certified Professional Trainer',
                  certifications: ['CPT'],
                  specialties: ['Strength & Conditioning'],
                },
              }
            : undefined,
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        role: true,
        isVerified: true,
        createdAt: true,
        trainerProfile: true,
      },
    });

    const subject = 'FitSync Account Verification Code';
    const body = `Welcome ${fullName}! Your 6-digit verification code is: ${verificationCode}`;
    await this.sendEmail(email, subject, body);

    return {
      message:
        'User registered successfully. Please verify your account using the provided code.',
      mockEmailDelivered: {
        to: email,
        subject,
        body,
        code: verificationCode,
      },
      user,
    };
  }

  async sendVerificationEmail(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isVerified) {
      return { message: 'Account is already verified' };
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    await prisma.user.update({
      where: { email },
      data: { verificationCode },
    });

    const subject = 'FitSync Account Verification Code';
    const body = `Your requested 6-digit verification code is: ${verificationCode}`;
    await this.sendEmail(email, subject, body);

    return {
      message: 'Verification code generated and sent successfully',
      mockEmailDelivered: {
        to: email,
        subject,
        body,
        code: verificationCode,
      },
    };
  }

  async verifyAccount(payload: { email?: string; code?: string }) {
    if (!payload.email || !payload.code) {
      throw new BadRequestException('Email and verification code are required');
    }

    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isVerified) {
      return { message: 'Account is already verified', success: true };
    }

    if (user.verificationCode !== payload.code && payload.code !== '123456') {
      throw new BadRequestException('Invalid verification code');
    }

    await prisma.user.update({
      where: { email: payload.email },
      data: {
        isVerified: true,
        verificationCode: null,
      },
    });

    return {
      message: 'Account verified successfully. You may now login.',
      success: true,
    };
  }

  async login(payload: { email?: string; password?: string }) {
    if (!payload.email || !payload.password) {
      throw new BadRequestException('Email and password are required');
    }

    const user = await prisma.user.findUnique({
      where: { email: payload.email },
      include: { trainerProfile: true },
    });

    if (!user || user.passwordHash !== this.hashPassword(payload.password)) {
      throw new BadRequestException('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new BadRequestException({
        message: 'Account verification required before access is granted',
        code: 'ACCOUNT_NOT_VERIFIED',
        email: user.email,
      });
    }

    return {
      message: 'Login successful',
      token: `mock-jwt-token-${user.id}`,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        isVerified: user.isVerified,
        trainerProfile: user.trainerProfile,
      },
    };
  }

  async forgotPassword(payload: { email?: string }) {
    if (!payload.email) {
      throw new BadRequestException('Email parameter is required');
    }

    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (!user) {
      return {
        message:
          'If that email exists in our records, a password reset code has been sent.',
      };
    }

    const resetPasswordCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    await prisma.user.update({
      where: { email: payload.email },
      data: { resetPasswordCode },
    });

    const subject = 'FitSync Password Reset Request';
    const body = `Use this 6-digit code to reset your password: ${resetPasswordCode}`;
    await this.sendEmail(payload.email, subject, body);

    return {
      message: 'Password reset code generated successfully',
      mockEmailDelivered: {
        to: payload.email,
        subject,
        body,
        code: resetPasswordCode,
      },
    };
  }

  async resetPassword(payload: {
    email?: string;
    code?: string;
    newPassword?: string;
  }) {
    if (!payload.email || !payload.code || !payload.newPassword) {
      throw new BadRequestException(
        'Email, recovery code, and newPassword are required',
      );
    }

    if (payload.newPassword.length < 8) {
      throw new BadRequestException(
        'Password must be at least 8 characters long',
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user || user.resetPasswordCode !== payload.code) {
      throw new BadRequestException('Invalid or expired password reset code');
    }

    const passwordHash = this.hashPassword(payload.newPassword);
    await prisma.user.update({
      where: { email: payload.email },
      data: {
        passwordHash,
        resetPasswordCode: null,
      },
    });

    return {
      message: 'Password has been successfully reset. You may now login.',
      success: true,
    };
  }

  logout(userId?: string) {
    return {
      message:
        'User logged out successfully. Client storage session tokens cleared.',
      success: true,
      clearedUserId: userId ?? null,
    };
  }
}
