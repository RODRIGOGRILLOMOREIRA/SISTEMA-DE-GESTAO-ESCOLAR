import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

// Configuração do Prisma com opções de conexão otimizadas
export const prisma = new PrismaClient({
  log: ['error', 'warn'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Pool de conexão direta para casos onde Prisma falha
const connectionString = process.env.DATABASE_URL || 'postgresql://sge_user:sge_password@localhost:5432/sge_db';

export const pgPool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 60000, // Aumentado para 60s
  statement_timeout: 60000, // Timeout de statement
  query_timeout: 60000, // Timeout de query
  application_name: 'SGE-Backend', // Identificar a aplicação
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
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
pgPool.connect().then((client) => {
  console.log('✅ PostgreSQL conectado via pg pool');
  client.release();
}).catch((err: Error) => {
  console.error('❌ Erro ao conectar no PostgreSQL:', err.message);
});

