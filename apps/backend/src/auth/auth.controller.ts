import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() payload: unknown) {
    return this.authService.register(payload);
  }

  @Post('login')
  async login(@Body() payload: { email?: string; password?: string }) {
    return this.authService.login(payload);
  }

  @Post('logout')
  logout(@Body() payload?: { userId?: string }) {
    return this.authService.logout(payload?.userId);
  }

  @Post('send-verification')
  async sendVerificationEmail(@Body() payload: { email?: string }) {
    return this.authService.sendVerificationEmail(payload?.email || '');
  }

  @Post('verify')
  async verifyAccount(@Body() payload: { email?: string; code?: string }) {
    return this.authService.verifyAccount(payload);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() payload: { email?: string }) {
    return this.authService.forgotPassword(payload);
  }

  @Post('reset-password')
  async resetPassword(
    @Body()
    payload: {
      email?: string;
      code?: string;
      newPassword?: string;
    },
  ) {
    return this.authService.resetPassword(payload);
  }
}
