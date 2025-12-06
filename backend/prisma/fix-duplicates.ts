import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixDuplicates() {
  try {
    // Buscar todas as disciplinas
    const disciplinas = await prisma.disciplina.findMany();
    
    console.log('Total de disciplinas:', disciplinas.length);
    
    // Mapear disciplinas por nome normalizado
    const disciplinasMap = new Map<string, string[]>();
    
    disciplinas.forEach(disc => {
      const nomeNormalizado = disc.nome.toUpperCase().trim();
      if (!disciplinasMap.has(nomeNormalizado)) {
        disciplinasMap.set(nomeNormalizado, []);
      }
      disciplinasMap.get(nomeNormalizado)!.push(disc.id);
    });
    
    // Encontrar duplicatas
    console.log('\nDisciplinas duplicadas:');
    for (const [nome, ids] of disciplinasMap.entries()) {
      if (ids.length > 1) {
        console.log(`- ${nome}: ${ids.length} duplicatas`);
        
        // Manter a primeira, deletar as outras
        const [primeiraId, ...outrasIds] = ids;
        
        for (const id of outrasIds) {
          console.log(`  Deletando duplicata: ${id}`);
          
          // Atualizar referências em DisciplinaTurma
          await prisma.disciplinaTurma.updateMany({
            where: { disciplinaId: id },
            data: { disciplinaId: primeiraId }
          });
          
          // Atualizar referências em Notas
          await prisma.nota.updateMany({
            where: { disciplinaId: id },
            data: { disciplinaId: primeiraId }
          });
          
          // Deletar a disciplina duplicada
          await prisma.disciplina.delete({
            where: { id }
          });
        }
      }
    }
    
    console.log('\nDuplicatas removidas com sucesso!');
    
    // Listar disciplinas restantes
    const disciplinasFinais = await prisma.disciplina.findMany({
      orderBy: { nome: 'asc' }
    });
    
    console.log('\nDisciplinas após limpeza:');
    disciplinasFinais.forEach(disc => {
      console.log(`- ${disc.nome}`);
    });
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDuplicates();
