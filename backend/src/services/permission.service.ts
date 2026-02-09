/**
 * Permission Service - Gerenciamento de Permissões
 * Sistema de Gestão Escolar - Fase 4 - RBAC Granular
 */

import { prisma } from '../lib/prisma';
import { log } from '../lib/logger';

export interface Permission {
  id: string;
  name: string;
  description: string | null;
  resource: string;
  action: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePermissionDTO {
  name: string;
  description?: string;
  resource: string;
  action: string;
}

class PermissionService {
  /**
   * Listar todas as permissões
   */
  async listAll(filters?: { resource?: string; action?: string }) {
    try {
      const where: any = {};

      if (filters?.resource) {
        where.resource = filters.resource;
      }

      if (filters?.action) {
        where.action = filters.action;
      }

      const permissions = await prisma.permission.findMany({
        where,
        orderBy: [{ resource: 'asc' }, { action: 'asc' }],
      });

      log.info({ count: permissions.length, filters }, 'Permissões listadas');
      return permissions;
    } catch (error) {
      log.error({ error }, 'Erro ao listar permissões');
      throw error;
    }
  }

  /**
   * Buscar permissão por ID
   */
  async findById(id: string) {
    try {
      const permission = await prisma.permission.findUnique({
        where: { id },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!permission) {
        throw new Error('Permissão não encontrada');
      }

      return permission;
    } catch (error) {
      log.error({ error, id }, 'Erro ao buscar permissão');
      throw error;
    }
  }

  /**
   * Buscar permissão por nome
   */
  async findByName(name: string) {
    try {
      const permission = await prisma.permission.findUnique({
        where: { name },
      });

      return permission;
    } catch (error) {
      log.error({ error, name }, 'Erro ao buscar permissão por nome');
      throw error;
    }
  }

  /**
   * Criar nova permissão
   */
  async create(data: CreatePermissionDTO) {
    try {
      // Verificar se já existe
      const exists = await this.findByName(data.name);
      if (exists) {
        throw new Error('Permissão já existe');
      }

      const permission = await prisma.permission.create({
        data,
      });

      log.info({ permissionId: permission.id, name: permission.name }, 'Permissão criada');
      return permission;
    } catch (error) {
      log.error({ error, data }, 'Erro ao criar permissão');
      throw error;
    }
  }

  /**
   * Atualizar permissão
   */
  async update(id: string, data: Partial<CreatePermissionDTO>) {
    try {
      const permission = await prisma.permission.update({
        where: { id },
        data,
      });

      log.info({ permissionId: id }, 'Permissão atualizada');
      return permission;
    } catch (error) {
      log.error({ error, id, data }, 'Erro ao atualizar permissão');
      throw error;
    }
  }

  /**
   * Deletar permissão
   */
  async delete(id: string) {
    try {
      await prisma.permission.delete({
        where: { id },
      });

      log.info({ permissionId: id }, 'Permissão deletada');
    } catch (error) {
      log.error({ error, id }, 'Erro ao deletar permissão');
      throw error;
    }
  }

  /**
   * Agrupar permissões por recurso
   */
  async groupByResource() {
    try {
      const permissions = await this.listAll();

      const grouped: Record<string, Permission[]> = {};

      for (const permission of permissions) {
        if (!grouped[permission.resource]) {
          grouped[permission.resource] = [];
        }
        grouped[permission.resource].push(permission);
      }

      return grouped;
    } catch (error) {
      log.error({ error }, 'Erro ao agrupar permissões');
      throw error;
    }
  }

  /**
   * Verificar se permissão existe
   */
  async exists(name: string): Promise<boolean> {
    try {
      const permission = await this.findByName(name);
      return !!permission;
    } catch (error) {
      return false;
    }
  }

  /**
   * Criar múltiplas permissões em lote
   */
  async createMany(permissions: CreatePermissionDTO[]) {
    try {
      const result = await prisma.permission.createMany({
        data: permissions,
        skipDuplicates: true,
      });

      log.info({ count: result.count }, 'Permissões criadas em lote');
      return result;
    } catch (error) {
      log.error({ error, permissions }, 'Erro ao criar permissões em lote');
      throw error;
    }
  }
}

export default new PermissionService();
