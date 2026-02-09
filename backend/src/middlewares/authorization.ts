/**
 * Authorization Middleware - RBAC Granular
 * Sistema de Gestão Escolar - Fase 4
 */

import { Request, Response, NextFunction } from 'express';
import roleService from '../services/role.service';
import { securityLogger } from '../lib/logger';

// Estender Request para incluir userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userType?: string;
      userPermissions?: string[];
    }
  }
}

/**
 * Middleware para verificar se usuário tem permissão específica
 */
export const requirePermission = (permission: string | string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;

      if (!userId) {
        securityLogger.warn(
          { path: req.path, method: req.method },
          'Tentativa de acesso sem autenticação'
        );
        return res.status(401).json({
          error: 'Não autenticado',
          message: 'Faça login para acessar este recurso',
        });
      }

      // Se permission é array, verificar se tem pelo menos uma
      const permissions = Array.isArray(permission) ? permission : [permission];

      // Cache de permissões no request
      if (!req.userPermissions) {
        req.userPermissions = await roleService.getUserPermissions(userId);
      }

      const hasPermission = permissions.some((p) => req.userPermissions?.includes(p));

      if (!hasPermission) {
        securityLogger.warn(
          {
            userId,
            requiredPermissions: permissions,
            userPermissions: req.userPermissions,
            path: req.path,
            method: req.method,
          },
          'Acesso negado - permissão insuficiente'
        );

        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Você não tem permissão para acessar este recurso',
          required: permissions,
        });
      }

      // Permissão concedida
      next();
    } catch (error) {
      securityLogger.error({ error, userId: req.userId }, 'Erro ao verificar permissão');
      return res.status(500).json({
        error: 'Erro interno',
        message: 'Erro ao verificar permissões',
      });
    }
  };
};

/**
 * Middleware para verificar se usuário tem TODAS as permissões listadas
 */
export const requireAllPermissions = (permissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          error: 'Não autenticado',
        });
      }

      // Cache de permissões
      if (!req.userPermissions) {
        req.userPermissions = await roleService.getUserPermissions(userId);
      }

      const hasAll = permissions.every((p) => req.userPermissions?.includes(p));

      if (!hasAll) {
        securityLogger.warn(
          {
            userId,
            requiredPermissions: permissions,
            userPermissions: req.userPermissions,
            path: req.path,
          },
          'Acesso negado - permissões insuficientes'
        );

        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Você não tem todas as permissões necessárias',
          required: permissions,
        });
      }

      next();
    } catch (error) {
      securityLogger.error({ error }, 'Erro ao verificar permissões');
      return res.status(500).json({
        error: 'Erro ao verificar permissões',
      });
    }
  };
};

/**
 * Middleware para verificar se usuário tem role específica
 */
export const requireRole = (roleName: string | string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          error: 'Não autenticado',
        });
      }

      const roles = await roleService.getUserRoles(userId);
      const roleNames = roles.map((r) => r.name);

      const requiredRoles = Array.isArray(roleName) ? roleName : [roleName];
      const hasRole = requiredRoles.some((r) => roleNames.includes(r));

      if (!hasRole) {
        securityLogger.warn(
          {
            userId,
            requiredRoles,
            userRoles: roleNames,
            path: req.path,
          },
          'Acesso negado - role insuficiente'
        );

        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Você não tem a role necessária para acessar este recurso',
          required: requiredRoles,
        });
      }

      next();
    } catch (error) {
      securityLogger.error({ error }, 'Erro ao verificar role');
      return res.status(500).json({
        error: 'Erro ao verificar role',
      });
    }
  };
};

/**
 * Middleware para verificar nível mínimo de role
 */
