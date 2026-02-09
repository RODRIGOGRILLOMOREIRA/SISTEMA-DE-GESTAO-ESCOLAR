/**
 * =======================================
 * SERVIÇO DE PRESENÇA ONLINE
 * =======================================
 * 
 * Rastreamento de usuários online em tempo real
 * Last seen, typing indicators, status
 */

import redis from '../lib/redis';
import { log } from '../lib/logger';

export interface OnlineUser {
  userId: string;
  userName: string;
  userType: 'aluno' | 'professor' | 'admin';
  status: 'online' | 'away' | 'busy';
  lastActivity: Date;
  socketId?: string;
}

/**
 * Registrar usuário como online
 */
export async function setUserOnline(
  userId: string,
  userData: Partial<OnlineUser>
): Promise<void> {
  try {
    const timestamp = Date.now();
    
    // Adicionar ao sorted set de usuários online (score = timestamp)
    await redis.zadd('presence:online', timestamp, userId);
    
    // Salvar dados do usuário
    await redis.setex(
      `presence:user:${userId}`,
      300, // 5 minutos de TTL
      JSON.stringify({
        userId,
        ...userData,
        status: 'online',
        lastActivity: new Date(timestamp),
      })
    );
    
    log.info({ userId, userName: userData.userName }, '🟢 Usuário online');
  } catch (error) {
    log.error({ err: error, userId }, 'Erro ao registrar usuário online');
  }
}

/**
 * Registrar usuário como offline
 */
export async function setUserOffline(userId: string): Promise<void> {
  try {
    // Remover do sorted set
    await redis.zrem('presence:online', userId);
    
    // Salvar last seen
    await redis.set(`presence:lastseen:${userId}`, Date.now());
    
    // Deletar dados de presença
    await redis.del(`presence:user:${userId}`);
    
    log.info({ userId }, '🔴 Usuário offline');
  } catch (error) {
    log.error({ err: error, userId }, 'Erro ao registrar usuário offline');
  }
}

/**
 * Atualizar última atividade do usuário
 */
export async function updateActivity(userId: string): Promise<void> {
  try {
    const timestamp = Date.now();
    
    // Atualizar score no sorted set
    await redis.zadd('presence:online', timestamp, userId);
    
    // Atualizar dados do usuário
    const userData = await redis.get(`presence:user:${userId}`);
    if (userData) {
      const user = JSON.parse(userData);
      user.lastActivity = new Date(timestamp);
      await redis.setex(`presence:user:${userId}`, 300, JSON.stringify(user));
    }
  } catch (error) {
    log.error({ err: error, userId }, 'Erro ao atualizar atividade');
  }
}

/**
 * Mudar status do usuário
 */
export async function changeUserStatus(
  userId: string,
  status: 'online' | 'away' | 'busy'
): Promise<void> {
  try {
    const userData = await redis.get(`presence:user:${userId}`);
    if (userData) {
      const user = JSON.parse(userData);
      user.status = status;
      await redis.setex(`presence:user:${userId}`, 300, JSON.stringify(user));
      
      log.info({ userId, status }, 'Status atualizado');
    }
  } catch (error) {
    log.error({ err: error, userId, status }, 'Erro ao mudar status');
  }
}

/**
 * Obter todos os usuários online
 */
export async function getOnlineUsers(): Promise<OnlineUser[]> {
  try {
    // Remover usuários inativos (mais de 5 minutos)
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    await redis.zremrangebyscore('presence:online', '-inf', fiveMinutesAgo);
    
    // Obter IDs dos usuários online
    const userIds = await redis.zrevrange('presence:online', 0, -1);
    
    // Buscar dados de cada usuário
    const users: OnlineUser[] = [];
    for (const userId of userIds) {
      const userData = await redis.get(`presence:user:${userId}`);
      if (userData) {
        users.push(JSON.parse(userData));
      }
    }
    
    return users;
  } catch (error) {
    log.error({ err: error }, 'Erro ao obter usuários online');
    return [];
  }
}

