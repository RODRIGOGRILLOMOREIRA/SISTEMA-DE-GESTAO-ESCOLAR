/**
 * Role Service - Gerenciamento de Roles e Permissões
 * Sistema de Gestão Escolar - Fase 4 - RBAC Granular
 */

import { prisma } from '../lib/prisma';
import { log, securityLogger } from '../lib/logger';

export interface Role {
  id: string;
  name: string;
  description: string | null;
  level: number;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoleDTO {
  name: string;
  description?: string;
  level?: number;
}

class RoleService {
  /**
   * Listar todas as roles
   */
  async listAll() {
    try {
      const roles = await prisma.role.findMany({
        orderBy: { level: 'desc' },
        include: {
          _count: {
            select: {
              permissions: true,
              users: true,
            },
          },
        },
      });

      log.info({ count: roles.length }, 'Roles listadas');
      return roles;
    } catch (error) {
      log.error({ error }, 'Erro ao listar roles');
      throw error;
    }
  }

  /**
   * Buscar role por ID
   */
  async findById(id: string) {
    try {
      const role = await prisma.role.findUnique({
        where: { id },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
          users: true,
          _count: {
            select: {
              permissions: true,
              users: true,
            },
          },
        },
      });

      if (!role) {
        throw new Error('Role não encontrada');
      }

      return role;
    } catch (error) {
      log.error({ error, id }, 'Erro ao buscar role');
      throw error;
    }
  }

