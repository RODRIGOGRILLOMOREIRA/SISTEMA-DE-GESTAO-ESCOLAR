/**
 * Script de Migração - Criptografia de Dados Sensíveis
 * 
 * Este script criptografa dados sensíveis existentes no banco de dados:
 * - CPF (Alunos, Professores, Funcionários, Equipe Diretiva)
 * - Telefones
 * - Endereços (Alunos)
 * 
 * IMPORTANTE: Execute este script apenas UMA VEZ após implementar a criptografia
 * 
 * Como usar:
 * 1. Certifique-se de ter um backup do banco de dados
 * 2. Configure a ENCRYPTION_KEY no arquivo .env
 * 3. Execute: npx ts-node backend/migrate-encrypt-data.ts
 */

import { PrismaClient } from '@prisma/client';
import encryption from './src/services/encryption.service';

const prisma = new PrismaClient();

// Função auxiliar para verificar se um dado já está criptografado
function isEncrypted(value: string): boolean {
  // Dados criptografados têm formato: iv:encryptedData:authTag
  return value.includes(':') && value.split(':').length === 3;
}

async function migrateAlunos() {
  console.log('\n📚 Migrando dados de ALUNOS...');
  
  const alunos = await prisma.alunos.findMany();
  let encrypted = 0;
  let skipped = 0;

  for (const aluno of alunos) {
    const updates: any = {};

    // Criptografar CPF se não estiver criptografado
    if (aluno.cpf && !isEncrypted(aluno.cpf)) {
      updates.cpf = encryption.encrypt(aluno.cpf);
    }

    // Criptografar telefone se existir e não estiver criptografado
    if (aluno.telefone && !isEncrypted(aluno.telefone)) {
      updates.telefone = encryption.encrypt(aluno.telefone);
    }

    // Criptografar telefone do responsável se não estiver criptografado
    if (aluno.telefoneResp && !isEncrypted(aluno.telefoneResp)) {
      updates.telefoneResp = encryption.encrypt(aluno.telefoneResp);
    }

    // Criptografar endereço se existir e não estiver criptografado
    if (aluno.endereco && !isEncrypted(aluno.endereco)) {
      updates.endereco = encryption.encrypt(aluno.endereco);
    }

    // Atualizar apenas se houver campos para criptografar
    if (Object.keys(updates).length > 0) {
      await prisma.alunos.update({
        where: { id: aluno.id },
        data: updates,
      });
      encrypted++;
    } else {
      skipped++;
    }
  }

  console.log(`   ✅ ${encrypted} alunos criptografados`);
  console.log(`   ⏭️  ${skipped} alunos já estavam criptografados`);
}

async function migrateProfessores() {
  console.log('\n👨‍🏫 Migrando dados de PROFESSORES...');
  
  const professores = await prisma.professores.findMany();
  let encrypted = 0;
  let skipped = 0;

  for (const professor of professores) {
    const updates: any = {};

    // Criptografar CPF se não estiver criptografado
    if (professor.cpf && !isEncrypted(professor.cpf)) {
      updates.cpf = encryption.encrypt(professor.cpf);
    }

    // Criptografar telefone se existir e não estiver criptografado
    if (professor.telefone && !isEncrypted(professor.telefone)) {
      updates.telefone = encryption.encrypt(professor.telefone);
    }

    // Atualizar apenas se houver campos para criptografar
    if (Object.keys(updates).length > 0) {
      await prisma.professores.update({
        where: { id: professor.id },
        data: updates,
      });
      encrypted++;
    } else {
      skipped++;
    }
  }

  console.log(`   ✅ ${encrypted} professores criptografados`);
  console.log(`   ⏭️  ${skipped} professores já estavam criptografados`);
}

async function migrateFuncionarios() {
  console.log('\n👷 Migrando dados de FUNCIONÁRIOS...');
  
  const funcionarios = await prisma.funcionarios.findMany();
  let encrypted = 0;
  let skipped = 0;

  for (const funcionario of funcionarios) {
    const updates: any = {};

    // Criptografar CPF se não estiver criptografado
    if (funcionario.cpf && !isEncrypted(funcionario.cpf)) {
      updates.cpf = encryption.encrypt(funcionario.cpf);
    }

    // Criptografar telefone se existir e não estiver criptografado
    if (funcionario.telefone && !isEncrypted(funcionario.telefone)) {
      updates.telefone = encryption.encrypt(funcionario.telefone);
    }

    // Atualizar apenas se houver campos para criptografar
    if (Object.keys(updates).length > 0) {
      await prisma.funcionarios.update({
        where: { id: funcionario.id },
        data: updates,
      });
      encrypted++;
    } else {
      skipped++;
    }
  }

  console.log(`   ✅ ${encrypted} funcionários criptografados`);
  console.log(`   ⏭️  ${skipped} funcionários já estavam criptografados`);
}

async function migrateEquipeDiretiva() {
  console.log('\n👔 Migrando dados de EQUIPE DIRETIVA...');
  
  const equipe = await prisma.equipe_diretiva.findMany();
  let encrypted = 0;
  let skipped = 0;

  for (const membro of equipe) {
    const updates: any = {};

    // Criptografar CPF se não estiver criptografado
    if (membro.cpf && !isEncrypted(membro.cpf)) {
      updates.cpf = encryption.encrypt(membro.cpf);
    }

    // Criptografar telefone se existir e não estiver criptografado
    if (membro.telefone && !isEncrypted(membro.telefone)) {
      updates.telefone = encryption.encrypt(membro.telefone);
    }

    // Atualizar apenas se houver campos para criptografar
    if (Object.keys(updates).length > 0) {
      await prisma.equipe_diretiva.update({
        where: { id: membro.id },
        data: updates,
      });
      encrypted++;
    } else {
      skipped++;
    }
  }

  console.log(`   ✅ ${encrypted} membros da equipe criptografados`);
  console.log(`   ⏭️  ${skipped} membros já estavam criptografados`);
}

async function main() {
  console.log('🔐 INICIANDO MIGRAÇÃO DE CRIPTOGRAFIA DE DADOS');
  console.log('================================================\n');

  try {
    // Verificar se a chave de criptografia está configurada
    if (!process.env.ENCRYPTION_KEY) {
      throw new Error('ENCRYPTION_KEY não configurada no arquivo .env');
    }

    console.log('⚠️  AVISO: Este script modificará dados no banco de dados.');
    console.log('   Certifique-se de ter um backup antes de continuar.\n');

    // Aguardar 3 segundos para dar tempo de cancelar se necessário
    console.log('   Iniciando em 3 segundos... (Ctrl+C para cancelar)');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Executar migrações
    await migrateAlunos();
    await migrateProfessores();
    await migrateFuncionarios();
    await migrateEquipeDiretiva();

    console.log('\n================================================');
    console.log('✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('\n💡 Dicas:');
    console.log('   - Guarde a ENCRYPTION_KEY em local seguro');
    console.log('   - Nunca compartilhe a chave de criptografia');
    console.log('   - Faça backups regulares do banco de dados');
    console.log('   - Este script pode ser executado novamente com segurança\n');

  } catch (error) {
    console.error('\n❌ ERRO durante a migração:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar script
main();
