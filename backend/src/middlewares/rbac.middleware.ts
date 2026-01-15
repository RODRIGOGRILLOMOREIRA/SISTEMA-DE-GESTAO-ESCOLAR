import { Request, Response, NextFunction } from 'express';
import { rbacService, PermissionCheck } from '../services/rbac.service';
import { log, securityLogger } from '../lib/logger';

/**
 * Middleware de Autorização RBAC - Fase 4
 * 
 * Verifica se o usuário autenticado tem as permissões necessárias
 * para acessar um recurso específico
 */

/**
 * Middleware para verificar permissão única
 * 
 * @example
 * router.post('/alunos', authenticate, authorize('alunos', 'create'), handler)
 */
export function authorize(resource: string, action: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Verificar se usuário está autenticado
      if (!req.user) {
        securityLogger.warn({ 
          resource, 
          action, 
          ip: req.ip 
        }, 'Authorization failed: No user in request');
        
        return res.status(401).json({ 
          error: 'Não autenticado' 
        });
      }

      const userId = req.user.userId || req.user.id;

      // Verificar permissão
      const hasPermission = await rbacService.hasPermission(userId, resource, action);

      if (!hasPermission) {
        securityLogger.warn({
          userId,
          email: req.user.email,
          resource,
          action,
          ip: req.ip,
          method: req.method,
          path: req.path
        }, 'Authorization failed: Insufficient permissions');

        return res.status(403).json({
          error: 'Acesso negado',
          message: `Você não tem permissão para ${action} em ${resource}`
        });
      }

      // Permissão concedida
      log.debug({
        userId,
        resource,
        action
      }, 'Authorization granted');

      next();

    } catch (error) {
      log.error({ err: error, resource, action }, 'Error in authorize middleware');
      res.status(500).json({ error: 'Erro ao verificar permissões' });
    }
  };
}

/**
 * Middleware para verificar qualquer uma das permissões (OR)
 * 
 * @example
 * router.get('/dashboard', authenticate, authorizeAny([
 *   { resource: 'dashboard', action: 'view' },
 *   { resource: '*', action: '*' }
 * ]), handler)
 */
export function authorizeAny(permissions: PermissionCheck[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Não autenticado' });
      }

      const userId = req.user.userId || req.user.id;
      const hasPermission = await rbacService.hasAnyPermission(userId, permissions);

      if (!hasPermission) {
        securityLogger.warn({
          userId,
          email: req.user.email,
          permissions,
          ip: req.ip
        }, 'Authorization failed: None of the required permissions');

        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Você não tem nenhuma das permissões necessárias'
        });
      }

      next();

    } catch (error) {
      log.error({ err: error, permissions }, 'Error in authorizeAny middleware');
      res.status(500).json({ error: 'Erro ao verificar permissões' });
    }
  };
}

/**
 * Middleware para verificar todas as permissões (AND)
 * 
 * @example
 * router.post('/admin/config', authenticate, authorizeAll([
 *   { resource: 'configuracoes', action: 'update' },
 *   { resource: 'sistema', action: 'admin' }
 * ]), handler)
 */
export function authorizeAll(permissions: PermissionCheck[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Não autenticado' });
      }

      const userId = req.user.userId || req.user.id;
      const hasPermissions = await rbacService.hasAllPermissions(userId, permissions);

      if (!hasPermissions) {
        securityLogger.warn({
          userId,
          email: req.user.email,
          permissions,
          ip: req.ip
        }, 'Authorization failed: Missing required permissions');

        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Você não tem todas as permissões necessárias'
        });
      }

      next();

    } catch (error) {
      log.error({ err: error, permissions }, 'Error in authorizeAll middleware');
      res.status(500).json({ error: 'Erro ao verificar permissões' });
    }
  };
}

/**
 * Middleware para verificar se é admin (tem permissão *:*)
 */
export function requireAdmin() {
  return authorize('*', '*');
}

/**
 * Middleware para verificar se usuário tem uma das roles permitidas (verificação simples por tipo)
 * 
 * @example
 * router.post('/upload', authenticate, requireRole(['ADMIN', 'PROFESSOR']), handler)
 */
export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Verificar se usuário está autenticado
      if (!req.user) {
        securityLogger.warn({ 
          allowedRoles, 
          ip: req.ip 
        }, 'Authorization failed: No user in request');
        
        return res.status(401).json({ 
          error: 'Não autenticado' 
        });
      }

      const userRole = req.user.tipo;

      // Verificar se tem uma das roles permitidas
      if (!userRole || !allowedRoles.includes(userRole)) {
        securityLogger.warn({
          userId: req.user.userId || req.user.id,
          email: req.user.email,
          userRole,
          allowedRoles,
          ip: req.ip,
          method: req.method,
          path: req.path
        }, 'Authorization failed: Role not allowed');

        return res.status(403).json({
          error: 'Acesso negado',
          message: `Seu perfil (${userRole}) não tem permissão para acessar este recurso`
        });
      }

      // Role permitida
      log.debug({
        userId: req.user.userId || req.user.id,
        userRole,
        allowedRoles
      }, 'Authorization granted by role');

      next();

    } catch (error) {
      log.error({ err: error, allowedRoles }, 'Error in requireRole middleware');
      res.status(500).json({ error: 'Erro ao verificar permissões' });
    }
  };
}

/**
 * Decorator para facilitar uso do RBAC
 * 
 * @example
 * router.get('/alunos', authenticate, can('alunos', 'read'), handler)
 */
export const can = authorize;
export const canAny = authorizeAny;
export const canAll = authorizeAll;
