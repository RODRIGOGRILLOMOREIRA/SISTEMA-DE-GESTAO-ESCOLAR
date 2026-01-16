/**
 * ==============================================
 * WEBSOCKET - SISTEMA EM TEMPO REAL COM REDIS
 * ==============================================
 * 
 * Pub/Sub do Redis + Socket.IO para:
 * - Notificações instantâneas
 * - Presença online
 * - Chat em tempo real
 * - Dashboard ao vivo
 */

import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import redis from './redis';
import { log } from './logger';

let io: SocketServer;
let redisSubscriber: any;

// Tipos de eventos
export enum WebSocketEvents {
  // Notificações
  NOTIFICATION = 'notification',
  NOTIFICATION_READ = 'notification:read',
  
  // Presença Online
  USER_ONLINE = 'user:online',
  USER_OFFLINE = 'user:offline',
  USER_TYPING = 'user:typing',
  
  // Chat
  CHAT_MESSAGE = 'chat:message',
  CHAT_MESSAGE_RECEIVED = 'chat:message:received',
  CHAT_TYPING = 'chat:typing',
  
  // Dashboard
  DASHBOARD_UPDATE = 'dashboard:update',
  STATS_UPDATE = 'stats:update',
  
  // Gamificação
  BADGE_EARNED = 'badge:earned',
  LEVEL_UP = 'level:up',
  ACHIEVEMENT = 'achievement',
}

/**
 * Inicializar WebSocket Server
 */
export function initializeWebSocket(httpServer: HttpServer): SocketServer {
  io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5174',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Configurar Pub/Sub do Redis
  setupRedisPubSub();

  // Eventos de conexão
  io.on('connection', (socket: Socket) => {
    handleConnection(socket);
  });

  log.info({ component: 'websocket' }, '✅ WebSocket Server inicializado');
  
  return io;
}

/**
 * Setup Redis Pub/Sub
 */
function setupRedisPubSub() {
  try {
    // Criar subscriber separado para Pub/Sub
    redisSubscriber = redis.duplicate();
    
    // Subscribir aos canais
    redisSubscriber.subscribe(
      'notifications',
      'presence',
      'chat',
      'dashboard',
      'gamification'
    );

    redisSubscriber.on('message', (channel: string, message: string) => {
      try {
        const data = JSON.parse(message);
        handleRedisMessage(channel, data);
      } catch (error) {
        log.error({ err: error, channel }, 'Erro ao processar mensagem Redis');
      }
    });

    log.info({ component: 'redis-pubsub' }, '✅ Redis Pub/Sub configurado');
  } catch (error) {
    log.warn({ err: error }, '⚠️ Redis Pub/Sub não disponível, usando modo local');
  }
}

/**
 * Processar mensagens do Redis
 */
function handleRedisMessage(channel: string, data: any) {
  switch (channel) {
    case 'notifications':
      // Enviar notificação para usuário específico
      io.to(`user:${data.userId}`).emit(WebSocketEvents.NOTIFICATION, data);
      break;
      
    case 'presence':
      // Atualizar presença online
      io.emit(WebSocketEvents.USER_ONLINE, data);
      break;
      
    case 'chat':
      // Enviar mensagem de chat
      io.to(`chat:${data.chatId}`).emit(WebSocketEvents.CHAT_MESSAGE, data);
      break;
      
    case 'dashboard':
      // Atualizar dashboard
      io.emit(WebSocketEvents.DASHBOARD_UPDATE, data);
      break;
      
    case 'gamification':
      // Notificar conquista
      io.to(`user:${data.userId}`).emit(data.event, data);
      break;
  }
}

/**
 * Handler de conexão de cliente
 */
function handleConnection(socket: Socket) {
  const userId = socket.handshake.query.userId as string;
  const userName = socket.handshake.query.userName as string;
  
  log.info({ 
    userId, 
    socketId: socket.id,
    component: 'websocket'
  }, `👤 Usuário conectado: ${userName}`);

  // Adicionar usuário à sala pessoal
  if (userId) {
    socket.join(`user:${userId}`);
    
    // Registrar usuário online no Redis
    registerUserOnline(userId, userName, socket.id);
  }

  // === EVENTOS DE PRESENÇA ===
  socket.on('join:room', (roomId: string) => {
    socket.join(`room:${roomId}`);
    log.info({ userId, roomId }, 'Usuário entrou na sala');
  });

  socket.on('leave:room', (roomId: string) => {
    socket.leave(`room:${roomId}`);
    log.info({ userId, roomId }, 'Usuário saiu da sala');
  });

  // === EVENTOS DE CHAT ===
  socket.on('chat:join', (chatId: string) => {
    socket.join(`chat:${chatId}`);
    socket.to(`chat:${chatId}`).emit('chat:user:joined', { userId, userName });
  });

  socket.on('chat:send', async (data: any) => {
    // Salvar mensagem no Redis/Banco
    await saveChatMessage(data);
    
    // Publicar no Redis Pub/Sub
    await publishToRedis('chat', {
      ...data,
      timestamp: new Date(),
    });
  });

  socket.on('chat:typing', (chatId: string) => {
    socket.to(`chat:${chatId}`).emit('chat:typing', { userId, userName });
  });

  // === EVENTOS DE NOTIFICAÇÕES ===
  socket.on('notification:read', async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
    socket.emit('notification:read:success', { notificationId });
  });

  // === DESCONEXÃO ===
  socket.on('disconnect', () => {
    log.info({ userId, socketId: socket.id }, '👋 Usuário desconectado');
    
    if (userId) {
      registerUserOffline(userId);
    }
  });
}

/**
 * Registrar usuário online no Redis
 */
