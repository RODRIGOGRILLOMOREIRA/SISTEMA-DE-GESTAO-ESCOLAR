/**
 * Two-Factor Authentication Service (2FA)
 * Fase 4 - Segurança Avançada
 */

import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { PrismaClient } from '@prisma/client';
import { log } from '../lib/logger';

const prisma = new PrismaClient();

export interface TwoFactorSetupResult {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export class TwoFactorService {
  /**
   * Gerar secret e QR code para configuração do 2FA
   */
  async generateSecret(userId: string, email: string): Promise<TwoFactorSetupResult> {
    try {
      // Gerar secret
      const secret = speakeasy.generateSecret({
        name: `SGE (${email})`,
        issuer: 'Sistema de Gestão Escolar',
        length: 32
      });

      // Gerar QR Code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

      // Gerar códigos de backup (8 códigos de 8 dígitos)
      const backupCodes = this.generateBackupCodes(8);

      // Salvar no banco (temporariamente - só ativa quando verificar)
      await prisma.twoFactorAuth.upsert({
        where: { userId },
        create: {
          userId,
          secret: secret.base32,
          backupCodes,
          enabled: false // Só ativa após verificação
        },
        update: {
          secret: secret.base32,
          backupCodes,
          enabled: false
        }
      });

      log.info({ userId, email, component: '2fa' }, '2FA: Secret gerado para usuário');

      return {
        secret: secret.base32,
        qrCodeUrl,
        backupCodes
      };
    } catch (error: any) {
      log.error({ err: error, userId, component: '2fa' }, 'Erro ao gerar secret 2FA');
      throw new Error('Erro ao configurar 2FA');
    }
  }

  /**
   * Verificar token TOTP e ativar 2FA
   */
  async verifyAndEnable(userId: string, token: string): Promise<boolean> {
    try {
      const twoFactor = await prisma.twoFactorAuth.findUnique({
        where: { userId }
      });

      if (!twoFactor || !twoFactor.secret) {
        log.warn({ userId, component: '2fa' }, '2FA: Usuário sem secret configurado');
        return false;
      }

      // Verificar token
      const verified = speakeasy.totp.verify({
        secret: twoFactor.secret,
        encoding: 'base32',
        token: token,
        window: 2 // Aceitar 2 intervalos de tempo (30s cada)
      });

      if (verified) {
        // Ativar 2FA
        await prisma.twoFactorAuth.update({
          where: { userId },
          data: {
            enabled: true
          }
        });

        // Registrar log de sucesso
        await this.logAttempt(userId, true, 'totp');

        log.info({ userId, component: '2fa' }, '2FA ativado com sucesso');
        return true;
      }

      log.warn({ userId, component: '2fa' }, '2FA: Token inválido na verificação');
      return false;
    } catch (error: any) {
      log.error({ err: error, userId, component: '2fa' }, 'Erro ao verificar token 2FA');
      return false;
    }
  }

  /**
   * Verificar token TOTP durante login
   */
  async verifyToken(userId: string, token: string): Promise<boolean> {
    try {
      const twoFactor = await prisma.twoFactorAuth.findUnique({
        where: { userId }
      });

      if (!twoFactor || !twoFactor.enabled || !twoFactor.secret) {
        log.warn({ userId, component: '2fa' }, '2FA: Usuário sem 2FA habilitado');
        return false;
      }

      // Verificar se é um código de backup
      if (await this.verifyBackupCode(userId, token)) {
        await this.logAttempt(userId, true, 'backup_code');
        log.info({ userId, component: '2fa' }, '2FA: Login com código de backup');
        return true;
      }

      // Verificar token TOTP
      const verified = speakeasy.totp.verify({
        secret: twoFactor.secret,
        encoding: 'base32',
        token: token,
        window: 2
      });

      await this.logAttempt(userId, verified, 'totp');

      if (verified) {
        log.info({ userId, component: '2fa' }, '2FA: Token verificado com sucesso');
      } else {
        log.warn({ userId, component: '2fa' }, '2FA: Token inválido');
      }

      return verified;
    } catch (error: any) {
      log.error({ err: error, userId, component: '2fa' }, 'Erro ao verificar token 2FA');
      return false;
    }
  }

