/// <reference types="node" />

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Limpando banco de dados para estado limpo...\n');
  console.log('⚠️  ATENÇÃO: Esta operação irá DELETAR todos os dados de teste!\n');
  
  try {
    console.log('⏳ Aguarde 3 segundos para cancelar (Ctrl+C)...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('\n🗑️  Iniciando limpeza...\n');
    
    // Deletar em ordem (respeitando foreign keys)
    console.log('  Deletando frequências...');
    await prisma.frequencias.deleteMany({});
    
    console.log('  Deletando presenças de alunos...');
    await prisma.presencaAluno.deleteMany({});
    
    console.log('  Deletando notas finais...');
    await prisma.notas_finais.deleteMany({});
    
    console.log('  Deletando notas...');
    await prisma.notas.deleteMany({});
    
    console.log('  Deletando matrículas...');
    await prisma.matriculas.deleteMany({});
    
    console.log('  Deletando registros de frequência...');
    await prisma.registro_frequencia.deleteMany({});
    
    console.log('  Deletando horários de aula...');
    await prisma.horarios_aula.deleteMany({});
    
    console.log('  Deletando grade horária...');
    await prisma.grade_horaria.deleteMany({});
    
    console.log('  Deletando vínculos disciplina-turma...');
    await prisma.disciplinas_turmas.deleteMany({});
    
    console.log('  Deletando alunos...');
    await prisma.alunos.deleteMany({});
    
    console.log('  Deletando turmas...');
    await prisma.turmas.deleteMany({});
    
    console.log('  Deletando disciplinas...');
    await prisma.disciplinas.deleteMany({});
    
    console.log('  Deletando professores...');
    await prisma.professores.deleteMany({});
    
    console.log('  Deletando funcionários...');
    await prisma.funcionarios.deleteMany({});
    
    console.log('  Deletando equipe diretiva...');
    await prisma.equipe_diretiva.deleteMany({});
    
    console.log('  Deletando usuários (exceto admin)...');
    await prisma.usuarios.deleteMany({
      where: {
        role: {
          not: 'ADMIN'
        }
      }
    });
    
    console.log('  Deletando registros de ponto...');
    await prisma.registro_ponto.deleteMany({});
    
    console.log('\n✅ Banco de dados limpo com sucesso!');
    console.log('📊 O banco está pronto para receber dados reais.\n');
    console.log('💡 Usuário admin foi preservado para acesso ao sistema.\n');
    
  } catch (error) {
    console.error('❌ Erro ao limpar banco:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
