import axios from 'axios';

async function testLogin() {
  try {
    const response = await axios.post('http://192.168.3.12:3333/api/auth/login', {
      email: 'rodrigo-gmoreira@educar.rs.gov.br',
      senha: '01020304'
    });
    
    console.log('✅ Login bem-sucedido!');
    console.log('Token:', response.data.token?.substring(0, 50) + '...');
    console.log('Usuário:', response.data.user?.nome);
  } catch (error: any) {
    console.log('❌ Erro no login');
    console.log('Status:', error.response?.status);
    console.log('Erro:', error.response?.data);
  }
}

testLogin();