/**
 * Obter contagem de usuários online
 */
export async function getOnlineCount(): Promise<number> {
  try {
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    await redis.zremrangebyscore('presence:online', '-inf', fiveMinutesAgo);
    
    return await redis.zcard('presence:online');
  } catch (error) {
    log.error({ err: error }, 'Erro ao contar usuários online');
    return 0;
  }
}

/**
 * Verificar se usuário está online
 */
export async function isUserOnline(userId: string): Promise<boolean> {
  try {
    const score = await redis.zscore('presence:online', userId);
    
    if (!score) return false;
    
    // Verificar se está ativo nos últimos 5 minutos
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    return parseFloat(score) > fiveMinutesAgo;
  } catch (error) {
    log.error({ err: error, userId }, 'Erro ao verificar se usuário está online');
    return false;
  }
}

/**
 * Obter last seen de um usuário
 */
export async function getUserLastSeen(userId: string): Promise<Date | null> {
  try {
    // Se está online, retornar now
    if (await isUserOnline(userId)) {
      return new Date();
    }
    
    // Buscar last seen
    const lastSeen = await redis.get(`presence:lastseen:${userId}`);
    return lastSeen ? new Date(parseInt(lastSeen)) : null;
  } catch (error) {
    log.error({ err: error, userId }, 'Erro ao obter last seen');
    return null;
  }
}

/**
 * Registrar typing indicator
 */
export async function setTyping(
  userId: string,
  chatId: string,
  isTyping: boolean
): Promise<void> {
  try {
    const key = `presence:typing:${chatId}:${userId}`;
    
    if (isTyping) {
      await redis.setex(key, 5, '1'); // Expira em 5 segundos
    } else {
      await redis.del(key);
    }
  } catch (error) {
    log.error({ err: error, userId, chatId }, 'Erro ao registrar typing');
  }
}

/**
 * Obter quem está digitando em um chat
 */
export async function getTypingUsers(chatId: string): Promise<string[]> {
  try {
    const pattern = `presence:typing:${chatId}:*`;
    const keys = await redis.keys(pattern);
    
    return keys.map(key => {
      const parts = key.split(':');
      return parts[parts.length - 1];
    });
  } catch (error) {
    log.error({ err: error, chatId }, 'Erro ao obter typing users');
    return [];
  }
}

/**
 * Obter estatísticas de presença
 */
export async function getPresenceStats(): Promise<any> {
  try {
    const onlineCount = await getOnlineCount();
    const users = await getOnlineUsers();
    
    // Agrupar por tipo
    const byType = users.reduce((acc: any, user) => {
      acc[user.userType] = (acc[user.userType] || 0) + 1;
      return acc;
    }, {});
    
    // Agrupar por status
    const byStatus = users.reduce((acc: any, user) => {
      acc[user.status] = (acc[user.status] || 0) + 1;
      return acc;
    }, {});
    
    return {
      total: onlineCount,
      byType,
      byStatus,
      users: users.slice(0, 20), // Primeiros 20
    };
  } catch (error) {
    log.error({ err: error }, 'Erro ao obter estatísticas de presença');
    return { total: 0, byType: {}, byStatus: {}, users: [] };
  }
}

/**
 * Limpar usuários inativos (job periódico)
 */
export async function cleanupInactiveUsers(): Promise<void> {
  try {
    const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
    const removed = await redis.zremrangebyscore('presence:online', '-inf', tenMinutesAgo);
    
    if (removed > 0) {
      log.info({ removed }, '🧹 Usuários inativos removidos');
    }
  } catch (error) {
    log.error({ err: error }, 'Erro ao limpar usuários inativos');
  }
}

export default {
  setUserOnline,
  setUserOffline,
  updateActivity,
  changeUserStatus,
  getOnlineUsers,
  getOnlineCount,
  isUserOnline,
  getUserLastSeen,
  setTyping,
  getTypingUsers,
  getPresenceStats,
  cleanupInactiveUsers,
};
