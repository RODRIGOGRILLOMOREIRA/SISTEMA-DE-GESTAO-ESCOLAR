import { PrismaClient } from '@prisma/client';
import { log } from '../lib/logger';

const prisma = new PrismaClient();

/**
 * RBAC Service - Sistema de Controle de Acesso Baseado em Roles (Fase 4)
 * 
 * Funcionalidades:
 * - Verificar se usuário tem permissão específica
 * - Gerenciar roles e permissões
 * - Atribuir/remover roles de usuários
 * - Sistema hierárquico de roles
 */

export interface PermissionCheck {
  resource: string;  // Ex: 'alunos', 'turmas', 'notas'
  action: string;    // Ex: 'create', 'read', 'update', 'delete', 'export'
}

export interface CreateRoleData {
  name: string;
  description?: string;
  level?: number;
  permissionIds?: string[];
}

export interface CreatePermissionData {
  resource: string;
  action: string;
  description?: string;
}

class RBACService {
  /**
   * Verifica se um usuário tem uma permissão específica
   */
  async hasPermission(
    userId: string, 
    resource: string, 
    action: string
  ): Promise<boolean> {
    try {
      // Buscar roles do usuário
      const userRoles = await prisma.userRole.findMany({
        where: { userId },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true
                }
              }
            }
          }
        }
      });

      // Verificar se alguma role tem a permissão
      for (const userRole of userRoles) {
        const hasPermission = userRole.role.permissions.some(rp => 
          rp.permission.resource === resource && 
          rp.permission.action === action
        );

        if (hasPermission) {
          log.debug({ userId, resource, action, role: userRole.role.name }, 'Permission granted');
          return true;
        }

        // Verificar permissão wildcard (resource:*)
        const hasWildcard = userRole.role.permissions.some(rp => 
          rp.permission.resource === resource && 
          rp.permission.action === '*'
        );

        if (hasWildcard) {
          log.debug({ userId, resource, action: '*', role: userRole.role.name }, 'Wildcard permission granted');
          return true;
        }

        // Verificar permissão admin global (*:*)
        const isAdmin = userRole.role.permissions.some(rp => 
          rp.permission.resource === '*' && 
          rp.permission.action === '*'
        );

        if (isAdmin) {
          log.debug({ userId, role: userRole.role.name }, 'Admin permission granted');
          return true;
        }
      }

      log.debug({ userId, resource, action }, 'Permission denied');
      return false;

    } catch (error) {
      log.error({ err: error, userId, resource, action }, 'Error checking permission');
      return false;
    }
  }

  /**
   * Verifica múltiplas permissões de uma vez
   */
  async hasAnyPermission(
    userId: string, 
    permissions: PermissionCheck[]
  ): Promise<boolean> {
    for (const perm of permissions) {
      const has = await this.hasPermission(userId, perm.resource, perm.action);
      if (has) return true;
    }
    return false;
  }

  /**
   * Verifica se tem todas as permissões
   */
  async hasAllPermissions(
    userId: string, 
    permissions: PermissionCheck[]
  ): Promise<boolean> {
    for (const perm of permissions) {
      const has = await this.hasPermission(userId, perm.resource, perm.action);
      if (!has) return false;
    }
    return true;
  }

  /**
   * Criar nova role
   */
  async createRole(data: CreateRoleData) {
    try {
      const role = await prisma.role.create({
        data: {
          name: data.name,
          description: data.description,
          level: data.level || 0,
          permissions: data.permissionIds ? {
            create: data.permissionIds.map(permId => ({
              permissionId: permId
            }))
          } : undefined
        },
        include: {
          permissions: {
            include: {
              permission: true
            }
          }
        }
      });

      log.info({ roleId: role.id, name: role.name }, 'Role created');
      return role;

    } catch (error) {
      log.error({ err: error, data }, 'Error creating role');
      throw error;
    }
  }

  /**
   * Criar nova permissão
   */
  async createPermission(data: CreatePermissionData) {
    try {
      const permission = await prisma.permission.create({
        data: {
          resource: data.resource,
          action: data.action,
          description: data.description
        }
      });

      log.info({ permissionId: permission.id, resource: data.resource, action: data.action }, 'Permission created');
      return permission;

    } catch (error) {
      log.error({ err: error, data }, 'Error creating permission');
      throw error;
    }
  }

  /**
   * Atribuir role a um usuário
   */
  async assignRoleToUser(userId: string, roleId: string, userType: string = 'usuarios') {
    try {
      const userRole = await prisma.userRole.create({
        data: {
          userId,
          roleId,
          userType
        },
        include: {
          role: true
        }
      });

      log.info({ userId, roleId, roleName: userRole.role.name }, 'Role assigned to user');
      return userRole;

    } catch (error) {
      log.error({ err: error, userId, roleId }, 'Error assigning role');
      throw error;
    }
  }

  /**
   * Remover role de um usuário
   */
  async removeRoleFromUser(userId: string, roleId: string) {
    try {
      await prisma.userRole.deleteMany({
        where: {
          userId,
          roleId
        }
      });

      log.info({ userId, roleId }, 'Role removed from user');

    } catch (error) {
      log.error({ err: error, userId, roleId }, 'Error removing role');
      throw error;
    }
  }

  /**
   * Listar todas as roles
   */
  async listRoles() {
    return await prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true
          }
        },
        _count: {
          select: { users: true }
        }
      },
      orderBy: {
        level: 'desc'
      }
    });
  }

  /**
   * Listar todas as permissões
   */
  async listPermissions() {
    return await prisma.permission.findMany({
      include: {
        _count: {
          select: { roles: true }
        }
      },
      orderBy: [
        { resource: 'asc' },
        { action: 'asc' }
      ]
    });
  }

  /**
   * Obter roles de um usuário
   */
  async getUserRoles(userId: string) {
    return await prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    });
  }

  /**
   * Obter todas as permissões de um usuário (através de suas roles)
   */
  async getUserPermissions(userId: string) {
    const userRoles = await this.getUserRoles(userId);
    
    const permissions = new Set<string>();
    
    userRoles.forEach(userRole => {
      userRole.role.permissions.forEach(rp => {
        permissions.add(`${rp.permission.resource}:${rp.permission.action}`);
      });
    });

    return Array.from(permissions);
  }

  /**
   * Adicionar permissão a uma role
   */
  async addPermissionToRole(roleId: string, permissionId: string) {
    try {
      const rolePermission = await prisma.rolePermission.create({
        data: {
          roleId,
          permissionId
        },
        include: {
          role: true,
          permission: true
        }
      });

      log.info({ 
        roleId, 
        roleName: rolePermission.role.name,
        permission: `${rolePermission.permission.resource}:${rolePermission.permission.action}` 
      }, 'Permission added to role');

      return rolePermission;

    } catch (error) {
      log.error({ err: error, roleId, permissionId }, 'Error adding permission to role');
      throw error;
    }
  }

  /**
   * Remover permissão de uma role
   */
  async removePermissionFromRole(roleId: string, permissionId: string) {
    try {
      await prisma.rolePermission.deleteMany({
        where: {
          roleId,
          permissionId
        }
      });

      log.info({ roleId, permissionId }, 'Permission removed from role');

    } catch (error) {
      log.error({ err: error, roleId, permissionId }, 'Error removing permission from role');
      throw error;
    }
  }
}

// Singleton
export const rbacService = new RBACService();
export default rbacService;