  /**
   * Buscar role por nome
   */
  async findByName(name: string) {
    try {
      const role = await prisma.role.findUnique({
        where: { name },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      return role;
    } catch (error) {
      log.error({ error, name }, 'Erro ao buscar role por nome');
      throw error;
    }
  }

  /**
   * Criar nova role
   */
  async create(data: CreateRoleDTO) {
    try {
      // Verificar se já existe
      const exists = await this.findByName(data.name);
      if (exists) {
        throw new Error('Role já existe');
      }

      const role = await prisma.role.create({
        data: {
          ...data,
          level: data.level || 0,
        },
      });

      securityLogger.info({ roleId: role.id, name: role.name }, 'Role criada');
      return role;
    } catch (error) {
      log.error({ error, data }, 'Erro ao criar role');
      throw error;
    }
  }

  /**
   * Atualizar role
   */
  async update(id: string, data: Partial<CreateRoleDTO>) {
    try {
      // Verificar se é role do sistema
      const role = await this.findById(id);
      if (role.isSystem) {
        throw new Error('Roles do sistema não podem ser editadas');
      }

      const updated = await prisma.role.update({
        where: { id },
        data,
      });

      securityLogger.info({ roleId: id }, 'Role atualizada');
      return updated;
    } catch (error) {
      log.error({ error, id, data }, 'Erro ao atualizar role');
      throw error;
    }
  }

  /**
   * Deletar role
   */
  async delete(id: string) {
    try {
      // Verificar se é role do sistema
      const role = await this.findById(id);
      if (role.isSystem) {
        throw new Error('Roles do sistema não podem ser deletadas');
      }

      // Verificar se tem usuários
      if (role._count.users > 0) {
        throw new Error('Não é possível deletar role com usuários associados');
      }

      await prisma.role.delete({
        where: { id },
      });

      securityLogger.warn({ roleId: id, roleName: role.name }, 'Role deletada');
    } catch (error) {
      log.error({ error, id }, 'Erro ao deletar role');
      throw error;
    }
  }

  /**
   * Adicionar permissão a uma role
   */
  async addPermission(roleId: string, permissionId: string) {
    try {
      const rolePermission = await prisma.rolePermission.create({
        data: {
          roleId,
          permissionId,
        },
      });

      securityLogger.info({ roleId, permissionId }, 'Permissão adicionada à role');
      return rolePermission;
    } catch (error) {
      log.error({ error, roleId, permissionId }, 'Erro ao adicionar permissão');
      throw error;
    }
  }

  /**
   * Remover permissão de uma role
   */
  async removePermission(roleId: string, permissionId: string) {
    try {
      await prisma.rolePermission.deleteMany({
        where: {
          roleId,
          permissionId,
        },
      });

      securityLogger.warn({ roleId, permissionId }, 'Permissão removida da role');
    } catch (error) {
      log.error({ error, roleId, permissionId }, 'Erro ao remover permissão');
      throw error;
    }
  }

  /**
   * Atribuir role a um usuário
   */
  async assignToUser(userId: string, roleId: string, userType: string) {
    try {
      const userRole = await prisma.userRole.upsert({
        where: {
          userId_roleId: {
            userId,
            roleId,
          },
        },
        update: {},
        create: {
          userId,
          roleId,
          userType,
        },
      });

      securityLogger.info({ userId, roleId, userType }, 'Role atribuída ao usuário');
      return userRole;
    } catch (error) {
      log.error({ error, userId, roleId }, 'Erro ao atribuir role');
      throw error;
    }
  }

  /**
   * Remover role de um usuário
   */
  async removeFromUser(userId: string, roleId: string) {
    try {
      await prisma.userRole.deleteMany({
        where: {
          userId,
          roleId,
        },
      });

      securityLogger.warn({ userId, roleId }, 'Role removida do usuário');
    } catch (error) {
      log.error({ error, userId, roleId }, 'Erro ao remover role do usuário');
      throw error;
    }
  }

  /**
   * Obter roles de um usuário
   */
  async getUserRoles(userId: string) {
    try {
      const userRoles = await prisma.userRole.findMany({
        where: { userId },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      return userRoles.map((ur) => ur.role);
    } catch (error) {
      log.error({ error, userId }, 'Erro ao buscar roles do usuário');
      throw error;
    }
  }

  /**
   * Obter todas as permissões de um usuário (via roles)
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    try {
      const roles = await this.getUserRoles(userId);

      const permissions = new Set<string>();

      for (const role of roles) {
        for (const rp of role.permissions) {
          permissions.add(rp.permission.name);
        }
      }

      return Array.from(permissions);
    } catch (error) {
      log.error({ error, userId }, 'Erro ao buscar permissões do usuário');
      throw error;
    }
  }

  /**
   * Verificar se usuário tem permissão específica
   */
  async hasPermission(userId: string, permissionName: string): Promise<boolean> {
    try {
      const permissions = await this.getUserPermissions(userId);
      return permissions.includes(permissionName);
    } catch (error) {
      log.error({ error, userId, permissionName }, 'Erro ao verificar permissão');
      return false;
    }
  }

  /**
   * Verificar se usuário tem qualquer uma das permissões listadas
   */
  async hasAnyPermission(userId: string, permissionNames: string[]): Promise<boolean> {
    try {
      const permissions = await this.getUserPermissions(userId);
      return permissionNames.some((p) => permissions.includes(p));
    } catch (error) {
      log.error({ error, userId, permissionNames }, 'Erro ao verificar permissões');
      return false;
    }
  }

  /**
   * Verificar se usuário tem todas as permissões listadas
   */
  async hasAllPermissions(userId: string, permissionNames: string[]): Promise<boolean> {
    try {
      const permissions = await this.getUserPermissions(userId);
      return permissionNames.every((p) => permissions.includes(p));
    } catch (error) {
      log.error({ error, userId, permissionNames }, 'Erro ao verificar permissões');
      return false;
    }
  }

  /**
   * Sincronizar permissões de uma role (substituir todas)
   */
  async syncPermissions(roleId: string, permissionIds: string[]) {
    try {
      // Remover todas as permissões atuais
      await prisma.rolePermission.deleteMany({
        where: { roleId },
      });

      // Adicionar novas permissões
      const rolePermissions = permissionIds.map((permissionId) => ({
        roleId,
        permissionId,
      }));

      await prisma.rolePermission.createMany({
        data: rolePermissions,
      });

      securityLogger.info(
        { roleId, permissionsCount: permissionIds.length },
        'Permissões sincronizadas'
      );
    } catch (error) {
      log.error({ error, roleId, permissionIds }, 'Erro ao sincronizar permissões');
      throw error;
    }
  }
}

export default new RoleService();
