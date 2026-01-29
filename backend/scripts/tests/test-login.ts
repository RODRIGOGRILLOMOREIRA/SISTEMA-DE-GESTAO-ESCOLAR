import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testLogin() {
  try {
    console.log('🔍 Testando login...\n');
    
    const email = 'admin@escola.com';
    const senha = 'admin123';
    
    // Buscar usuário
    const usuario = await prisma.usuarios.findUnique({
      where: { email }
    });
    
    if (!usuario) {
      console.log('❌ Usuário não encontrado');
      return;
    }
    
    console.log('✅ Usuário encontrado:');
    console.log('   Email:', usuario.email);
    console.log('   Nome:', usuario.nome);
    console.log('   Tipo:', usuario.tipo);
    console.log('   Ativo:', usuario.ativo);
    console.log('   Tem senha:', !!usuario.senha);
    console.log('   Hash da senha:', usuario.senha.substring(0, 20) + '...');
    console.log('');
    
    // Testar senha
    console.log('🔐 Testando senha "admin123"...');
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    
    if (senhaValida) {
      console.log('✅ Senha válida! Login deve funcionar.');
    } else {
      console.log('❌ Senha inválida! Verificando...');
      
      // Gerar novo hash para comparação
      const novoHash = await bcrypt.hash(senha, 10);
      console.log('   Novo hash gerado:', novoHash.substring(0, 20) + '...');
      
      // Testar novo hash
      const testeNovoHash = await bcrypt.compare(senha, novoHash);
      console.log('   Teste com novo hash:', testeNovoHash ? '✅' : '❌');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
