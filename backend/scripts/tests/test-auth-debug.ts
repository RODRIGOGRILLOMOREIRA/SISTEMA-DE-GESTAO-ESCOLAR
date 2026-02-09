import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

async function testAuth() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'sge_user',
    password: 'sge_password',
    database: 'sge_db'
  });

  try {
    // Buscar usuário
    const result = await pool.query(
      'SELECT id, nome, email, senha, role, "isActive" FROM usuarios WHERE email = $1',
      ['rodrigo-gmoreira@educar.rs.gov.br']
    );

    if (result.rows.length === 0) {
      console.log('❌ Usuário não encontrado');
      return;
    }

    const usuario = result.rows[0];
    console.log('✅ Usuário encontrado:', usuario.nome);
    console.log('Email:', usuario.email);
    console.log('Role:', usuario.role);
    console.log('isActive:', usuario.isActive);
    console.log('Hash armazenado:', usuario.senha.substring(0, 30) + '...');

    // Testar senha
    const senhaTestada = '01020304';
    console.log('\n🔐 Testando senha:', senhaTestada);
    
    const senhaValida = await bcrypt.compare(senhaTestada, usuario.senha);
    
    if (senhaValida) {
      console.log('✅ Senha CORRETA!');
    } else {
      console.log('❌ Senha INCORRETA!');
      
      // Gerar novo hash para comparação
      const novoHash = await bcrypt.hash(senhaTestada, 10);
      console.log('\nNovo hash gerado:', novoHash);
      
      // Testar com o novo hash
      const testeNovoHash = await bcrypt.compare(senhaTestada, novoHash);
      console.log('Teste com novo hash:', testeNovoHash ? 'OK' : 'FALHOU');
    }

  } catch (error: any) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

testAuth();
