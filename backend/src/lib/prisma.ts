import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

// Configuração do Prisma
export const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

// Pool de conexão direta para casos onde Prisma falha
const connectionString = process.env.DATABASE_URL || 'postgresql://sge_user:sge_password@localhost:5432/sge_db';

export const pgPool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Wrapper para executar queries diretas quando Prisma falha
export async function queryDirect(text: string, params?: any[]) {
  try {
    const result = await pgPool.query(text, params);
    return result.rows;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

// Test connection on startup
pgPool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Erro ao conectar no PostgreSQL:', err);
  } else {
    console.log('✅ PostgreSQL conectado via pg pool');
    release();
  }
});

