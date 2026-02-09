const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'sge_user',
  password: 'sge_password',
  host: 'localhost',
  port: 5432,
  database: 'sge_db',
});

async function setup() {
  console.log('🔐 Criando usuário admin...\n');

  try {
    // Hash da senha
    const senhaHash = await bcrypt.hash('admin123', 10);
    console.log('Hash gerado:', senhaHash);

    // Deletar admin existente
    await pool.query('DELETE FROM usuarios WHERE email = $1', ['admin@escola.com']);
    console.log('✅ Admin antigo removido');

    // Criar novo admin
    const result = await pool.query(
      `INSERT INTO usuarios (id, nome, email, senha, role, "isActive", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id, nome, email, role, "isActive"`,
      ['Administrador', 'admin@escola.com', senhaHash, 'ADMIN']
    );

    console.log('\n✅ Admin criado:', result.rows[0]);
    console.log('\n📋 Credenciais:');
    console.log('   Email: admin@escola.com');
    console.log('   Senha: admin123');

    // Testar senha
    const check = await pool.query('SELECT senha FROM usuarios WHERE email = $1', ['admin@escola.com']);
    const valid = await bcrypt.compare('admin123', check.rows[0].senha);
    console.log('\n🔐 Validação:', valid ? '✅ SENHA VÁLIDA' : '❌ SENHA INVÁLIDA');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

setup();
