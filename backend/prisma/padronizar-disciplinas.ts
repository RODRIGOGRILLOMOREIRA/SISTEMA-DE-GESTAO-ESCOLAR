import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const disciplinasPadrao = [
  'ARTES',
  'CIÊNCIAS',
  'EDUCAÇÃO FÍSICA',
  'ENSINO RELIGIOSO',
  'GEOGRAFIA',
  'HISTÓRIA',
  'INGLÊS',
  'MATEMÁTICA',
  'PORTUGUÊS',
  'PROJETO DE VIDA'
];

async function padronizarDisciplinas() {
  try {
    console.log('Iniciando padronização de disciplinas...\n');
    
    // Buscar todas as disciplinas
    const disciplinasExistentes = await prisma.disciplina.findMany();
    
    // Mapear disciplinas por nome normalizado
    const mapa: Record<string, { ids: string[], nomePadrao: string }> = {};
    
    disciplinasExistentes.forEach(disc => {
      let nomePadrao = disc.nome.toUpperCase().trim();
      
      // Normalizar variações
      if (nomePadrao === 'MATEMATICA') nomePadrao = 'MATEMÁTICA';
      if (nomePadrao === 'PORTUGUES') nomePadrao = 'PORTUGUÊS';
      if (nomePadrao === 'INGLES') nomePadrao = 'INGLÊS';
      if (nomePadrao === 'CIENCIAS') nomePadrao = 'CIÊNCIAS';
      if (nomePadrao === 'HISTORIA') nomePadrao = 'HISTÓRIA';
      if (nomePadrao === 'GEOGRAFIA') nomePadrao = 'GEOGRAFIA';
      if (nomePadrao === 'EDUCACAO FISICA') nomePadrao = 'EDUCAÇÃO FÍSICA';
      
      if (!mapa[nomePadrao]) {
        mapa[nomePadrao] = { ids: [], nomePadrao };
      }
      mapa[nomePadrao].ids.push(disc.id);
    });
    
    // Processar cada disciplina padronizada
    for (const nomePadrao of disciplinasPadrao) {
      if (mapa[nomePadrao]) {
        const { ids } = mapa[nomePadrao];
        
        if (ids.length > 1) {
          console.log(`${nomePadrao}: ${ids.length} duplicatas`);
          const [primeiraId, ...outrasIds] = ids;
          
          // Atualizar nome da primeira para o padrão
          await prisma.disciplina.update({
            where: { id: primeiraId },
            data: { nome: nomePadrao }
          });
          
          // Remover duplicatas
          for (const id of outrasIds) {
            // Atualizar referências
            await prisma.disciplinaTurma.updateMany({
              where: { disciplinaId: id },
              data: { disciplinaId: primeiraId }
            });
            
            await prisma.nota.updateMany({
              where: { disciplinaId: id },
              data: { disciplinaId: primeiraId }
            });
            
            // Deletar duplicata
            await prisma.disciplina.delete({ where: { id } });
          }
        } else {
          // Apenas atualizar nome para o padrão
          await prisma.disciplina.update({
            where: { id: ids[0] },
            data: { nome: nomePadrao }
          });
        }
      } else {
        // Criar disciplina que não existe
        console.log(`Criando: ${nomePadrao}`);
        await prisma.disciplina.create({
          data: {
            nome: nomePadrao,
            cargaHoraria: 60
          }
        });
      }
    }
    
    console.log('\n✅ Disciplinas padronizadas com sucesso!');
    
    // Listar resultado
    const disciplinasFinais = await prisma.disciplina.findMany({
      orderBy: { nome: 'asc' }
    });
    
    console.log('\nDisciplinas finais:');
    disciplinasFinais.forEach(disc => {
      console.log(`- ${disc.nome}`);
    });
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

padronizarDisciplinas();
