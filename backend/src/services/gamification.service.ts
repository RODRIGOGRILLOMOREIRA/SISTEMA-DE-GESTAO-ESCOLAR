/**
 * ========================================
 * SISTEMA DE GAMIFICAÇÃO
 * ========================================
 * 
 * Pontuações, rankings, badges e conquistas para alunos
 * Usando Redis para performance e rankings em tempo real
 */

import redis from '../lib/redis';
import { log } from '../lib/logger';
import { emitAchievement } from '../lib/websocket';

// Tipos de badges
export enum BadgeType {
  FIRST_LOGIN = 'first_login',
  ATTENDANCE_STREAK = 'attendance_streak',
  GOOD_GRADES = 'good_grades',
  PARTICIPATION = 'participation',
  READING_CHAMPION = 'reading_champion',
  MATH_MASTER = 'math_master',
  PERFECT_WEEK = 'perfect_week',
  HELPFUL_STUDENT = 'helpful_student',
  EARLY_BIRD = 'early_bird',
  HOMEWORK_HERO = 'homework_hero',
}

// Definição de badges
export const BADGES = {
  [BadgeType.FIRST_LOGIN]: {
    name: 'Primeiro Acesso',
    description: 'Fez login pela primeira vez no sistema',
    icon: '🎯',
    points: 10,
  },
  [BadgeType.ATTENDANCE_STREAK]: {
    name: 'Frequência Perfeita',
    description: 'Manteve 100% de presença por 7 dias consecutivos',
    icon: '📅',
    points: 100,
  },
  [BadgeType.GOOD_GRADES]: {
    name: 'Nota 10!',
    description: 'Tirou nota máxima em uma avaliação',
    icon: '⭐',
    points: 50,
  },
  [BadgeType.PARTICIPATION]: {
    name: 'Participativo',
    description: 'Participou ativamente das aulas por uma semana',
    icon: '🙋',
    points: 30,
  },
  [BadgeType.READING_CHAMPION]: {
    name: 'Campeão de Leitura',
    description: 'Leu 5 livros no semestre',
    icon: '📚',
    points: 150,
  },
  [BadgeType.MATH_MASTER]: {
    name: 'Mestre da Matemática',
    description: 'Média 9+ em Matemática',
    icon: '🔢',
    points: 120,
  },
  [BadgeType.PERFECT_WEEK]: {
    name: 'Semana Perfeita',
    description: 'Notas acima de 8 em todas as matérias da semana',
    icon: '💯',
    points: 200,
  },
  [BadgeType.HELPFUL_STUDENT]: {
    name: 'Aluno Solidário',
    description: 'Ajudou colegas em atividades',
    icon: '🤝',
    points: 80,
  },
  [BadgeType.EARLY_BIRD]: {
    name: 'Madrugador',
    description: 'Chegou cedo por 10 dias consecutivos',
    icon: '🌅',
    points: 60,
  },
  [BadgeType.HOMEWORK_HERO]: {
    name: 'Herói das Tarefas',
    description: 'Entregou todas as tarefas do mês no prazo',
    icon: '📝',
    points: 100,
  },
};

// Níveis do sistema
export const LEVELS = [
  { level: 1, name: 'Iniciante', minPoints: 0, icon: '🌱' },
  { level: 2, name: 'Aprendiz', minPoints: 100, icon: '📖' },
  { level: 3, name: 'Estudante', minPoints: 300, icon: '🎒' },
  { level: 4, name: 'Dedicado', minPoints: 600, icon: '📚' },
  { level: 5, name: 'Esforçado', minPoints: 1000, icon: '💪' },
  { level: 6, name: 'Talentoso', minPoints: 1500, icon: '⭐' },
  { level: 7, name: 'Brilhante', minPoints: 2200, icon: '✨' },
  { level: 8, name: 'Excepcional', minPoints: 3000, icon: '🏆' },
  { level: 9, name: 'Mestre', minPoints: 4000, icon: '👑' },
  { level: 10, name: 'Lenda', minPoints: 5500, icon: '🔥' },
];