async function registerUserOnline(userId: string, userName: string, socketId: string) {
  try {
    await redis.zadd('users:online', Date.now(), userId);
    await redis.setex(`user:${userId}:session`, 3600, JSON.stringify({
      userId,
      userName,
      socketId,
      connectedAt: new Date(),
    }));

    // Publicar evento de presença
    await publishToRedis('presence', {
      event: WebSocketEvents.USER_ONLINE,
      userId,
      userName,
      timestamp: new Date(),
    });

    log.info({ userId, userName }, '🟢 Usuário online registrado');
  } catch (error) {
    log.error({ err: error, userId }, 'Erro ao registrar usuário online');
  }
}

/**
 * Registrar usuário offline
 */
async function registerUserOffline(userId: string) {
  try {
    await redis.zrem('users:online', userId);
    await redis.del(`user:${userId}:session`);
    
    // Salvar last seen
    await redis.set(`user:${userId}:lastseen`, Date.now());

    // Publicar evento de presença
    await publishToRedis('presence', {
      event: WebSocketEvents.USER_OFFLINE,
      userId,
      timestamp: new Date(),
    });

    log.info({ userId }, '🔴 Usuário offline registrado');
  } catch (error) {
    log.error({ err: error, userId }, 'Erro ao registrar usuário offline');
  }
}

/**
 * Salvar mensagem de chat
 */
async function saveChatMessage(data: any) {
  try {
    const messageId = `msg:${Date.now()}:${data.userId}`;
    
    await redis.lpush(`chat:${data.chatId}:messages`, JSON.stringify({
      id: messageId,
      userId: data.userId,
      userName: data.userName,
      message: data.message,
      timestamp: new Date(),
    }));

    // Manter apenas as últimas 100 mensagens
    await redis.ltrim(`chat:${data.chatId}:messages`, 0, 99);
  } catch (error) {
    log.error({ err: error }, 'Erro ao salvar mensagem de chat');
  }
}

/**
 * Marcar notificação como lida
 */
async function markNotificationAsRead(notificationId: string) {
  try {
    await redis.sadd('notifications:read', notificationId);
  } catch (error) {
    log.error({ err: error }, 'Erro ao marcar notificação como lida');
  }
}

/**
 * Publicar no Redis Pub/Sub
 */
async function publishToRedis(channel: string, data: any) {
  try {
    await redis.publish(channel, JSON.stringify(data));
  } catch (error) {
    log.error({ err: error, channel }, 'Erro ao publicar no Redis');
  }
}

/**
 * Emitir notificação para usuário específico
 */
export async function emitNotification(userId: string, notification: any) {
  try {
    // Tentar enviar via WebSocket primeiro
    io.to(`user:${userId}`).emit(WebSocketEvents.NOTIFICATION, notification);
    
    // Salvar no Redis como backup
    await redis.lpush(`user:${userId}:notifications`, JSON.stringify({
      ...notification,
      createdAt: new Date(),
    }));
    
    // Manter apenas as últimas 50 notificações
    await redis.ltrim(`user:${userId}:notifications`, 0, 49);
    
    // Publicar no canal para outros servidores (escalabilidade)
    await publishToRedis('notifications', { userId, ...notification });
  } catch (error) {
    log.error({ err: error, userId }, 'Erro ao emitir notificação');
  }
}

/**
 * Emitir atualização de dashboard
 */
export async function emitDashboardUpdate(data: any) {
  try {
    io.emit(WebSocketEvents.DASHBOARD_UPDATE, data);
    await publishToRedis('dashboard', data);
  } catch (error) {
    log.error({ err: error }, 'Erro ao emitir atualização de dashboard');
  }
}

/**
 * Emitir conquista de gamificação
 */
export async function emitAchievement(userId: string, achievement: any) {
  try {
    io.to(`user:${userId}`).emit(WebSocketEvents.ACHIEVEMENT, achievement);
    await publishToRedis('gamification', { 
      userId, 
      event: WebSocketEvents.ACHIEVEMENT,
      ...achievement 
    });
  } catch (error) {
    log.error({ err: error, userId }, 'Erro ao emitir conquista');
  }
}

/**
 * Obter usuários online
 */
export async function getOnlineUsers(): Promise<string[]> {
  try {
    // Obter usuários online dos últimos 5 minutos
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    return await redis.zrangebyscore('users:online', fiveMinutesAgo, '+inf');
  } catch (error) {
    log.error({ err: error }, 'Erro ao obter usuários online');
    return [];
  }
}

/**
 * Obter last seen de um usuário
 */
export async function getUserLastSeen(userId: string): Promise<number | null> {
  try {
    const lastSeen = await redis.get(`user:${userId}:lastseen`);
    return lastSeen ? parseInt(lastSeen) : null;
  } catch (error) {
    log.error({ err: error, userId }, 'Erro ao obter last seen');
    return null;
  }
}

/**
 * Obter histórico de chat
 */
export async function getChatHistory(chatId: string, limit = 50): Promise<any[]> {
  try {
    const messages = await redis.lrange(`chat:${chatId}:messages`, 0, limit - 1);
    return messages.map((msg: string) => JSON.parse(msg));
  } catch (error) {
    log.error({ err: error, chatId }, 'Erro ao obter histórico de chat');
    return [];
  }
}

export function getIO(): SocketServer {
  if (!io) {
    throw new Error('WebSocket não inicializado. Chame initializeWebSocket primeiro.');
  }
  return io;
}

export default {
  initializeWebSocket,
  emitNotification,
  emitDashboardUpdate,
  emitAchievement,
  getOnlineUsers,
  getUserLastSeen,
  getChatHistory,
  getIO,
};
