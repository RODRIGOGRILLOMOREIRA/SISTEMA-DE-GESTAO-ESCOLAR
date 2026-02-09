import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const diretores = await prisma.equipe_diretiva.findMany();
  const usuariosDiretores = await prisma.usuarios.findMany({
    where: {
      role: 'DIRECAO'
    }
  });

  console.log('\n🎯 DIRETORES CADASTRADOS:\n');
  
  diretores.forEach(d => {
    const usuario = usuariosDiretores.find(u => u.email === d.email);
    console.log(`📌 ${d.cargo.toUpperCase()}`);
    console.log(`   Nome: ${d.nome}`);
    console.log(`   Email: ${d.email}`);
    if (usuario) {
      console.log(`   ✅ Usuário criado no sistema`);
    } else {
      console.log(`   ❌ Usuário NÃO encontrado!`);
    }
    console.log(`   Senha: Direcao@2025\n`);
  });

  console.log(`\n📊 Total: ${diretores.length} diretores / ${usuariosDiretores.length} usuários com role DIRECAO\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
