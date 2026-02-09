/**
 * SCRIPT DE VALIDAÇÃO DE INTEGRIDADE
 * 
 * Verifica se o schema Prisma está sincronizado com o banco de dados
 * e se os hashes de senha são válidos
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import db from './src/lib/db';

const prisma = new PrismaClient();

interface ValidationResult {
  passed: boolean;
  message: string;
  details?: any;
}

async function validateSchemaSync(): Promise<ValidationResult> {
  try {
    console.log('\n🔍 Validando sincronização Schema vs Banco...');
    
    // Verificar se campos do schema existem no banco
    const result = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'usuarios' 
      ORDER BY ordinal_position
    `);
    
    const dbColumns = result.rows.map((r: any) => r.column_name);
    const requiredColumns = ['id', 'nome', 'email', 'senha', 'role', 'isActive', 'createdAt', 'updatedAt'];
    const missingColumns = requiredColumns.filter(col => !dbColumns.includes(col));
    
    if (missingColumns.length > 0) {
      return {
        passed: false,
        message: '❌ Campos faltando no banco de dados',
        details: { missing: missingColumns, existing: dbColumns }
      };
    }
    
    return {
      passed: true,
      message: '✅ Schema sincronizado com banco',
      details: { columns: dbColumns }
    };
    
  } catch (error: any) {
    return {
      passed: false,
      message: '❌ Erro ao validar schema',
      details: error.message
    };
  }
}

async function validatePasswordHashes(): Promise<ValidationResult> {
  try {
    console.log('\n🔍 Validando hashes de senha...');
    
    const usuarios = await prisma.usuarios.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        senha: true,
      }
    });
    
    const invalidHashes = [];
    
    for (const user of usuarios) {
      const isValidFormat = user.senha.startsWith('$2a$') || 
                           user.senha.startsWith('$2b$') || 
                           user.senha.startsWith('$2y$');
      const hasCorrectLength = user.senha.length === 60;
      
      if (!isValidFormat || !hasCorrectLength) {
        invalidHashes.push({
          email: user.email,
          nome: user.nome,
          hashLength: user.senha.length,
          validFormat: isValidFormat
        });
      }
    }
    
    if (invalidHashes.length > 0) {
      return {
        passed: false,
        message: '❌ Hashes de senha inválidos encontrados',
        details: invalidHashes
      };
    }
    
    return {
      passed: true,
      message: '✅ Todos os hashes são válidos',
      details: { totalUsuarios: usuarios.length }
    };
    
  } catch (error: any) {
    return {
      passed: false,
      message: '❌ Erro ao validar hashes',
      details: error.message
    };
  }
}

async function validatePrismaConnection(): Promise<ValidationResult> {
  try {
    console.log('\n🔍 Validando conexão Prisma...');
    
    await prisma.$connect();
    const count = await prisma.usuarios.count();
    
    return {
      passed: true,
      message: '✅ Prisma conectado',
      details: { totalUsuarios: count }
    };
    
  } catch (error: any) {
    return {
      passed: false,
      message: '❌ Erro na conexão Prisma',
      details: error.message
    };
  }
}

async function validateDatabaseConnection(): Promise<ValidationResult> {
  try {
    console.log('\n🔍 Validando conexão direta PostgreSQL...');
    
    const result = await db.query('SELECT COUNT(*) as count FROM usuarios');
    const count = parseInt(result.rows[0].count);
    
    return {
      passed: true,
      message: '✅ PostgreSQL conectado',
      details: { totalUsuarios: count }
    };
    
  } catch (error: any) {
    return {
      passed: false,
      message: '❌ Erro na conexão PostgreSQL',
      details: error.message
    };
  }
}

async function validateUserCredentials(email: string, senha: string): Promise<ValidationResult> {
  try {
    console.log(`\n🔍 Validando credenciais para ${email}...`);
    
    const user = await prisma.usuarios.findUnique({
      where: { email },
      select: {
        id: true,
        nome: true,
        email: true,
        senha: true,
        role: true,
        isActive: true,
      }
    });
    
    if (!user) {
      return {
        passed: false,
        message: '❌ Usuário não encontrado',
        details: { email }
      };
    }
    
    if (!user.isActive) {
      return {
        passed: false,
        message: '❌ Usuário inativo',
        details: { email }
      };
    }
    
    const senhaValida = await bcrypt.compare(senha, user.senha);
    
    if (!senhaValida) {
      return {
        passed: false,
        message: '❌ Senha inválida',
        details: { 
          email,
          hashLength: user.senha.length,
          hashPreview: user.senha.substring(0, 20)
        }
      };
    }
    
    return {
      passed: true,
      message: '✅ Credenciais válidas',
      details: {
        nome: user.nome,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    };
    
  } catch (error: any) {
    return {
      passed: false,
      message: '❌ Erro ao validar credenciais',
      details: error.message
    };
  }
}

async function runAllValidations() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('🔍 SCRIPT DE VALIDAÇÃO DE INTEGRIDADE DO SISTEMA');
  console.log('═══════════════════════════════════════════════════════');
  
  const results: ValidationResult[] = [];
  
  // 1. Validar conexões
  results.push(await validateDatabaseConnection());
  results.push(await validatePrismaConnection());
  
  // 2. Validar schema
  results.push(await validateSchemaSync());
  
  // 3. Validar hashes
  results.push(await validatePasswordHashes());
  
  // 4. Validar credenciais específicas
  results.push(await validateUserCredentials('rodrigo-gmoreira@educar.rs.gov.br', '01020304'));
  
  // Resumo
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊 RESUMO DA VALIDAÇÃO');
  console.log('═══════════════════════════════════════════════════════');
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  results.forEach(result => {
    console.log(`\n${result.message}`);
    if (result.details && Object.keys(result.details).length > 0) {
      console.log('   Detalhes:', JSON.stringify(result.details, null, 2));
    }
  });
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`✅ Passou: ${passed} | ❌ Falhou: ${failed}`);
  console.log('═══════════════════════════════════════════════════════\n');
  
  await prisma.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

// Executar validações
runAllValidations().catch(error => {
  console.error('\n❌ Erro fatal:', error);
  process.exit(1);
});
