/**
 * Feature Flag Middleware - Prioridade 3
 * Middleware para proteção de rotas baseado em feature flags
 * 
 * @module middlewares/feature-flag
 * @description Bloqueia acesso a rotas se a feature não estiver ativada
 */

import { Request, Response, NextFunction } from 'express';
import { featureFlagService } from '../services/feature-flag.service';
import { log } from '../lib/logger';

/**
 * Middleware: Verificar se feature está ativada antes de processar requisição
 * 
 * @param flagName - Nome da feature flag
 * @param options - Opções adicionais
 * 
 * @example
 * ```typescript
 * router.get('/nova-funcionalidade', 
 *   requireFeature('exportacao_avancada'),
 *   async (req, res) => { ... }
 * );
 * ```
 */
export function requireFeature(
  flagName: string,
  options?: {
    message?: string;
    redirectTo?: string;
  }
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const environment = process.env.NODE_ENV || 'production';
      const appVersion = req.headers['x-app-version'] as string | undefined;

      // Verificar feature flag
      const isEnabled = await featureFlagService.isFeatureEnabled({
        flagName,
        userId: user?.id,
        userRole: user?.role,
        environment,
        appVersion
      });

      if (!isEnabled) {
        log.warn({
          flagName,
          userId: user?.id,
          path: req.path
        }, 'Acesso negado: feature não ativada');

        // Se houver redirecionamento configurado
        if (options?.redirectTo) {
          return res.redirect(options.redirectTo);
        }

        // Resposta padrão
        return res.status(403).json({
          error: 'Feature Not Available',
          message: options?.message || `A funcionalidade "${flagName}" não está disponível no momento.`,
          code: 'FEATURE_DISABLED',
          flagName
        });
      }

      // Feature ativada, continuar
      next();

    } catch (error) {
      log.error({ err: error, flagName }, 'Erro ao verificar feature flag');
      
      // Em caso de erro, negar acesso (fail-safe)
      return res.status(503).json({
        error: 'Service Unavailable',
        message: 'Não foi possível verificar a disponibilidade da funcionalidade.',
        code: 'FEATURE_CHECK_ERROR'
      });
    }
  };
}

/**
 * Middleware: Verificar múltiplas features (AND logic)
 * Todas as features devem estar ativadas
 * 
 * @example
 * ```typescript
 * router.post('/export-and-send', 
 *   requireAllFeatures(['exportacao_avancada', 'envio_email']),
 *   async (req, res) => { ... }
 * );
 * ```
 */
export function requireAllFeatures(flagNames: string[], options?: { message?: string }) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const environment = process.env.NODE_ENV || 'production';
      const appVersion = req.headers['x-app-version'] as string | undefined;

      // Verificar todas as features
      const checks = await Promise.all(
        flagNames.map(flagName =>
          featureFlagService.isFeatureEnabled({
            flagName,
            userId: user?.id,
            userRole: user?.role,
            environment,
            appVersion
          })
        )
      );

      // Se alguma feature estiver desativada
      const disabledFlags = flagNames.filter((_, index) => !checks[index]);
      
      if (disabledFlags.length > 0) {
        return res.status(403).json({
          error: 'Features Not Available',
          message: options?.message || 'Uma ou mais funcionalidades necessárias não estão disponíveis.',
          code: 'FEATURES_DISABLED',
          disabledFlags
        });
      }

      // Todas ativadas
      next();

    } catch (error) {
      log.error({ err: error, flagNames }, 'Erro ao verificar múltiplas feature flags');
      return res.status(503).json({
        error: 'Service Unavailable',
        code: 'FEATURE_CHECK_ERROR'
      });
    }
  };
}

/**
 * Middleware: Verificar se pelo menos uma feature está ativada (OR logic)
 * 
 * @example
 * ```typescript
 * router.get('/export', 
 *   requireAnyFeature(['exportacao_pdf', 'exportacao_excel']),
 *   async (req, res) => { ... }
 * );
 * ```
 */
export function requireAnyFeature(flagNames: string[], options?: { message?: string }) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const environment = process.env.NODE_ENV || 'production';
      const appVersion = req.headers['x-app-version'] as string | undefined;

      // Verificar todas as features
      const checks = await Promise.all(
        flagNames.map(flagName =>
          featureFlagService.isFeatureEnabled({
            flagName,
            userId: user?.id,
            userRole: user?.role,
            environment,
            appVersion
          })
        )
      );

      // Se nenhuma feature estiver ativada
      const hasAnyEnabled = checks.some(check => check === true);
      
      if (!hasAnyEnabled) {
        return res.status(403).json({
          error: 'Features Not Available',
          message: options?.message || 'Nenhuma das funcionalidades alternativas está disponível.',
          code: 'FEATURES_DISABLED',
          checkedFlags: flagNames
        });
      }

      // Pelo menos uma ativada
      next();

    } catch (error) {
      log.error({ err: error, flagNames }, 'Erro ao verificar feature flags alternativas');
      return res.status(503).json({
        error: 'Service Unavailable',
        code: 'FEATURE_CHECK_ERROR'
      });
    }
  };
}

/**
 * Helper: Adicionar informações de features ativadas no response
 * Útil para frontend saber quais features mostrar
 * 
 * @example
 * ```typescript
 * app.use('/api', attachFeatureFlags);
 * ```
 */
export async function attachFeatureFlags(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return next();
    }

    const environment = process.env.NODE_ENV || 'production';

    // Buscar todas as flags ativas
    const allFlags = await featureFlagService.listFeatureFlags({
      environment,
      isEnabled: true
    });

    // Verificar quais o usuário tem acesso
    const userFeatures: Record<string, boolean> = {};
    
    for (const flag of allFlags) {
      const isEnabled = await featureFlagService.isFeatureEnabled({
        flagName: flag.name,
        userId: user.id,
        userRole: user.role,
        environment
      });
      userFeatures[flag.name] = isEnabled;
    }

    // Anexar ao objeto de resposta (pode ser usado em qualquer controller)
    (res.locals as any).featureFlags = userFeatures;

    next();

  } catch (error) {
    log.error({ err: error }, 'Erro ao anexar feature flags');
    // Não bloquear requisição se houver erro
    next();
  }
}

export default {
  requireFeature,
  requireAllFeatures,
  requireAnyFeature,
  attachFeatureFlags
};
