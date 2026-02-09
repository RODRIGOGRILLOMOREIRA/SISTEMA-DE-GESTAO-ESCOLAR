/**
 * GERADOR RÁPIDO DE HASH BCRYPT
 * Gera hash para a senha '01020304'
 */

import bcrypt from 'bcryptjs';

async function quickHash() {
  const senha = '01020304';
  const hash = await bcrypt.hash(senha, 10);
  
  console.log('\n✅ Hash gerado com sucesso!\n');
  console.log('Senha:', senha);
  console.log('Hash:', hash);
  console.log('Comprimento:', hash.length);
  console.log('\nSQL para atualizar:\n');
  console.log(`UPDATE usuarios SET senha = '${hash}' WHERE email = 'rodrigo-gmoreira@educar.rs.gov.br';`);
  console.log('\n');
  
  // Validar
  const isValid = await bcrypt.compare(senha, hash);
  console.log('Validação:', isValid ? '✅ Hash válido' : '❌ Hash inválido');
}

quickHash();
