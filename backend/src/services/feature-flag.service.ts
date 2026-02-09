/**
 * Feature Flags Service - Prioridade 3
 * Sistema de controle de funcionalidades com ativação/desativação dinâmica
 * 
 * @module services/feature-flag.service
 * @description
 * - Gerenciamento de features flags por ambiente
 * - Rollout gradual (0-100% dos usuários)
 * - Override por usuário específico
 * - Regras baseadas em roles
 * - Auditoria completa de mudanças
 */

import { prisma } from '../lib/prisma';
import { cacheService } from './cache.service';
import { log } from '../lib/logger';

/**
 * Interface para regras de feature flag
 */
interface FeatureFlagRules {
  allowedRoles?: string[];      // Roles que podem usar a feature
  deniedRoles?: string[];       // Roles bloqueados
  allowedUsers?: string[];      // Usuários específicos permitidos
  deniedUsers?: string[];       // Usuários específicos bloqueados
  minVersion?: string;          // Versão mínima da aplicação
  maxVersion?: string;          // Versão máxima da aplicação
  customConditions?: Record<string, any>; // Condições customizadas
}

/**
 * Interface para verificação de feature flag
 */
interface CheckFeatureParams {
  flagName: string;
  userId?: string;
  userRole?: string;
  environment?: string;
  appVersion?: string;
}

/**
 * Service Class: FeatureFlagService
 */
export class FeatureFlagService {
  private readonly CACHE_TTL = 300; // 5 minutos
  private readonly CACHE_PREFIX = 'feature_flag:';

  /**
   * Verificar se uma feature está ativada para um usuário
   * 
   * @param params - Parâmetros de verificação
   * @returns true se a feature está ativada
   */
  async isFeatureEnabled(params: CheckFeatureParams): Promise<boolean> {
    const { flagName, userId, userRole, environment = 'production', appVersion } = params;

    try {
      // 1. Buscar no cache
      const cacheKey = `${this.CACHE_PREFIX}${flagName}:${userId || 'anonymous'}`;
      const cached = await cacheService.get<boolean>(cacheKey);
      
      if (cached !== null) {
        return cached;
      }

      // 2. Buscar flag no banco
      const flag = await prisma.featureFlag.findUnique({
        where: { name: flagName },
        include: {
          userOverrides: userId ? {
            where: {
              userId,
              OR: [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } }
              ]
            }
          } : false
        }
      });

      if (!flag) {
        log.warn({ flagName }, 'Feature flag não encontrada');
        await cacheService.set(cacheKey, false, this.CACHE_TTL);
        return false;
      }

      // 3. Verificar override por usuário (tem prioridade)
      if (userId && flag.userOverrides && flag.userOverrides.length > 0) {
        const override = flag.userOverrides[0];
        await cacheService.set(cacheKey, override.isEnabled, this.CACHE_TTL);
        return override.isEnabled;
      }

      // 4. Verificar se flag está desabilitada globalmente
      if (!flag.isEnabled) {
        await cacheService.set(cacheKey, false, this.CACHE_TTL);
        return false;
      }

      // 5. Verificar ambiente
      if (flag.environment !== 'all' && flag.environment !== environment) {
        await cacheService.set(cacheKey, false, this.CACHE_TTL);
        return false;
      }

      // 6. Verificar regras avançadas
      const rules = flag.rules as FeatureFlagRules | null;
      if (rules) {
        // 6.1. Verificar role permitido
        if (rules.allowedRoles && rules.allowedRoles.length > 0) {
          if (!userRole || !rules.allowedRoles.includes(userRole)) {
            await cacheService.set(cacheKey, false, this.CACHE_TTL);
            return false;
          }
        }

        // 6.2. Verificar role bloqueado
        if (rules.deniedRoles && rules.deniedRoles.length > 0) {
          if (userRole && rules.deniedRoles.includes(userRole)) {
            await cacheService.set(cacheKey, false, this.CACHE_TTL);
            return false;
          }
        }

        // 6.3. Verificar usuário específico permitido
        if (rules.allowedUsers && rules.allowedUsers.length > 0) {
          if (!userId || !rules.allowedUsers.includes(userId)) {
            await cacheService.set(cacheKey, false, this.CACHE_TTL);
            return false;
          }
        }

        // 6.4. Verificar usuário bloqueado
        if (rules.deniedUsers && rules.deniedUsers.length > 0) {
          if (userId && rules.deniedUsers.includes(userId)) {
            await cacheService.set(cacheKey, false, this.CACHE_TTL);
            return false;
          }
        }

        // 6.5. Verificar versão da aplicação
        if (appVersion) {
          if (rules.minVersion && this.compareVersions(appVersion, rules.minVersion) < 0) {
            await cacheService.set(cacheKey, false, this.CACHE_TTL);
            return false;
          }
          if (rules.maxVersion && this.compareVersions(appVersion, rules.maxVersion) > 0) {
            await cacheService.set(cacheKey, false, this.CACHE_TTL);
            return false;
          }
        }
      }

