import { Module, Controller, Post, Body, Injectable, BadRequestException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class SupportService {
  async sendComplaint(payload: {
    userId: string;
    fullName: string;
    username: string;
    email: string;
    role: string;
    complaint: string;
    date: string;
  }) {
    const { fullName, username, email, role, complaint, date } = payload;

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS?.replace(/"/g, '').trim();
    const supportEmail = process.env.SUPPORT_EMAIL || 'support@fitsync.com';

    if (!smtpUser || !smtpPass) {
      console.warn('SMTP_USER or SMTP_PASS not set. Support email logged only:');
      console.log('Complaint details:', payload);
      return { success: true, mocked: true };
    }

    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; background-color: #f4f2f7; color: #1c1b1f; margin: 0; padding: 20px; }
          .card { background-color: #ffffff; border-radius: 20px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); max-width: 600px; margin: 0 auto; overflow: hidden; border: 1px solid #efedf4; }
          .header { background: linear-gradient(135deg, #6750a4, #d0bcff); padding: 30px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.02em; }
          .content { padding: 40px; }
          .field-row { display: flex; border-bottom: 1px solid #efedf4; padding: 12px 0; }
          .field-label { width: 150px; font-weight: 700; color: #7a757f; font-size: 13px; }
          .field-value { flex: 1; color: #1c1b1f; font-size: 13px; }
          .complaint-box { background-color: #f5f3fa; border-radius: 12px; padding: 20px; margin-top: 20px; border-left: 4px solid #6750a4; color: #49454f; font-style: italic; line-height: 1.6; }
          .footer { text-align: center; font-size: 11px; color: #7a757f; padding: 20px 40px; border-top: 1px solid #efedf4; background-color: #fdfbff; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1 style="color: #ffffff;">Support Portal Complaint Received</h1>
          </div>
          <div class="content">
            <div class="field-row">
              <div class="field-label">From:</div>
              <div class="field-value">${fullName} (${role})</div>
            </div>
            <div class="field-row">
              <div class="field-label">Username:</div>
              <div class="field-value">${username}</div>
            </div>
            <div class="field-row">
              <div class="field-label">Email:</div>
              <div class="field-value">${email}</div>
            </div>
            <div class="field-row">
              <div class="field-label">Date:</div>
              <div class="field-value">${new Date(date).toLocaleString()}</div>
            </div>
            
            <h3 style="margin-top: 30px; font-size: 14px; font-weight: 800; text-transform: uppercase; color: #6750a4; letter-spacing: 0.1em;">Complaint Details</h3>
            <div class="complaint-box">
              "${complaint}"
            </div>
          </div>
          <div class="footer">
            This is an automated request generated from the FitSync Pro Support Console.
          </div>
        </div>
      </body>
      </html>
      `;

      await transporter.sendMail({
        from: `"FitSync Support Portal" <${smtpUser}>`,
        to: supportEmail,
        subject: `[FitSync Support] Complaint from ${fullName} (${username})`,
        html: htmlContent,
      });

      console.log(`Complaint email successfully dispatched to ${supportEmail}`);
      return { success: true };
    } catch (err: any) {
      console.error('Nodemailer error sending support email:', err);
      throw new BadRequestException(`Failed to send support email: ${err.message}`);
    }
  }
}

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('complain')
  async complain(@Body() payload: any) {
    if (!payload.userId || !payload.complaint) {
      throw new BadRequestException('userId and complaint are required fields');
    }
    return this.supportService.sendComplaint(payload);
  }
}

@Module({
  controllers: [SupportController],
  providers: [SupportService],
})
export class SupportModule {}
