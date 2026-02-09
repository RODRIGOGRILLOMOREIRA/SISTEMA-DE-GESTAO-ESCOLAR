/**
 * GERADOR DE HASH BCRYPT PROFISSIONAL
 * 
 * Gera hash bcrypt válido e seguro para senhas
 * Uso: npm exec tsx generate-password-hash-professional.ts
 */

import bcrypt from 'bcryptjs';
import { createInterface } from 'readline';

const BCRYPT_ROUNDS = 10; // Padrão profissional

async function generateHash() {
  const readline = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('\n🔐 GERADOR DE HASH BCRYPT PROFISSIONAL\n');
  console.log('═'.repeat(60));
  
  readline.question('Digite a senha para gerar hash: ', async (senha) => {
    if (!senha || senha.length < 6) {
      console.error('\n❌ Senha deve ter no mínimo 6 caracteres!');
      readline.close();
      return;
    }

    try {
      console.log('\n⏳ Gerando hash bcrypt (rounds=10)...\n');
      
      const hash = await bcrypt.hash(senha, BCRYPT_ROUNDS);
      
      console.log('✅ Hash gerado com sucesso!\n');
      console.log('═'.repeat(60));
      console.log('📋 INFORMAÇÕES DO HASH:');
      console.log('═'.repeat(60));
      console.log(`Senha digitada:    ${senha}`);
      console.log(`Comprimento:       ${hash.length} caracteres`);
      console.log(`Algoritmo:         bcrypt`);
      console.log(`Rounds:            ${BCRYPT_ROUNDS}`);
      console.log(`Formato válido:    ${hash.startsWith('$2b$') ? '✅ SIM' : '❌ NÃO'}`);
      console.log('═'.repeat(60));
      console.log('\n🔑 HASH GERADO:\n');
      console.log(hash);
      console.log('\n═'.repeat(60));
      
      // Validar que o hash funciona
      const isValid = await bcrypt.compare(senha, hash);
      console.log(`\n🧪 Validação: ${isValid ? '✅ Hash válido' : '❌ Hash inválido'}\n`);
      
      if (isValid) {
        console.log('📝 SQL PARA ATUALIZAR NO BANCO:\n');
        console.log(`UPDATE usuarios`);
        console.log(`SET senha = '${hash}'`);
        console.log(`WHERE email = 'SEU_EMAIL_AQUI';`);
        console.log('\n⚠️  IMPORTANTE: Substitua SEU_EMAIL_AQUI pelo email correto!\n');
      }
      
    } catch (error: any) {
      console.error('\n❌ Erro ao gerar hash:', error.message);
    } finally {
      readline.close();
    }
  });

  readline.on('close', () => {
    process.exit(0);
  });
}

// Executar
generateHash();
