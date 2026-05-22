import { Controller, Post, Get, Delete, Param, Body } from '@nestjs/common';
import { BiometricService } from './biometric.service';

@Controller('biometrics')
export class BiometricController {
  constructor(private readonly biometricService: BiometricService) {}

  // User: log a new weight/height measurement
  @Post(':userId')
  async logBiometric(
    @Param('userId') userId: string,
    @Body() payload: { weight?: number; height?: number },
  ) {
    return this.biometricService.logBiometric(userId, payload);
  }

  // User/Trainer: view complete measurement history
  @Get(':userId/history')
  async getBiometricHistory(@Param('userId') userId: string) {
    return this.biometricService.getBiometricHistory(userId);
  }

  // User: view only their most recent measurement snapshot
  @Get(':userId/latest')
  async getLatestBiometric(@Param('userId') userId: string) {
    return this.biometricService.getLatestBiometric(userId);
  }

  // User/Admin: remove a specific erroneous log entry
  @Delete('log/:logId')
  async deleteBiometricLog(@Param('logId') logId: string) {
    return this.biometricService.deleteBiometricLog(logId);
  }
}
