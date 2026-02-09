/**
 * Routes de RBAC - Gerenciamento de Roles e Permissões
 * Sistema de Gestão Escolar - Fase 4
 */

import { Router } from 'express';
import roleService from '../services/role.service';
import permissionService from '../services/permission.service';
import { requirePermission, permissions, requireMinLevel } from '../middlewares/authorization';
import { z } from 'zod';
import { securityLogger } from '../lib/logger';

export const rbacRouter = Router();

// ============================================
// ROLES
// ============================================

/**
 * GET /api/rbac/roles - Listar todas as roles
 */
rbacRouter.get('/roles', requirePermission(permissions.roles.list), async (req, res) => {
  try {
    const roles = await roleService.listAll();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar roles' });
  }
});

/**
 * GET /api/rbac/roles/:id - Buscar role por ID
 */
rbacRouter.get('/roles/:id', requirePermission(permissions.roles.read), async (req, res) => {
  try {
    const { id } = req.params;
    const role = await roleService.findById(id);
    res.json(role);
  } catch (error: any) {
    if (error.message === 'Role não encontrada') {
      return res.status(404).json({ error: 'Role não encontrada' });
    }
    res.status(500).json({ error: 'Erro ao buscar role' });
  }
});

/**
 * POST /api/rbac/roles - Criar nova role
 */
const createRoleSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().optional(),
  level: z.number().min(0).max(100).optional(),
});

rbacRouter.post('/roles', requirePermission(permissions.roles.create), async (req, res) => {
  try {
    const data = createRoleSchema.parse(req.body);
    const role = await roleService.create(data);

    securityLogger.info(
      { userId: req.userId, roleId: role.id, roleName: role.name },
      'Nova role criada'
    );

    res.status(201).json(role);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    if (error.message === 'Role já existe') {
      return res.status(409).json({ error: 'Role já existe' });
    }
    res.status(500).json({ error: 'Erro ao criar role' });
  }
});

/**
 * PUT /api/rbac/roles/:id - Atualizar role
 */
rbacRouter.put('/roles/:id', requirePermission(permissions.roles.update), async (req, res) => {
  try {
    const { id } = req.params;
    const data = createRoleSchema.partial().parse(req.body);

    const role = await roleService.update(id, data);

    securityLogger.info({ userId: req.userId, roleId: id }, 'Role atualizada');

    res.json(role);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    if (error.message === 'Roles do sistema não podem ser editadas') {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erro ao atualizar role' });
  }
});

/**
 * DELETE /api/rbac/roles/:id - Deletar role
 */
rbacRouter.delete('/roles/:id', requirePermission(permissions.roles.delete), async (req, res) => {
  try {
    const { id } = req.params;
    await roleService.delete(id);

    securityLogger.warn({ userId: req.userId, roleId: id }, 'Role deletada');

    res.status(204).send();
  } catch (error: any) {
    if (error.message.includes('sistema')) {
      return res.status(403).json({ error: error.message });
    }
    if (error.message.includes('usuários associados')) {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erro ao deletar role' });
  }
});

// ============================================
// ROLE PERMISSIONS
// ============================================

/**
 * POST /api/rbac/roles/:id/permissions - Adicionar permissão a role
 */
const addPermissionSchema = z.object({
  permissionId: z.string().uuid(),
});

rbacRouter.post(
  '/roles/:id/permissions',
  requirePermission(permissions.roles.update),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { permissionId } = addPermissionSchema.parse(req.body);

      await roleService.addPermission(id, permissionId);

      securityLogger.info(
        { userId: req.userId, roleId: id, permissionId },
        'Permissão adicionada à role'
      );

      res.status(201).json({ message: 'Permissão adicionada com sucesso' });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
      }
      res.status(500).json({ error: 'Erro ao adicionar permissão' });
    }
  }
);

/**
 * DELETE /api/rbac/roles/:id/permissions/:permissionId - Remover permissão de role
 */
rbacRouter.delete(
  '/roles/:id/permissions/:permissionId',
  requirePermission(permissions.roles.update),
  async (req, res) => {
    try {
      const { id, permissionId } = req.params;

      await roleService.removePermission(id, permissionId);

      securityLogger.warn(
        { userId: req.userId, roleId: id, permissionId },
        'Permissão removida da role'
      );

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Erro ao remover permissão' });
    }
  }
);

/**
 * PUT /api/rbac/roles/:id/permissions - Sincronizar permissões (substituir todas)
 */
const syncPermissionsSchema = z.object({
  permissionIds: z.array(z.string().uuid()),
});

rbacRouter.put(
  '/roles/:id/permissions',
  requirePermission(permissions.roles.update),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { permissionIds } = syncPermissionsSchema.parse(req.body);

      await roleService.syncPermissions(id, permissionIds);

      securityLogger.info(
        { userId: req.userId, roleId: id, permissionsCount: permissionIds.length },
        'Permissões sincronizadas'
      );

      res.json({ message: 'Permissões sincronizadas com sucesso' });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
      }
      res.status(500).json({ error: 'Erro ao sincronizar permissões' });
    }
  }
);

// ============================================
// USER ROLES
// ============================================

