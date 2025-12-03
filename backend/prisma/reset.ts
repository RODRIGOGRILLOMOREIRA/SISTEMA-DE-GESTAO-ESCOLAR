import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function reset() {
  console.log('🔄 Resetando banco de dados...');
  
  // Deletar todos os usuários
  await prisma.usuario.deleteMany({});
  console.log('✅ Todos os usuários deletados');

  // Criar admin
  const senhaHash = await bcrypt.hash('admin123', 10);
  await prisma.usuario.create({
    data: {
      id: 'admin-001',
      nome: 'Administrador',
      email: 'admin@escola.com',
      senha: senhaHash,
      tipo: 'ADMIN',
      ativo: true,
    },
  });

  console.log('✅ Reset completo!');
  console.log('📧 Email: admin@escola.com');
  console.log('🔑 Senha: admin123');
}

reset()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
