import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Inicializando banco de dados...');
  console.log('');

  // Criar usuário administrador
  console.log('👤 Criando usuário administrador...');
  const senhaHash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.usuarios.upsert({
    where: { email: 'admin@escola.com' },
    update: {
      senha: senhaHash,
      ativo: true,
      updatedAt: new Date(),
    },
    create: {
      id: 'admin-001',
      nome: 'Administrador',
      email: 'admin@escola.com',
      senha: senhaHash,
      tipo: 'ADMIN',
      ativo: true,
      updatedAt: new Date(),
    },
  });

  console.log('   ✅ Usuário criado:', admin.email);

  // Criar configuração padrão
  console.log('');
  console.log('⚙️  Criando configurações padrão...');
  
  const config = await prisma.configuracoes.upsert({
    where: { id: 'config-001' },
    update: {},
    create: {
      id: 'config-001',
      nomeEscola: 'Sistema de Gestão Escolar',
      redeEscolar: 'Rede Municipal',
      endereco: 'Rua Exemplo, 123 - Centro',
      telefone: '(00) 0000-0000',
      email: 'contato@escola.com',
      temaModo: 'light',
      updatedAt: new Date(),
    },
  });

  console.log('   ✅ Configurações criadas');

  console.log('');
  console.log('✨ Seed concluído com sucesso!');
  console.log('');
  console.log('📌 Credenciais de acesso:');
  console.log('   📧 Email: admin@escola.com');
  console.log('   🔑 Senha: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao criar usuário:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
