/// <reference types="node" />

import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// ============================================
// GERADORES DE NOTAS E FREQUÊNCIAS
// ============================================

function gerarNota(perfil: 'excelente' | 'bom' | 'regular' | 'ruim'): number {
  switch (perfil) {
    case 'excelente':
      return parseFloat((8.5 + Math.random() * 1.5).toFixed(1)); // 8.5 a 10.0
    case 'bom':
      return parseFloat((7.0 + Math.random() * 1.5).toFixed(1)); // 7.0 a 8.5
    case 'regular':
      return parseFloat((5.5 + Math.random() * 1.5).toFixed(1)); // 5.5 a 7.0
    case 'ruim':
      return parseFloat((3.0 + Math.random() * 2.5).toFixed(1)); // 3.0 a 5.5
  }
}

function definirPerfilAluno(): 'excelente' | 'bom' | 'regular' | 'ruim' {
  const rand = Math.random();
  if (rand < 0.25) return 'excelente'; // 25% excelentes
  if (rand < 0.60) return 'bom';       // 35% bons
  if (rand < 0.85) return 'regular';   // 25% regulares
  return 'ruim';                        // 15% ruins
}

function calcularMedia(av1: number, av2: number, av3: number): number {
  return parseFloat(((av1 + av2 + av3) / 3).toFixed(1));
}

function gerarFrequencia(perfil: 'excelente' | 'bom' | 'regular' | 'ruim'): number {
  switch (perfil) {
    case 'excelente':
      return 0.95 + Math.random() * 0.05; // 95% a 100%
    case 'bom':
      return 0.88 + Math.random() * 0.07; // 88% a 95%
    case 'regular':
      return 0.78 + Math.random() * 0.10; // 78% a 88%
    case 'ruim':
      return 0.65 + Math.random() * 0.13; // 65% a 78%
  }
}

async function gerarNotasParaAluno(alunoId: string, disciplinas: any[], perfil: 'excelente' | 'bom' | 'regular' | 'ruim') {
  const notas = [];
  
  for (const disciplina of disciplinas) {
    for (let trimestre = 1; trimestre <= 3; trimestre++) {
      const av1 = gerarNota(perfil);
      const av2 = gerarNota(perfil);
      const av3 = gerarNota(perfil);
      const mediaM1 = calcularMedia(av1, av2, av3);
      
      // Se média < 7, gera nota do EAC
      const avaliacaoEAC = mediaM1 < 7.0 ? gerarNota(perfil === 'ruim' ? 'regular' : perfil) : null;
      const notaFinal = avaliacaoEAC ? parseFloat(((mediaM1 + avaliacaoEAC) / 2).toFixed(1)) : mediaM1;
      
      notas.push({
        id: uuidv4(),
        alunoId,
        disciplinaId: disciplina.id,
        trimestre,
        anoLetivo: 2025,
        avaliacao01: av1,
        avaliacao02: av2,
        avaliacao03: av3,
        mediaM1,
        avaliacaoEAC,
        notaFinalTrimestre: notaFinal,
        observacao: notaFinal < 6.0 ? 'Aluno precisa de reforço' : null,
        updatedAt: new Date()
      });
    }
  }
  
  return notas;
}

async function gerarNotasFinaisParaAluno(alunoId: string, disciplinas: any[]) {
  const notasFinais = [];
  
  for (const disciplina of disciplinas) {
    // Buscar notas dos 3 trimestres
    const notasTrimestres = await prisma.notas.findMany({
      where: {
        alunoId,
        disciplinaId: disciplina.id,
        anoLetivo: 2025
      },
      orderBy: { trimestre: 'asc' }
    });
    
    if (notasTrimestres.length === 3) {
      const trim1 = notasTrimestres[0].notaFinalTrimestre || 0;
      const trim2 = notasTrimestres[1].notaFinalTrimestre || 0;
      const trim3 = notasTrimestres[2].notaFinalTrimestre || 0;
      const mediaFinal = parseFloat(((trim1 + trim2 + trim3) / 3).toFixed(1));
      
      notasFinais.push({
        id: uuidv4(),
        alunoId,
        disciplinaId: disciplina.id,
        anoLetivo: 2025,
        trimestre1: trim1,
        trimestre2: trim2,
        trimestre3: trim3,
        mediaFinal,
        aprovado: mediaFinal >= 6.0,
        updatedAt: new Date()
      });
    }
  }
  
  return notasFinais;
}

async function gerarFrequenciasParaAluno(alunoId: string, turmaId: string, perfil: 'excelente' | 'bom' | 'regular' | 'ruim') {
  const frequencias = [];
  const diasLetivos = 200; // 200 dias letivos no ano
  const percentualPresenca = gerarFrequencia(perfil);
  const diasPresentes = Math.floor(diasLetivos * percentualPresenca);
  
  // Gerar datas do ano letivo (fevereiro a dezembro)
  const dataInicio = new Date(2025, 1, 1); // 1º de fevereiro
  const dataFim = new Date(2025, 11, 20); // 20 de dezembro
  
  for (let i = 0; i < diasLetivos; i++) {
    const diasPassados = Math.floor((dataFim.getTime() - dataInicio.getTime()) / diasLetivos * i);
    const data = new Date(dataInicio.getTime() + diasPassados);
    
    // Pular fins de semana
    if (data.getDay() === 0 || data.getDay() === 6) continue;
    
    const presente = i < diasPresentes;
    
    frequencias.push({
      id: uuidv4(),
      alunoId,
      turmaId,
      data,
      presente,
      observacao: !presente ? 'Ausência justificada' : null,
      updatedAt: new Date()
    });
  }
  
  return frequencias;
}

