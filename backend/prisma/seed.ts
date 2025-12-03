import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Criando usuário administrador...');

  const senhaHash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@escola.com' },
    update: {},
    create: {
      id: 'admin-001',
      nome: 'Administrador',
      email: 'admin@escola.com',
      senha: senhaHash,
      tipo: 'ADMIN',
      ativo: true,
    },
  });

  console.log('✅ Usuário administrador criado:', admin.email);
  console.log('📧 Email: admin@escola.com');
  console.log('🔑 Senha: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao criar usuário:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
