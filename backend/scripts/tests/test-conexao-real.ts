/**
 * TESTE DE CONEXÃO REAL DO BACKEND
 * Verifica qual PostgreSQL o backend está realmente usando
 */

import { PrismaClient } from '@prisma/client';
import db from './src/lib/db';

const prisma = new PrismaClient();

async function testConnection() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('🔍 TESTE DE CONEXÃO POSTGRESQL');
  console.log('═══════════════════════════════════════════════════════\n');

  // 1. Verificar DATABASE_URL
  console.log('📝 DATABASE_URL configurado:');
  console.log(process.env.DATABASE_URL || 'NÃO DEFINIDO');
  console.log('');

  // 2. Tentar conexão via Prisma
  try {
    console.log('🔌 Testando conexão Prisma...');
    await prisma.$connect();
    
    const result = await prisma.$queryRaw`
      SELECT 
        current_database() as database,
        current_user as user,
        version() as version,
        inet_server_addr() as server_addr,
        inet_server_port() as server_port
    `;
    
    console.log('✅ Prisma conectado com sucesso!');
    console.log('Detalhes da conexão:', result);
    
    // Contar usuários
    const userCount = await prisma.usuarios.count();
    console.log(`\n👥 Total de usuários no banco: ${userCount}`);
    
    // Verificar usuário específico
    const user = await prisma.usuarios.findUnique({
      where: { email: 'rodrigo-gmoreira@educar.rs.gov.br' },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        isActive: true,
      }
    });
    
    if (user) {
      console.log('\n✅ Usuário encontrado:');
      console.log('   Nome:', user.nome);
      console.log('   Email:', user.email);
      console.log('   Role:', user.role);
      console.log('   Ativo:', user.isActive);
    } else {
      console.log('\n❌ Usuário não encontrado no banco!');
    }
    
  } catch (error: any) {
    console.log('\n❌ Erro na conexão Prisma:');
    console.log(error.message);
  }

  // 3. Tentar conexão via pg direto
  try {
    console.log('\n🔌 Testando conexão pg direto...');
    const result = await db.query(`
      SELECT 
        current_database() as database,
        current_user as "user",
        version() as version
    `);
    
    console.log('✅ pg conectado com sucesso!');
    console.log('Database:', result.rows[0].database);
    console.log('User:', result.rows[0].user);
    
  } catch (error: any) {
    console.log('\n❌ Erro na conexão pg:');
    console.log(error.message);
  }

  console.log('\n═══════════════════════════════════════════════════════\n');
  
  await prisma.$disconnect();
  process.exit(0);
}

testConnection();