async function processarLoteAlunos(alunos: any[], disciplinas: any[]) {
  console.log(`\n  🔄 Processando lote de ${alunos.length} alunos...`);
  
  const perfis = alunos.map(a => ({ alunoId: a.id, perfil: definirPerfilAluno() }));
  
  // 1. Gerar todas as notas
  console.log('    📝 Gerando notas...');
  const todasNotas = [];
  for (const { alunoId, perfil } of perfis) {
    const notasAluno = await gerarNotasParaAluno(alunoId, disciplinas, perfil);
    todasNotas.push(...notasAluno);
  }
  
  // Inserir notas em sub-lotes de 100
  for (let i = 0; i < todasNotas.length; i += 100) {
    const sublote = todasNotas.slice(i, i + 100);
    await prisma.notas.createMany({ data: sublote });
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  console.log(`    ✅ ${todasNotas.length} notas inseridas`);
  
  // 2. Gerar notas finais
  console.log('    📊 Calculando notas finais...');
  const todasNotasFinais = [];
  for (const aluno of alunos) {
    const notasFinais = await gerarNotasFinaisParaAluno(aluno.id, disciplinas);
    todasNotasFinais.push(...notasFinais);
  }
  
  if (todasNotasFinais.length > 0) {
    await prisma.notas_finais.createMany({ data: todasNotasFinais });
  }
  console.log(`    ✅ ${todasNotasFinais.length} notas finais calculadas`);
  
  // 3. Gerar frequências
  console.log('    📅 Gerando frequências...');
  const todasFrequencias = [];
  for (const { alunoId, perfil } of perfis) {
    const aluno = alunos.find(a => a.id === alunoId);
    const frequencias = await gerarFrequenciasParaAluno(alunoId, aluno!.turmaId, perfil);
    todasFrequencias.push(...frequencias);
  }
  
  // Inserir frequências em sub-lotes de 200
  for (let i = 0; i < todasFrequencias.length; i += 200) {
    const sublote = todasFrequencias.slice(i, i + 200);
    await prisma.frequencias.createMany({ data: sublote });
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  console.log(`    ✅ ${todasFrequencias.length} registros de frequência inseridos`);
}

async function main() {
  console.log('🚀 Gerando notas e frequências para todos os alunos...\n');
  
  try {
    // Buscar todos os alunos
    const alunos = await prisma.alunos.findMany({
      select: { id: true, turmaId: true }
    });
    
    if (alunos.length === 0) {
      console.error('❌ Nenhum aluno encontrado! Execute primeiro: npm run seed:alunos');
      process.exit(1);
    }
    
    console.log(`👥 Alunos encontrados: ${alunos.length}`);
    
    // Buscar todas as disciplinas
    const disciplinas = await prisma.disciplinas.findMany();
    console.log(`📚 Disciplinas: ${disciplinas.length}`);
    
    // Processar em lotes de 10 alunos por vez
    const tamanhoDeLote = 10;
    const totalLotes = Math.ceil(alunos.length / tamanhoDeLote);
    
    console.log(`\n📦 Processando ${totalLotes} lotes de ${tamanhoDeLote} alunos...`);
    
    for (let i = 0; i < alunos.length; i += tamanhoDeLote) {
      const lote = alunos.slice(i, i + tamanhoDeLote);
      const numeroLote = Math.floor(i / tamanhoDeLote) + 1;
      
      console.log(`\n📦 Lote ${numeroLote}/${totalLotes}`);
      await processarLoteAlunos(lote, disciplinas);
      
      // Pausa entre lotes para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Estatísticas finais
    const totalNotas = await prisma.notas.count();
    const totalNotasFinais = await prisma.notas_finais.count();
    const totalFrequencias = await prisma.frequencias.count();
    
    // Estatísticas de aprovação
    const aprovados = await prisma.notas_finais.count({
      where: { aprovado: true }
    });
    const reprovados = await prisma.notas_finais.count({
      where: { aprovado: false }
    });
    
    const taxaAprovacao = totalNotasFinais > 0 
      ? ((aprovados / totalNotasFinais) * 100).toFixed(1) 
      : 0;
    
    console.log('\n✅ Notas e frequências geradas com sucesso!');
    console.log(`\n📊 Resumo Final:`);
    console.log(`   - ${totalNotas} Notas por trimestre`);
    console.log(`   - ${totalNotasFinais} Notas finais calculadas`);
    console.log(`   - ${totalFrequencias} Registros de frequência`);
    console.log(`   - ${aprovados} Aprovações (${taxaAprovacao}%)`);
    console.log(`   - ${reprovados} Reprovações`);
    
    console.log('\n⏳ Próxima etapa: Execute "npm run analyze:system" para gerar relatório de análise\n');
    
  } catch (error) {
    console.error('❌ Erro ao gerar notas:', error);
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
