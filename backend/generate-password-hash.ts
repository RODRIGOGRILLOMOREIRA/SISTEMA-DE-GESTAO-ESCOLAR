/**
 * GERADOR PROFISSIONAL DE HASH BCRYPT
 * 
 * Script para gerar hash bcrypt válido de senhas
 * Garante compatibilidade com o sistema de autenticação
 */

import bcrypt from 'bcryptjs';
import readline from 'readline';

const BCRYPT_ROUNDS = 10; // Padrão da indústria

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function generateHash() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔐 GERADOR DE HASH BCRYPT - SGE');
  console.log('═══════════════════════════════════════════════════════\n');

  rl.question('Digite a senha para gerar o hash: ', async (senha) => {
    if (!senha || senha.length < 6) {
      console.error('\n❌ Erro: Senha deve ter no mínimo 6 caracteres');
      rl.close();
      process.exit(1);
    }

    try {
      console.log('\n⏳ Gerando hash bcrypt...');
      
      const hash = await bcrypt.hash(senha, BCRYPT_ROUNDS);
      
      console.log('\n✅ Hash gerado com sucesso!');
      console.log('═══════════════════════════════════════════════════════');
      console.log('📋 DETALHES DO HASH:');
      console.log('───────────────────────────────────────────────────────');
      console.log(`Senha original: ${senha}`);
      console.log(`Hash bcrypt:    ${hash}`);
      console.log(`Comprimento:    ${hash.length} caracteres`);
      console.log(`Algoritmo:      ${hash.substring(0, 4)}`);
      console.log(`Rounds:         ${BCRYPT_ROUNDS}`);
      console.log('═══════════════════════════════════════════════════════');
      
      // Validar que o hash está correto
      const isValid = await bcrypt.compare(senha, hash);
      console.log(`\n🔍 Validação: ${isValid ? '✅ Hash válido' : '❌ Hash inválido'}`);
      
      if (isValid) {
        console.log('\n📝 COMANDO SQL PARA ATUALIZAR NO BANCO:');
        console.log('───────────────────────────────────────────────────────');
        console.log(`UPDATE usuarios SET senha = '${hash}' WHERE email = 'SEU_EMAIL_AQUI';`);
        console.log('═══════════════════════════════════════════════════════\n');
      }
      
    } catch (error: any) {
      console.error('\n❌ Erro ao gerar hash:', error.message);
      process.exit(1);
    } finally {
      rl.close();
    }
  });
}

// Verificar se senha foi passada como argumento
const senhaArgumento = process.argv[2];

if (senhaArgumento) {
  // Modo não-interativo
  (async () => {
    try {
      const hash = await bcrypt.hash(senhaArgumento, BCRYPT_ROUNDS);
      console.log('✅ Hash gerado:');
      console.log(hash);
      
      // Validar
      const isValid = await bcrypt.compare(senhaArgumento, hash);
      if (!isValid) {
        console.error('❌ Erro: Hash inválido após geração');
        process.exit(1);
      }
    } catch (error: any) {
      console.error('❌ Erro:', error.message);
      process.exit(1);
    }
  })();
} else {
  // Modo interativo
  generateHash();
}
