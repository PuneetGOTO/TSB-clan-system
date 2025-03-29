import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';

@Injectable()
export class TwoFactorAuthService {
  // 生成两因素认证密钥
  async generateTwoFactorAuthenticationSecret(email: string) {
    // 为用户生成一个唯一的密钥
    const secret = authenticator.generateSecret();
    
    // 创建认证器URL (用于生成QR码)
    const appName = process.env.TWO_FACTOR_APP_NAME || 'TSB战队系统';
    const otpAuthUrl = authenticator.keyuri(email, appName, secret);

    return {
      secret,
      otpAuthUrl
    };
  }

  // 生成QR码数据URL
  async generateQrCodeDataURL(otpAuthUrl: string) {
    return toDataURL(otpAuthUrl);
  }

  // 验证两因素认证码
  verifyCode(code: string, secret: string): boolean {
    return authenticator.verify({
      token: code,
      secret
    });
  }
}
