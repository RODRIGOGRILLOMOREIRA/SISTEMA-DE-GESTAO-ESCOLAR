/**
 * TESTE DE AUTENTICAÇÃO COMPLETO
 * Testa todo o fluxo de login e geração de token
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3333';

async function testAuth() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('🔐 TESTE DE AUTENTICAÇÃO COMPLETO');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Teste 1: Login
    console.log('📝 Teste 1: Tentando login...');
    console.log('   Email: rodrigo-gmoreira@educar.rs.gov.br');
    console.log('   Senha: 01020304\n');

    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'rodrigo-gmoreira@educar.rs.gov.br',
      senha: '01020304'
    });

    console.log('✅ Login bem-sucedido!');
    console.log('   Status:', loginResponse.status);
    console.log('   Token:', loginResponse.data.token?.substring(0, 50) + '...');
    console.log('   Refresh Token:', loginResponse.data.refreshToken?.substring(0, 30) + '...');
    console.log('   Usuário:', loginResponse.data.user?.nome);
    console.log('   Role:', loginResponse.data.user?.role);
    console.log('   Email:', loginResponse.data.user?.email);
    console.log('   Ativo:', loginResponse.data.user?.isActive);

    const token = loginResponse.data.token;

    // Teste 2: Verificar autenticação
    console.log('\n📝 Teste 2: Verificando autenticação...\n');

    const meResponse = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Autenticação verificada!');
    console.log('   Usuário:', meResponse.data.user?.nome);
    console.log('   Email:', meResponse.data.user?.email);

    // Teste 3: Acessar recurso protegido
    console.log('\n📝 Teste 3: Acessando recurso protegido...\n');

    const alunosResponse = await axios.get(`${BASE_URL}/api/alunos`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Recurso protegido acessado!');
    console.log('   Status:', alunosResponse.status);
    console.log('   Total de alunos:', alunosResponse.data.length || 0);

    // Resumo
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 RESUMO DOS TESTES');
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ Login: PASSOU');
    console.log('✅ Verificação de autenticação: PASSOU');
    console.log('✅ Acesso a recurso protegido: PASSOU');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n🎉 TODOS OS TESTES PASSARAM!\n');

  } catch (error: any) {
    console.log('\n❌ ERRO NO TESTE');
    console.log('═══════════════════════════════════════════════════════');
    
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Erro:', error.response.data?.error || error.response.data);
      console.log('   Detalhes:', error.response.data?.details || '');
    } else if (error.request) {
      console.log('   Erro de conexão:', error.message);
      console.log('   Verifique se o servidor está rodando em', BASE_URL);
    } else {
      console.log('   Erro:', error.message);
    }
    
    console.log('═══════════════════════════════════════════════════════\n');
    process.exit(1);
  }
}

// Executar teste
testAuth();
