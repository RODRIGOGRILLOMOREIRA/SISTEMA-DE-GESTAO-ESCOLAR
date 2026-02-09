import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function limparDuplicatas() {
  console.log('🔍 Verificando duplicatas de dias de trabalho...');
  
  const jornadas = await prisma.configuracao_jornada.findMany();
  
  let corrigidos = 0;
  
  // Mapa de conversão para abreviações
  const conversao: Record<string, string> = {
    'SEGUNDA': 'SEG',
    'TERCA': 'TER',
    'QUARTA': 'QUA',
    'QUINTA': 'QUI',
    'SEXTA': 'SEX',
    'SABADO': 'SAB',
    'DOMINGO': 'DOM'
  };
  
  for (const jornada of jornadas) {
    // Normalizar para abreviações e remover duplicatas
    const diasNormalizados = jornada.diasTrabalho.map(dia => {
      // Se for formato completo, converter para abreviado
      return conversao[dia.toUpperCase()] || dia.toUpperCase();
    });
    
    const diasUnicos = Array.from(new Set(diasNormalizados));
    
    if (diasUnicos.length !== jornada.diasTrabalho.length || 
        JSON.stringify(diasUnicos.sort()) !== JSON.stringify(jornada.diasTrabalho.sort())) {
      console.log(`❌ Problemas encontrados:`, {
        pessoaId: jornada.pessoaId,
        antes: jornada.diasTrabalho,
        depois: diasUnicos
      });
      
      await prisma.configuracao_jornada.update({
        where: { id: jornada.id },
        data: { diasTrabalho: diasUnicos }
      });
      
      corrigidos++;
      console.log(`✅ Corrigido!`);
    }
  }
  
  if (corrigidos === 0) {
    console.log('✅ Nenhuma duplicata encontrada!');
  } else {
    console.log(`\n✅ Total de registros corrigidos: ${corrigidos}`);
  }
  
  await prisma.$disconnect();
}

limparDuplicatas().catch(console.error);