  /**
   * Desabilitar 2FA
   */
  async disable(userId: string, password: string): Promise<boolean> {
    try {
      // Verificar senha antes de desabilitar (segurança extra)
      // Isso deve ser feito no controller antes de chamar este método

      await prisma.twoFactorAuth.delete({
        where: { userId }
      });

      log.info({ userId, component: '2fa' }, '2FA desabilitado');
      return true;
    } catch (error: any) {
      log.error({ err: error, userId, component: '2fa' }, 'Erro ao desabilitar 2FA');
      return false;
    }
  }

  /**
   * Verificar código de backup
   */
  private async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    try {
      const twoFactor = await prisma.twoFactorAuth.findUnique({
        where: { userId }
      });

      if (!twoFactor || !twoFactor.backupCodes || twoFactor.backupCodes.length === 0) {
        return false;
      }

      const codeIndex = twoFactor.backupCodes.indexOf(code);

      if (codeIndex === -1) {
        return false;
      }

      // Remover código usado (só pode ser usado uma vez)
      const newBackupCodes = [...twoFactor.backupCodes];
      newBackupCodes.splice(codeIndex, 1);

      await prisma.twoFactorAuth.update({
        where: { userId },
        data: {
          backupCodes: newBackupCodes
        }
      });

      log.info({ userId, component: '2fa', remainingCodes: newBackupCodes.length }, 
        '2FA: Código de backup usado');

      return true;
    } catch (error: any) {
      log.error({ err: error, userId, component: '2fa' }, 'Erro ao verificar código de backup');
      return false;
    }
  }

  /**
   * Gerar novos códigos de backup
   */
  async regenerateBackupCodes(userId: string): Promise<string[]> {
    try {
      const backupCodes = this.generateBackupCodes(8);

      await prisma.twoFactorAuth.update({
        where: { userId },
        data: {
          backupCodes
        }
      });

      log.info({ userId, component: '2fa' }, '2FA: Códigos de backup regenerados');
      return backupCodes;
    } catch (error: any) {
      log.error({ err: error, userId, component: '2fa' }, 'Erro ao regenerar códigos de backup');
      throw new Error('Erro ao regenerar códigos de backup');
    }
  }

  /**
   * Gerar códigos de backup aleatórios
   */
  private generateBackupCodes(count: number): string[] {
    const codes: string[] = [];
    
    for (let i = 0; i < count; i++) {
      // Gerar código de 8 dígitos
      const code = Math.floor(10000000 + Math.random() * 90000000).toString();
      codes.push(code);
    }

    return codes;
  }

  /**
   * Verificar se usuário tem 2FA habilitado
   */
  async isEnabled(userId: string): Promise<boolean> {
    try {
      const twoFactor = await prisma.twoFactorAuth.findUnique({
        where: { userId },
        select: { enabled: true }
      });

      return twoFactor?.enabled || false;
    } catch (error: any) {
      log.error({ err: error, userId, component: '2fa' }, 'Erro ao verificar status 2FA');
      return false;
    }
  }

  /**
   * Obter informações sobre 2FA do usuário
   */
  async getStatus(userId: string) {
    try {
      const twoFactor = await prisma.twoFactorAuth.findUnique({
        where: { userId },
        select: {
          enabled: true,
          backupCodes: true
        }
      });

      if (!twoFactor) {
        return {
          enabled: false,
          backupCodesRemaining: 0
        };
      }

      return {
        enabled: twoFactor.enabled || false,
        backupCodesRemaining: twoFactor.backupCodes?.length || 0
      };
    } catch (error: any) {
      log.error({ err: error, userId, component: '2fa' }, 'Erro ao obter status 2FA');
      return null;
    }
  }

  /**
   * Registrar tentativa de 2FA (para auditoria)
   */
  private async logAttempt(userId: string, success: boolean, method: string) {
    try {
      await prisma.twoFactorLog.create({
        data: {
          userId,
          success,
          method
        }
      });
    } catch (error: any) {
      // Não falhar por erro de log
      log.error({ err: error, userId, component: '2fa' }, 'Erro ao registrar log 2FA');
    }
  }
}

export default new TwoFactorService();