/**
 * Adicionar pontos a um aluno
 */
export async function addPoints(
  alunoId: string,
  points: number,
  reason: string
): Promise<void> {
  try {
    // Adicionar pontos ao total
    const newTotal = await redis.zincrby('gamification:leaderboard', points, alunoId);
    
    // Salvar histórico
    await redis.lpush(
      `gamification:${alunoId}:history`,
      JSON.stringify({
        points,
        reason,
        timestamp: new Date(),
        totalPoints: parseFloat(newTotal),
      })
    );
    
    // Manter apenas últimas 100 entradas
    await redis.ltrim(`gamification:${alunoId}:history`, 0, 99);
    
    // Verificar se subiu de nível
    await checkLevelUp(alunoId, parseFloat(newTotal));
    
    log.info({ alunoId, points, reason }, `➕ Pontos adicionados`);
  } catch (error) {
    log.error({ err: error, alunoId, points }, 'Erro ao adicionar pontos');
  }
}

/**
 * Verificar se aluno subiu de nível
 */
async function checkLevelUp(alunoId: string, totalPoints: number): Promise<void> {
  try {
    // Obter nível atual
    const currentLevelStr = await redis.get(`gamification:${alunoId}:level`);
    const currentLevel = currentLevelStr ? parseInt(currentLevelStr) : 1;
    
    // Calcular novo nível
    const newLevel = LEVELS.reduce((level, l) => 
      totalPoints >= l.minPoints ? l.level : level
    , 1);
    
    // Se subiu de nível
    if (newLevel > currentLevel) {
      await redis.set(`gamification:${alunoId}:level`, newLevel);
      
      const levelInfo = LEVELS.find(l => l.level === newLevel)!;
      
      // Emitir evento de level up
      await emitAchievement(alunoId, {
        type: 'level_up',
        level: newLevel,
        levelName: levelInfo.name,
        icon: levelInfo.icon,
        message: `Parabéns! Você chegou ao nível ${newLevel}: ${levelInfo.name}!`,
      });
      
      log.info({ alunoId, level: newLevel }, `🆙 Aluno subiu de nível!`);
    }
  } catch (error) {
    log.error({ err: error, alunoId }, 'Erro ao verificar level up');
  }
}

/**
 * Conceder badge a um aluno
 */
export async function awardBadge(alunoId: string, badgeType: BadgeType): Promise<void> {
  try {
    // Verificar se já possui o badge
    const hasBadge = await redis.sismember(`gamification:${alunoId}:badges`, badgeType);
    
    if (!hasBadge) {
      // Adicionar badge
      await redis.sadd(`gamification:${alunoId}:badges`, badgeType);
      
      const badge = BADGES[badgeType];
      
      // Adicionar pontos do badge
      await addPoints(alunoId, badge.points, `Badge: ${badge.name}`);
      
      // Emitir notificação
      await emitAchievement(alunoId, {
        type: 'badge_earned',
        badge: {
          type: badgeType,
          ...badge,
        },
        message: `Você ganhou o badge "${badge.name}"! ${badge.icon}`,
      });
      
      log.info({ alunoId, badgeType }, `🏅 Badge concedido`);
    }
  } catch (error) {
    log.error({ err: error, alunoId, badgeType }, 'Erro ao conceder badge');
  }
}

/**
 * Obter perfil de gamificação do aluno
 */