      // 7. Verificar rollout percentage
      if (flag.rolloutPercentage < 100 && userId) {
        const isInRollout = this.isUserInRollout(userId, flag.rolloutPercentage);
        await cacheService.set(cacheKey, isInRollout, this.CACHE_TTL);
        return isInRollout;
      }

      // 8. Feature está ativada
      await cacheService.set(cacheKey, true, this.CACHE_TTL);
      return true;

    } catch (error) {
      log.error({ err: error, flagName, userId }, 'Erro ao verificar feature flag');
      // Em caso de erro, retorna false (fail-safe)
      return false;
    }
  }

  /**
   * Criar nova feature flag
   */
  async createFeatureFlag(data: {
    name: string;
    description?: string;
    isEnabled?: boolean;
    environment?: string;
    rolloutPercentage?: number;
    rules?: FeatureFlagRules;
    createdBy?: string;
  }) {
    try {
      const flag = await prisma.featureFlag.create({
        data: {
          name: data.name,
          description: data.description,
          isEnabled: data.isEnabled ?? false,
          environment: data.environment ?? 'all',
          rolloutPercentage: data.rolloutPercentage ?? 100,
          rules: data.rules as any,
          createdBy: data.createdBy,
        }
      });

      // Registrar auditoria
      await this.logAudit({
        flagId: flag.id,
        action: 'created',
        newValue: flag,
        changedBy: data.createdBy || 'system'
      });

      // Invalidar cache
      await this.invalidateFlagCache(data.name);

      log.info({ flagName: data.name }, 'Feature flag criada');
      return flag;

    } catch (error) {
      log.error({ err: error, flagName: data.name }, 'Erro ao criar feature flag');
      throw error;
    }
  }

  /**
   * Atualizar feature flag existente
   */
  async updateFeatureFlag(
    name: string,
    data: Partial<{
      description: string;
      isEnabled: boolean;
      environment: string;
      rolloutPercentage: number;
      rules: FeatureFlagRules;
    }>,
    changedBy: string
  ) {
    try {
      const oldFlag = await prisma.featureFlag.findUnique({ where: { name } });
      
      if (!oldFlag) {
        throw new Error('Feature flag não encontrada');
      }

      const updatedFlag = await prisma.featureFlag.update({
        where: { name },
        data: {
          ...data,
          rules: data.rules as any
        }
      });

      // Registrar auditoria
      await this.logAudit({
        flagId: updatedFlag.id,
        action: 'updated',
        oldValue: oldFlag,
        newValue: updatedFlag,
        changedBy
      });

      // Invalidar cache
      await this.invalidateFlagCache(name);

      log.info({ flagName: name }, 'Feature flag atualizada');
      return updatedFlag;

    } catch (error) {
      log.error({ err: error, flagName: name }, 'Erro ao atualizar feature flag');
      throw error;
    }
  }

  /**
   * Ativar/Desativar feature flag
   */
  async toggleFeatureFlag(name: string, isEnabled: boolean, changedBy: string) {
    return this.updateFeatureFlag(name, { isEnabled }, changedBy);
  }

  /**
   * Criar override para usuário específico
   */
  async createUserOverride(data: {
    flagName: string;
    userId: string;
    isEnabled: boolean;
    reason?: string;
    expiresAt?: Date;
    createdBy?: string;
  }) {
    try {
      const flag = await prisma.featureFlag.findUnique({
        where: { name: data.flagName }
      });

      if (!flag) {
        throw new Error('Feature flag não encontrada');
      }

      const override = await prisma.featureFlagUserOverride.create({
        data: {
          flagId: flag.id,
          userId: data.userId,
          isEnabled: data.isEnabled,
          reason: data.reason,
          expiresAt: data.expiresAt,
          createdBy: data.createdBy
        }
      });

      // Invalidar cache do usuário
      const cacheKey = `${this.CACHE_PREFIX}${data.flagName}:${data.userId}`;
      await cacheService.delete(cacheKey);

      log.info({ flagName: data.flagName, userId: data.userId }, 'Override de feature flag criado');
      return override;

    } catch (error) {
      log.error({ err: error, flagName: data.flagName, userId: data.userId }, 'Erro ao criar override');
      throw error;
    }
  }

  /**
   * Listar todas as feature flags
   */
  async listFeatureFlags(filters?: {
    environment?: string;
    isEnabled?: boolean;
  }) {
    try {
      return await prisma.featureFlag.findMany({
        where: {
          environment: filters?.environment,
          isEnabled: filters?.isEnabled
        },
        orderBy: { name: 'asc' }
      });
    } catch (error) {
      log.error({ err: error }, 'Erro ao listar feature flags');
      throw error;
    }
  }

  /**
   * Obter feature flag por nome
   */
  async getFeatureFlag(name: string) {
    try {
      return await prisma.featureFlag.findUnique({
        where: { name },
        include: {
          userOverrides: true,
          auditLogs: {
            take: 10,
            orderBy: { changedAt: 'desc' }
          }
        }
      });
    } catch (error) {
      log.error({ err: error, flagName: name }, 'Erro ao obter feature flag');
      throw error;
    }
  }

  /**
   * Deletar feature flag
   */
  async deleteFeatureFlag(name: string, deletedBy: string) {
    try {
      const flag = await prisma.featureFlag.findUnique({ where: { name } });
      
      if (!flag) {
        throw new Error('Feature flag não encontrada');
      }

      await prisma.featureFlag.delete({ where: { name } });

      // Registrar auditoria
      await this.logAudit({
        flagId: flag.id,
        action: 'deleted',
        oldValue: flag,
        changedBy: deletedBy
      });

      // Invalidar cache
      await this.invalidateFlagCache(name);

      log.info({ flagName: name }, 'Feature flag deletada');
      return true;

    } catch (error) {
      log.error({ err: error, flagName: name }, 'Erro ao deletar feature flag');
      throw error;
    }
  }

  /**
   * HELPERS PRIVADOS
   */

  /**
   * Determinar se usuário está no rollout baseado em hash consistente
   */
  private isUserInRollout(userId: string, percentage: number): boolean {
    // Hash simples do userId para distribuição consistente
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    
    const userPercentile = Math.abs(hash % 100);
    return userPercentile < percentage;
  }

  /**
   * Comparar versões (semantic versioning)
   */
  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const num1 = parts1[i] || 0;
      const num2 = parts2[i] || 0;
      
      if (num1 > num2) return 1;
      if (num1 < num2) return -1;
    }
    
    return 0;
  }

  /**
   * Registrar auditoria
   */
  private async logAudit(data: {
    flagId: string;
    action: string;
    oldValue?: any;
    newValue?: any;
    changedBy: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      await prisma.featureFlagAuditLog.create({
        data: {
          flagId: data.flagId,
          action: data.action,
          oldValue: data.oldValue,
          newValue: data.newValue,
          changedBy: data.changedBy,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent
        }
      });
    } catch (error) {
      log.error({ err: error }, 'Erro ao registrar auditoria de feature flag');
    }
  }

  /**
   * Invalidar cache de uma flag específica
   */
  private async invalidateFlagCache(flagName: string) {
    try {
      const pattern = `${this.CACHE_PREFIX}${flagName}:*`;
      await cacheService.invalidate(pattern);
    } catch (error) {
      log.error({ err: error, flagName }, 'Erro ao invalidar cache de feature flag');
    }
  }
}

export const featureFlagService = new FeatureFlagService();
export default featureFlagService;
