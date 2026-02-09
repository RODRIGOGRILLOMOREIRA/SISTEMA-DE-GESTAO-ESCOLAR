import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

const pool = new Pool({
  user: 'sge_user',
  password: 'sge_password',
  host: 'localhost',
  port: 5432,
  database: 'sge_db',
});

async function createAdminUser() {
  console.log('🔐 Criando usuário administrador...\n');

  try {
    // 1. Verificar se usuário já existe
    const checkUser = await pool.query('SELECT * FROM usuarios WHERE email = $1', ['admin@escola.com']);
    
    if (checkUser.rows.length > 0) {
      console.log('⚠️  Usuário admin já existe. Atualizando senha...');
      const senhaHash = await bcrypt.hash('admin123', 10);
      
      await pool.query(
        `UPDATE usuarios 
         SET senha = $1, "isActive" = true, "updatedAt" = CURRENT_TIMESTAMP 
         WHERE email = $2`,
        [senhaHash, 'admin@escola.com']
      );
      
      console.log('✅ Senha do admin atualizada!');
      console.log('\n📋 Credenciais de acesso:');
      console.log('   Email: admin@escola.com');
      console.log('   Senha: admin123');
      
      const updatedUser = await pool.query('SELECT id, nome, email, role, "isActive" FROM usuarios WHERE email = $1', ['admin@escola.com']);
      console.log('\n👤 Usuário:', updatedUser.rows[0]);
    } else {
      console.log('📝 Criando novo usuário admin...');
      const senhaHash = await bcrypt.hash('admin123', 10);
      
      const result = await pool.query(
        `INSERT INTO usuarios (id, nome, email, senha, role, "isActive", "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), $1, $2, $3, $4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id, nome, email, role, "isActive"`,
        ['Administrador', 'admin@escola.com', senhaHash, 'ADMIN']
      );
      
      console.log('✅ Usuário admin criado com sucesso!');
      console.log('\n📋 Credenciais de acesso:');
      console.log('   Email: admin@escola.com');
      console.log('   Senha: admin123');
      console.log('\n👤 Usuário:', result.rows[0]);
    }

    // 2. Verificar estrutura da tabela
    const tableInfo = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'usuarios'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📊 Estrutura da tabela usuarios:');
    console.table(tableInfo.rows);

    // 3. Testar o hash da senha
    const user = await pool.query('SELECT senha FROM usuarios WHERE email = $1', ['admin@escola.com']);
    const senhaCorreta = await bcrypt.compare('admin123', user.rows[0].senha);
    
    console.log('\n🔐 Teste de validação de senha:');
    console.log('   Senha testada: admin123');
    console.log('   Hash válido:', senhaCorreta ? '✅ SIM' : '❌ NÃO');

    if (!senhaCorreta) {
      throw new Error('Hash de senha inválido! Algo está errado.');
    }

    console.log('\n✅ TUDO PRONTO! Sistema de autenticação configurado corretamente.');
    
  } catch (error: any) {
    console.error('❌ Erro:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

createAdminUser()
  .then(() => {
    console.log('\n🎉 Setup concluído com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Falha no setup:', error);
    process.exit(1);
  });