/**
 * POST /api/rbac/users/:userId/roles - Atribuir role a usuário
 */
const assignRoleSchema = z.object({
  roleId: z.string().uuid(),
  userType: z.enum(['aluno', 'professor', 'funcionario', 'equipe_diretiva']),
});

rbacRouter.post(
  '/users/:userId/roles',
  requireMinLevel(70), // Apenas coordenadores ou superiores
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { roleId, userType } = assignRoleSchema.parse(req.body);

      await roleService.assignToUser(userId, roleId, userType);

      securityLogger.info(
        { adminId: req.userId, userId, roleId, userType },
        'Role atribuída ao usuário'
      );

      res.status(201).json({ message: 'Role atribuída com sucesso' });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
      }
      res.status(500).json({ error: 'Erro ao atribuir role' });
    }
  }
);

/**
 * DELETE /api/rbac/users/:userId/roles/:roleId - Remover role de usuário
 */
rbacRouter.delete(
  '/users/:userId/roles/:roleId',
  requireMinLevel(70),
  async (req, res) => {
    try {
      const { userId, roleId } = req.params;

      await roleService.removeFromUser(userId, roleId);

      securityLogger.warn(
        { adminId: req.userId, userId, roleId },
        'Role removida do usuário'
      );

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Erro ao remover role' });
    }
  }
);

/**
 * GET /api/rbac/users/:userId/roles - Listar roles de um usuário
 */
rbacRouter.get('/users/:userId/roles', requireMinLevel(50), async (req, res) => {
  try {
    const { userId } = req.params;
    const roles = await roleService.getUserRoles(userId);
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar roles do usuário' });
  }
});

/**
 * GET /api/rbac/users/:userId/permissions - Listar permissões de um usuário
 */
rbacRouter.get('/users/:userId/permissions', requireMinLevel(50), async (req, res) => {
  try {
    const { userId } = req.params;
    const permissions = await roleService.getUserPermissions(userId);
    res.json({ permissions });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar permissões do usuário' });
  }
});

// ============================================
// PERMISSIONS
// ============================================

/**
 * GET /api/rbac/permissions - Listar todas as permissões
 */
rbacRouter.get(
  '/permissions',
  requirePermission(permissions.permissions.list),
  async (req, res) => {
    try {
      const { resource, action } = req.query;
      const permissionsList = await permissionService.listAll({
        resource: resource as string,
        action: action as string,
      });
      res.json(permissionsList);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar permissões' });
    }
  }
);

/**
 * GET /api/rbac/permissions/grouped - Listar permissões agrupadas por recurso
 */
rbacRouter.get(
  '/permissions/grouped',
  requirePermission(permissions.permissions.list),
  async (req, res) => {
    try {
      const grouped = await permissionService.groupByResource();
      res.json(grouped);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao agrupar permissões' });
    }
  }
);

/**
 * GET /api/rbac/permissions/:id - Buscar permissão por ID
 */
rbacRouter.get(
  '/permissions/:id',
  requirePermission(permissions.permissions.read),
  async (req, res) => {
    try {
      const { id } = req.params;
      const permission = await permissionService.findById(id);
      res.json(permission);
    } catch (error: any) {
      if (error.message === 'Permissão não encontrada') {
        return res.status(404).json({ error: 'Permissão não encontrada' });
      }
      res.status(500).json({ error: 'Erro ao buscar permissão' });
    }
  }
);

/**
 * POST /api/rbac/permissions - Criar nova permissão
 */
const createPermissionSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  resource: z.string().min(2),
  action: z.string().min(2),
});

rbacRouter.post(
  '/permissions',
  requirePermission(permissions.permissions.create),
  async (req, res) => {
    try {
      const data = createPermissionSchema.parse(req.body);
      const permission = await permissionService.create(data);

      securityLogger.info(
        { userId: req.userId, permissionId: permission.id, permissionName: permission.name },
        'Nova permissão criada'
      );

      res.status(201).json(permission);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
      }
      if (error.message === 'Permissão já existe') {
        return res.status(409).json({ error: 'Permissão já existe' });
      }
      res.status(500).json({ error: 'Erro ao criar permissão' });
    }
  }
);

/**
 * PUT /api/rbac/permissions/:id - Atualizar permissão
 */
rbacRouter.put(
  '/permissions/:id',
  requirePermission(permissions.permissions.update),
  async (req, res) => {
    try {
      const { id } = req.params;
      const data = createPermissionSchema.partial().parse(req.body);

      const permission = await permissionService.update(id, data);

      securityLogger.info({ userId: req.userId, permissionId: id }, 'Permissão atualizada');

      res.json(permission);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
      }
      res.status(500).json({ error: 'Erro ao atualizar permissão' });
    }
  }
);

/**
 * DELETE /api/rbac/permissions/:id - Deletar permissão
 */
rbacRouter.delete(
  '/permissions/:id',
  requirePermission(permissions.permissions.delete),
  async (req, res) => {
    try {
      const { id } = req.params;
      await permissionService.delete(id);

      securityLogger.warn({ userId: req.userId, permissionId: id }, 'Permissão deletada');

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Erro ao deletar permissão' });
    }
  }
);
