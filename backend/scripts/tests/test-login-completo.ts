/**
 * TESTE DE LOGIN COMPLETO
 * Testa login com as credenciais atualizadas
 */

import axios from 'axios';
import bcrypt from 'bcryptjs';

const API_URL = 'http://localhost:3333/api/auth';

async function testarLogin() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('🧪 TESTE DE LOGIN COMPLETO');
  console.log('═══════════════════════════════════════════════════════\n');

  const credenciais = {
    email: 'rodrigo-gmoreira@educar.rs.gov.br',
    senha: '01020304'
  };

  console.log('📧 Email:', credenciais.email);
  console.log('🔑 Senha:', credenciais.senha);
  console.log('\n⏳ Tentando fazer login...\n');

  try {
    const response = await axios.post(`${API_URL}/login`, credenciais);

    console.log('✅ LOGIN BEM-SUCEDIDO!\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 RESPOSTA DO SERVIDOR:');
    console.log('═══════════════════════════════════════════════════════');
    console.log('Status:', response.status);
    console.log('Success:', response.data.success);
    
    if (response.data.token) {
      console.log('\n🎟️  TOKEN JWT:');
      console.log(response.data.token.substring(0, 50) + '...');
    }
    
    if (response.data.refreshToken) {
      console.log('\n🔄 REFRESH TOKEN:');
      console.log(response.data.refreshToken.substring(0, 50) + '...');
    }
    
    if (response.data.user) {
      console.log('\n👤 DADOS DO USUÁRIO:');
      console.log('   ID:', response.data.user.id);
      console.log('   Nome:', response.data.user.nome);
      console.log('   Email:', response.data.user.email);
      console.log('   Role:', response.data.user.role);
      console.log('   Ativo:', response.data.user.isActive);
    }
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ TODOS OS TESTES PASSARAM!');
    console.log('═══════════════════════════════════════════════════════\n');
    
    return true;

  } catch (error: any) {
    console.log('❌ ERRO NO LOGIN\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('Status:', error.response?.status || 'N/A');
    console.log('Erro:', error.response?.data?.error || error.message);
    
    if (error.response?.data) {
      console.log('\n📋 Resposta completa:');
      console.log(JSON.stringify(error.response.data, null, 2));
    }
    
    console.log('═══════════════════════════════════════════════════════\n');
    
    return false;
  }
}

// Executar teste
testarLogin().then(success => {
  process.exit(success ? 0 : 1);
});
