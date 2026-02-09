/**
 * Script de diagnóstico de conexão Docker
 * Testa conexões com PostgreSQL e Redis
 */

import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

const prisma = new PrismaClient();

async function testPostgres() {
  try {
    console.log('🔍 Testando conexão PostgreSQL...');
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('✅ PostgreSQL conectado com sucesso!');
    console.log('   Versão:', result);
    
    // Testa se consegue listar tabelas
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      LIMIT 5
    `;
    console.log('   Tabelas encontradas:', tables);
  } catch (error) {
    console.error('❌ Erro ao conectar PostgreSQL:', error);
    throw error;
  }
}

async function testRedis() {
  try {
    console.log('\n🔍 Testando conexão Redis...');
    const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    
    const pong = await redis.ping();
    console.log('✅ Redis conectado com sucesso!');
    console.log('   PING:', pong);
    
    // Testa escrita e leitura
    await redis.set('test:docker', 'funcionando', 'EX', 10);
    const value = await redis.get('test:docker');
    console.log('   Teste de escrita/leitura:', value);
    
    await redis.quit();
  } catch (error) {
    console.error('❌ Erro ao conectar Redis:', error);
    throw error;
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('🐳 TESTE DE CONEXÃO DOCKER - SGE');
  console.log('═══════════════════════════════════════════════\n');
  
  console.log('📋 Configurações:');
  console.log('   DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':***@'));
  console.log('   REDIS_URL:', process.env.REDIS_URL?.replace(/:[^:@]+@/, ':***@'));
  console.log();
  
  try {
    await testPostgres();
    await testRedis();
    
    console.log('\n═══════════════════════════════════════════════');
    console.log('✅ TODOS OS TESTES PASSARAM COM SUCESSO!');
    console.log('═══════════════════════════════════════════════');
    
    process.exit(0);
  } catch (error) {
    console.log('\n═══════════════════════════════════════════════');
    console.log('❌ FALHA NOS TESTES DE CONEXÃO');
    console.log('═══════════════════════════════════════════════');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
