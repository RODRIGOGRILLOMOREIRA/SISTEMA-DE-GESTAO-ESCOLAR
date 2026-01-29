/**
 * Middleware de Autenticação JWT
 * Fase 4 - Segurança
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { log } from '../lib/logger';

// ⚠️  CRÍTICO: JWT_SECRET deve estar definido no .env
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('❌ ERRO CRÍTICO: JWT_SECRET não está definido no arquivo .env');
  console.error('💡 Gere uma chave: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
  process.exit(1);
}

if (JWT_SECRET.length < 32) {
  console.warn('⚠️  AVISO: JWT_SECRET deve ter pelo menos 32 caracteres para segurança adequada');
}

interface JWTPayload {
  userId: string;
  email: string;
  tipo: string;
  iat?: number;
  exp?: number;
}

/**
 * Middleware para verificar token JWT
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Obter token do header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    // Formato esperado: "Bearer TOKEN"
    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
      return res.status(401).json({ error: 'Formato de token inválido' });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({ error: 'Token mal formatado' });
    }

    // Verificar token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        log.warn({ err, component: 'auth' }, 'Token inválido ou expirado');
        return res.status(401).json({ error: 'Token inválido ou expirado' });
      }

      const payload = decoded as JWTPayload;

      // Adicionar informações do usuário no request
      (req as any).user = {
        id: payload.userId,
        userId: payload.userId,
        email: payload.email,
        tipo: payload.tipo
      };
      (req as any).userId = payload.userId;
      (req as any).userEmail = payload.email;
      (req as any).userTipo = payload.tipo;

      return next();
    });
  } catch (error: any) {
    log.error({ err: error, component: 'auth' }, 'Erro no middleware de autenticação');
    return res.status(500).json({ error: 'Erro na autenticação' });
  }
};

/**
 * Middleware para verificar permissões específicas
 */
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userTipo = (req as any).userTipo;

    if (!userTipo || !allowedRoles.includes(userTipo)) {
      log.warn({ 
        userId: (req as any).userId, 
        userTipo, 
        allowedRoles,
        component: 'auth' 
      }, 'Acesso negado - permissão insuficiente');
      
      return res.status(403).json({ error: 'Acesso negado - permissão insuficiente' });
    }

    next();
  };
};