export const requireMinLevel = (minLevel: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          error: 'Não autenticado',
        });
      }

      const roles = await roleService.getUserRoles(userId);
      const maxLevel = Math.max(...roles.map((r) => r.level), 0);

      if (maxLevel < minLevel) {
        securityLogger.warn(
          {
            userId,
            requiredLevel: minLevel,
            userLevel: maxLevel,
            path: req.path,
          },
          'Acesso negado - nível insuficiente'
        );

        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Seu nível de acesso é insuficiente',
          required: minLevel,
          current: maxLevel,
        });
      }

      next();
    } catch (error) {
      securityLogger.error({ error }, 'Erro ao verificar nível');
      return res.status(500).json({
        error: 'Erro ao verificar nível',
      });
    }
  };
};

/**
 * Middleware para verificar se é dono do recurso OU tem permissão
 */
export const requireOwnerOrPermission = (
  ownerIdGetter: (req: Request) => string,
  permission: string
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          error: 'Não autenticado',
        });
      }

      // Verificar se é o dono
      const ownerId = ownerIdGetter(req);
      if (userId === ownerId) {
        return next();
      }

      // Verificar se tem a permissão
      const hasPermission = await roleService.hasPermission(userId, permission);

      if (!hasPermission) {
        securityLogger.warn(
          {
            userId,
            ownerId,
            permission,
            path: req.path,
          },
          'Acesso negado - não é dono e sem permissão'
        );

        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Você não tem permissão para acessar este recurso',
        });
      }

      next();
    } catch (error) {
      securityLogger.error({ error }, 'Erro ao verificar dono ou permissão');
      return res.status(500).json({
        error: 'Erro ao verificar permissões',
      });
    }
  };
};

/**
 * Helper para gerar permissões baseadas em recurso e ação
 */
export const permission = (resource: string, action: string) => {
  return `${resource}.${action}`;
};

/**
 * Decorator helper para controllers
 */
export const permissions = {
  // Alunos
  alunos: {
    create: permission('alunos', 'create'),
    read: permission('alunos', 'read'),
    update: permission('alunos', 'update'),
    delete: permission('alunos', 'delete'),
    list: permission('alunos', 'list'),
    export: permission('alunos', 'export'),
  },
  // Professores
  professores: {
    create: permission('professores', 'create'),
    read: permission('professores', 'read'),
    update: permission('professores', 'update'),
    delete: permission('professores', 'delete'),
    list: permission('professores', 'list'),
  },
  // Turmas
  turmas: {
    create: permission('turmas', 'create'),
    read: permission('turmas', 'read'),
    update: permission('turmas', 'update'),
    delete: permission('turmas', 'delete'),
    list: permission('turmas', 'list'),
  },
  // Notas
  notas: {
    create: permission('notas', 'create'),
    read: permission('notas', 'read'),
    update: permission('notas', 'update'),
    delete: permission('notas', 'delete'),
    list: permission('notas', 'list'),
    manage_own: permission('notas', 'manage_own'),
  },
  // Frequências
  frequencias: {
    create: permission('frequencias', 'create'),
    read: permission('frequencias', 'read'),
    update: permission('frequencias', 'update'),
    delete: permission('frequencias', 'delete'),
    list: permission('frequencias', 'list'),
    manage_own: permission('frequencias', 'manage_own'),
  },
  // Relatórios
  relatorios: {
    create: permission('relatorios', 'create'),
    read: permission('relatorios', 'read'),
    list: permission('relatorios', 'list'),
    export: permission('relatorios', 'export'),
  },
  // Configurações
  configuracoes: {
    read: permission('configuracoes', 'read'),
    update: permission('configuracoes', 'update'),
  },
  // Roles e Permissions
  roles: {
    create: permission('roles', 'create'),
    read: permission('roles', 'read'),
    update: permission('roles', 'update'),
    delete: permission('roles', 'delete'),
    list: permission('roles', 'list'),
  },
  permissions: {
    create: permission('permissions', 'create'),
    read: permission('permissions', 'read'),
    update: permission('permissions', 'update'),
    delete: permission('permissions', 'delete'),
    list: permission('permissions', 'list'),
  },
};