export async function getGamificationProfile(alunoId: string): Promise<any> {
  try {
    // Pontos totais
    const score = await redis.zscore('gamification:leaderboard', alunoId);
    const totalPoints = score ? parseFloat(score) : 0;
    
    // Nível
    const levelStr = await redis.get(`gamification:${alunoId}:level`);
    const level = levelStr ? parseInt(levelStr) : 1;
    const levelInfo = LEVELS.find(l => l.level === level)!;
    
    // Próximo nível
    const nextLevel = LEVELS.find(l => l.level === level + 1);
    const pointsToNextLevel = nextLevel ? nextLevel.minPoints - totalPoints : 0;
    
    // Badges
    const badgesList = await redis.smembers(`gamification:${alunoId}:badges`);
    const badges = badgesList.map(type => ({
      type,
      ...BADGES[type as BadgeType],
    }));
    
    // Ranking position
    const rank = await redis.zrevrank('gamification:leaderboard', alunoId);
    const position = rank !== null ? rank + 1 : null;
    
    // Histórico recente
    const historyData = await redis.lrange(`gamification:${alunoId}:history`, 0, 9);
    const history = historyData.map((h: string) => JSON.parse(h));
    
    return {
      alunoId,
      totalPoints,
      level: {
        current: level,
        name: levelInfo.name,
        icon: levelInfo.icon,
        minPoints: levelInfo.minPoints,
      },
      nextLevel: nextLevel ? {
        level: nextLevel.level,
        name: nextLevel.name,
        icon: nextLevel.icon,
        minPoints: nextLevel.minPoints,
        pointsNeeded: pointsToNextLevel,
      } : null,
      badges,
      ranking: {
        position,
        total: await redis.zcard('gamification:leaderboard'),
      },
      recentActivity: history,
    };
  } catch (error) {
    log.error({ err: error, alunoId }, 'Erro ao obter perfil de gamificação');
    return null;
  }
}

/**
 * Obter ranking geral
 */
export async function getLeaderboard(limit = 10): Promise<any[]> {
  try {
    // Top alunos
    const topAlunos = await redis.zrevrange('gamification:leaderboard', 0, limit - 1, 'WITHSCORES');
    
    const leaderboard = [];
    for (let i = 0; i < topAlunos.length; i += 2) {
      const alunoId = topAlunos[i];
      const points = parseFloat(topAlunos[i + 1]);
      
      // Nível do aluno
      const levelStr = await redis.get(`gamification:${alunoId}:level`);
      const level = levelStr ? parseInt(levelStr) : 1;
      const levelInfo = LEVELS.find(l => l.level === level)!;
      
      // Badges
      const badgeCount = await redis.scard(`gamification:${alunoId}:badges`);
      
      leaderboard.push({
        position: Math.floor(i / 2) + 1,
        alunoId,
        points,
        level: {
          current: level,
          name: levelInfo.name,
          icon: levelInfo.icon,
        },
        badgeCount,
      });
    }
    
    return leaderboard;
  } catch (error) {
    log.error({ err: error }, 'Erro ao obter leaderboard');
    return [];
  }
}

/**
 * Verificar e conceder badges automaticamente
 */
export async function checkAndAwardAutomaticBadges(alunoId: string): Promise<void> {
  // Implementar lógica de verificação de badges automáticos
  // Baseado em dados do sistema (notas, frequência, etc.)
}

/**
 * Registrar atividade do aluno (para badges)
 */
export async function registerActivity(
  alunoId: string,
  activityType: string,
  data: any
): Promise<void> {
  try {
    await redis.lpush(
      `gamification:${alunoId}:activities`,
      JSON.stringify({
        type: activityType,
        data,
        timestamp: new Date(),
      })
    );
    
    // Manter apenas últimas 200 atividades
    await redis.ltrim(`gamification:${alunoId}:activities`, 0, 199);
    
    // Verificar badges baseados em atividades
    await checkActivityBadges(alunoId, activityType);
  } catch (error) {
    log.error({ err: error, alunoId, activityType }, 'Erro ao registrar atividade');
  }
}

/**
 * Verificar badges baseados em atividades
 */
async function checkActivityBadges(alunoId: string, activityType: string): Promise<void> {
  // Implementar verificações específicas por tipo de atividade
  // Ex: ao marcar presença, verificar streak de frequência
}

export default {
  addPoints,
  awardBadge,
  getGamificationProfile,
  getLeaderboard,
  registerActivity,
  checkAndAwardAutomaticBadges,
};
