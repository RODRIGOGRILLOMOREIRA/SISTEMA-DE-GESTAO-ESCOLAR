import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n📊 VERIFICAÇÃO COMPLETA DO BANCO DE DADOS\n');
  
  const diretores = await prisma.equipe_diretiva.count();
  const funcionarios = await prisma.funcionarios.count();
  const professores = await prisma.professores.count();
  const disciplinas = await prisma.disciplinas.count();
  const turmas = await prisma.turmas.count();
  const alunos = await prisma.alunos.count();
  const matriculas = await prisma.matriculas.count();
  const notas = await prisma.notas.count();
  const notasFinais = await prisma.notas_finais.count();
  const frequencias = await prisma.frequencias.count();
  const disciplinasTurmas = await prisma.disciplinas_turmas.count();
  const usuarios = await prisma.usuarios.count();
  
  console.log('👥 Equipe Diretiva:', diretores);
  console.log('🏢 Funcionários:', funcionarios);
  console.log('👨‍🏫 Professores:', professores);
  console.log('📚 Disciplinas:', disciplinas);
  console.log('🎓 Turmas:', turmas);
  console.log('👦 Alunos:', alunos);
  console.log('📋 Matrículas:', matriculas);
  console.log('📝 Notas:', notas);
  console.log('📊 Notas Finais:', notasFinais);
  console.log('📅 Frequências:', frequencias);
  console.log('🔗 Disciplinas-Turmas:', disciplinasTurmas);
  console.log('🔐 Usuários:', usuarios);
  
  console.log('\n✅ Verificação completa!\n');
  
  // Verificar algumas turmas com alunos
  console.log('🎓 TURMAS COM ALUNOS:\n');
  const turmasComAlunos = await prisma.turmas.findMany({
    include: {
      matriculas: {
        include: {
          alunos: true
        }
      }
    }
  });
  
  turmasComAlunos.forEach(turma => {
    console.log(`   ${turma.nome} (${turma.etapaEnsino}) - ${turma.matriculas.length} alunos`);
  });
  
  console.log('\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
