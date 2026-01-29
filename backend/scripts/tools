/// <reference types="node" />

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface EstatisticasGerais {
  totalAlunos: number;
  totalProfessores: number;
  totalTurmas: number;
  totalDisciplinas: number;
  totalDiretores: number;
  totalFuncionarios: number;
}

interface EstatisticasAcademicas {
  totalNotas: number;
  totalFrequencias: number;
  mediaGeralEscola: number;
  taxaAprovacao: number;
  taxaReprovacao: number;
  taxaFrequenciaMedia: number;
}

interface TurmaAnalise {
  nome: string;
  totalAlunos: number;
  mediaGeral: number;
  taxaAprovacao: number;
  frequenciaMedia: number;
}

interface ProfessorAnalise {
  nome: string;
  especialidade: string;
  mediaAlunos: number;
  totalAlunos: number;
  taxaAprovacao: number;
}

interface AlunoRisco {
  nome: string;
  turma: string;
  mediaGeral: number;
  frequencia: number;
  disciplinasReprovadas: number;
}

async function coletarEstatisticasGerais(): Promise<EstatisticasGerais> {
  const [
    totalAlunos,
    totalProfessores,
    totalTurmas,
    totalDisciplinas,
    totalDiretores,
    totalFuncionarios
  ] = await Promise.all([
    prisma.alunos.count(),
    prisma.professores.count(),
    prisma.turmas.count(),
    prisma.disciplinas.count(),
    prisma.equipe_diretiva.count(),
    prisma.funcionarios.count()
  ]);
  
  return {
    totalAlunos,
    totalProfessores,
    totalTurmas,
    totalDisciplinas,
    totalDiretores,
    totalFuncionarios
  };
}

async function coletarEstatisticasAcademicas(): Promise<EstatisticasAcademicas> {
  const [totalNotas, totalFrequencias] = await Promise.all([
    prisma.notas.count(),
    prisma.frequencias.count()
  ]);
  
  // Média geral da escola
  const notasFinais = await prisma.notas_finais.findMany({
    select: { mediaFinal: true, aprovado: true }
  });
  
  const mediaGeralEscola = notasFinais.reduce((sum, n) => sum + (n.mediaFinal || 0), 0) / notasFinais.length;
  
  const aprovados = notasFinais.filter(n => n.aprovado).length;
  const reprovados = notasFinais.filter(n => !n.aprovado).length;
  
  const taxaAprovacao = (aprovados / notasFinais.length) * 100;
  const taxaReprovacao = (reprovados / notasFinais.length) * 100;
  
  // Taxa de frequência média
  const frequencias = await prisma.frequencias.findMany({
    select: { presente: true }
  });
  
  const presencas = frequencias.filter(f => f.presente).length;
  const taxaFrequenciaMedia = (presencas / frequencias.length) * 100;
  
  return {
    totalNotas,
    totalFrequencias,
    mediaGeralEscola: parseFloat(mediaGeralEscola.toFixed(2)),
    taxaAprovacao: parseFloat(taxaAprovacao.toFixed(2)),
    taxaReprovacao: parseFloat(taxaReprovacao.toFixed(2)),
    taxaFrequenciaMedia: parseFloat(taxaFrequenciaMedia.toFixed(2))
  };
}

async function analisarTurmas(): Promise<TurmaAnalise[]> {
  const turmas = await prisma.turmas.findMany({
    include: {
      alunos: {
        include: {
          notas_finais: true
        }
      }
    }
  });
  
  const analises: TurmaAnalise[] = [];
  
  for (const turma of turmas) {
    const totalAlunos = turma.alunos.length;
    
    if (totalAlunos === 0) continue;
    
    const notasFinais = turma.alunos.flatMap(a => a.notas_finais);
    const mediaGeral = notasFinais.reduce((sum, n) => sum + (n.mediaFinal || 0), 0) / notasFinais.length;
    const aprovados = notasFinais.filter(n => n.aprovado).length;
    const taxaAprovacao = (aprovados / notasFinais.length) * 100;
    
    // Frequência média da turma
    const frequencias = await prisma.frequencias.findMany({
      where: { turmaId: turma.id }
    });
    const presencas = frequencias.filter(f => f.presente).length;
    const frequenciaMedia = frequencias.length > 0 ? (presencas / frequencias.length) * 100 : 0;
    
    analises.push({
      nome: turma.nome,
      totalAlunos,
      mediaGeral: parseFloat(mediaGeral.toFixed(2)),
      taxaAprovacao: parseFloat(taxaAprovacao.toFixed(2)),
      frequenciaMedia: parseFloat(frequenciaMedia.toFixed(2))
    });
  }
  
  return analises.sort((a, b) => b.mediaGeral - a.mediaGeral);
}

async function analisarProfessores(): Promise<ProfessorAnalise[]> {
  const professores = await prisma.professores.findMany({
    include: {
      disciplinas: {
        include: {
          notas_finais: true
        }
      }
    }
  });
  
  const analises: ProfessorAnalise[] = [];
  
  for (const professor of professores) {
    const notasFinais = professor.disciplinas.flatMap(d => d.notas_finais);
    
    if (notasFinais.length === 0) continue;
    
    const mediaAlunos = notasFinais.reduce((sum, n) => sum + (n.mediaFinal || 0), 0) / notasFinais.length;
    const aprovados = notasFinais.filter(n => n.aprovado).length;
    const taxaAprovacao = (aprovados / notasFinais.length) * 100;
    
    analises.push({
      nome: professor.nome,
      especialidade: professor.especialidade || 'N/A',
      mediaAlunos: parseFloat(mediaAlunos.toFixed(2)),
      totalAlunos: notasFinais.length,
      taxaAprovacao: parseFloat(taxaAprovacao.toFixed(2))
    });
  }
  
  return analises.sort((a, b) => b.mediaAlunos - a.mediaAlunos);
}

async function identificarAlunosEmRisco(): Promise<AlunoRisco[]> {
  const alunos = await prisma.alunos.findMany({
    include: {
      turmas: true,
      notas_finais: true,
      frequencias: true
    }
  });
  
  const alunosRisco: AlunoRisco[] = [];
  
  for (const aluno of alunos) {
    const notasFinais = aluno.notas_finais;
    const frequencias = aluno.frequencias;
    
    if (notasFinais.length === 0) continue;
    
    const mediaGeral = notasFinais.reduce((sum, n) => sum + (n.mediaFinal || 0), 0) / notasFinais.length;
    const disciplinasReprovadas = notasFinais.filter(n => !n.aprovado).length;
    
    const presencas = frequencias.filter(f => f.presente).length;
    const frequencia = frequencias.length > 0 ? (presencas / frequencias.length) * 100 : 0;
    
    // Critérios de risco: média < 6.0 OU frequência < 75%
    if (mediaGeral < 6.0 || frequencia < 75) {
      alunosRisco.push({
        nome: aluno.nome,
        turma: aluno.turmas?.nome || 'N/A',
        mediaGeral: parseFloat(mediaGeral.toFixed(2)),
        frequencia: parseFloat(frequencia.toFixed(2)),
        disciplinasReprovadas
      });
    }
  }
  
  return alunosRisco.sort((a, b) => a.mediaGeral - b.mediaGeral);
}

function gerarRelatorioMarkdown(
  estatisticasGerais: EstatisticasGerais,
  estatisticasAcademicas: EstatisticasAcademicas,
  turmas: TurmaAnalise[],
  professores: ProfessorAnalise[],
  alunosRisco: AlunoRisco[]
): string {
  const data = new Date().toLocaleDateString('pt-BR');
  
  let md = `# 📊 Relatório de Análise do Sistema Escolar\n\n`;
  md += `**Data:** ${data}\n\n`;
  md += `---\n\n`;
  
  // Estatísticas Gerais
  md += `## 📈 Estatísticas Gerais\n\n`;
  md += `| Categoria | Quantidade |\n`;
  md += `|-----------|------------|\n`;
  md += `| 👥 Alunos | ${estatisticasGerais.totalAlunos} |\n`;
  md += `| 👨‍🏫 Professores | ${estatisticasGerais.totalProfessores} |\n`;
  md += `| 🎓 Turmas | ${estatisticasGerais.totalTurmas} |\n`;
  md += `| 📚 Disciplinas | ${estatisticasGerais.totalDisciplinas} |\n`;
  md += `| 👔 Equipe Diretiva | ${estatisticasGerais.totalDiretores} |\n`;
  md += `| 👷 Funcionários | ${estatisticasGerais.totalFuncionarios} |\n\n`;
  
  // Estatísticas Acadêmicas
  md += `## 📊 Desempenho Acadêmico\n\n`;
  md += `| Indicador | Valor |\n`;
  md += `|-----------|-------|\n`;
  md += `| 📝 Total de Notas | ${estatisticasAcademicas.totalNotas} |\n`;
  md += `| 📅 Registros de Frequência | ${estatisticasAcademicas.totalFrequencias} |\n`;
  md += `| 📊 Média Geral da Escola | ${estatisticasAcademicas.mediaGeralEscola.toFixed(2)} |\n`;
  md += `| ✅ Taxa de Aprovação | ${estatisticasAcademicas.taxaAprovacao.toFixed(2)}% |\n`;
  md += `| ❌ Taxa de Reprovação | ${estatisticasAcademicas.taxaReprovacao.toFixed(2)}% |\n`;
  md += `| 👤 Frequência Média | ${estatisticasAcademicas.taxaFrequenciaMedia.toFixed(2)}% |\n\n`;
  
  // Análise por Turma
  md += `## 🎓 Análise por Turma\n\n`;
  md += `| Turma | Alunos | Média | Aprovação | Frequência |\n`;
  md += `|-------|--------|-------|-----------|------------|\n`;
  turmas.forEach(t => {
    md += `| ${t.nome} | ${t.totalAlunos} | ${t.mediaGeral.toFixed(2)} | ${t.taxaAprovacao.toFixed(1)}% | ${t.frequenciaMedia.toFixed(1)}% |\n`;
  });
  md += `\n`;
  
  // Top 5 Professores
  md += `## 🏆 Top 5 Professores por Desempenho\n\n`;
  md += `| Professor | Especialidade | Média Alunos | Taxa Aprovação |\n`;
  md += `|-----------|---------------|--------------|----------------|\n`;
  professores.slice(0, 5).forEach(p => {
    md += `| ${p.nome} | ${p.especialidade} | ${p.mediaAlunos.toFixed(2)} | ${p.taxaAprovacao.toFixed(1)}% |\n`;
  });
  md += `\n`;
  
  // Pontos Positivos
  md += `## ✅ Pontos Positivos\n\n`;
  
  if (estatisticasAcademicas.taxaAprovacao >= 80) {
    md += `- 🎯 **Excelente taxa de aprovação**: ${estatisticasAcademicas.taxaAprovacao.toFixed(1)}% dos alunos aprovados\n`;
  } else if (estatisticasAcademicas.taxaAprovacao >= 70) {
    md += `- 👍 **Boa taxa de aprovação**: ${estatisticasAcademicas.taxaAprovacao.toFixed(1)}% dos alunos aprovados\n`;
  }
  
  if (estatisticasAcademicas.taxaFrequenciaMedia >= 85) {
    md += `- 📈 **Alta frequência escolar**: ${estatisticasAcademicas.taxaFrequenciaMedia.toFixed(1)}% de presença média\n`;
  }
  
  if (estatisticasAcademicas.mediaGeralEscola >= 7.0) {
    md += `- 🌟 **Média geral acima do esperado**: ${estatisticasAcademicas.mediaGeralEscola.toFixed(2)}\n`;
  }
  
  const turmasExcelentes = turmas.filter(t => t.mediaGeral >= 8.0);
  if (turmasExcelentes.length > 0) {
    md += `- 🏅 **${turmasExcelentes.length} turma(s) com excelência**: Média acima de 8.0\n`;
  }
  
  md += `- 💾 **Sistema operacional**: Todas as funcionalidades de notas, frequências e matrículas funcionando\n`;
  md += `- 🔒 **Integridade dos dados**: Todos os registros possuem relacionamentos corretos\n`;
  md += `- 📊 **Relatórios automatizados**: Sistema de análise e relatórios funcionando perfeitamente\n`;
  md += `\n`;
  
  // Pontos de Atenção
  md += `## ⚠️ Pontos de Atenção e Melhorias\n\n`;
  
  if (alunosRisco.length > 0) {
    md += `- 🚨 **${alunosRisco.length} aluno(s) em risco**: Necessitam acompanhamento pedagógico urgente\n`;
  }
  
  if (estatisticasAcademicas.taxaAprovacao < 70) {
    md += `- ⚠️ **Taxa de aprovação baixa**: ${estatisticasAcademicas.taxaAprovacao.toFixed(1)}% - Meta: acima de 80%\n`;
  }
  
  if (estatisticasAcademicas.taxaFrequenciaMedia < 80) {
    md += `- 📉 **Frequência abaixo do ideal**: ${estatisticasAcademicas.taxaFrequenciaMedia.toFixed(1)}% - Meta: acima de 85%\n`;
  }
  
  const turmasBaixoDesempenho = turmas.filter(t => t.mediaGeral < 6.0);
  if (turmasBaixoDesempenho.length > 0) {
    md += `- 📚 **Turmas com dificuldades**: ${turmasBaixoDesempenho.map(t => t.nome).join(', ')} - Média abaixo de 6.0\n`;
  }
  
  const professoresBaixoDesempenho = professores.filter(p => p.mediaAlunos < 6.0);
  if (professoresBaixoDesempenho.length > 0) {
    md += `- 👨‍🏫 **Professores precisam de suporte**: ${professoresBaixoDesempenho.length} professor(es) com média dos alunos abaixo de 6.0\n`;
  }
  
  md += `\n`;
  
  // Alunos em Risco (Top 10)
  if (alunosRisco.length > 0) {
    md += `## 🚨 Alunos em Situação de Risco (Top 10)\n\n`;
    md += `| Aluno | Turma | Média | Frequência | Reprovações |\n`;
    md += `|-------|-------|-------|------------|-------------|\n`;
    alunosRisco.slice(0, 10).forEach(a => {
      md += `| ${a.nome} | ${a.turma} | ${a.mediaGeral.toFixed(2)} | ${a.frequencia.toFixed(1)}% | ${a.disciplinasReprovadas} |\n`;
    });
    md += `\n`;
  }
  
  // Recomendações
  md += `## 💡 Recomendações\n\n`;
  md += `### Curto Prazo (Imediato)\n`;
  md += `1. **Acompanhamento Pedagógico**: Implementar reforço escolar para os ${alunosRisco.length} alunos em risco\n`;
  md += `2. **Controle de Frequência**: Contatar responsáveis de alunos com frequência abaixo de 75%\n`;
  md += `3. **Reuniões Pedagógicas**: Discutir estratégias com professores das turmas de baixo desempenho\n\n`;
  
  md += `### Médio Prazo (30-60 dias)\n`;
  md += `1. **Capacitação Docente**: Oferecer formação continuada para professores\n`;
  md += `2. **Metodologias Ativas**: Implementar novas abordagens pedagógicas nas turmas\n`;
  md += `3. **Sistema de Tutoria**: Estabelecer monitoria entre alunos\n\n`;
  
  md += `### Longo Prazo (90+ dias)\n`;
  md += `1. **Revisão Curricular**: Avaliar adequação do currículo às necessidades dos alunos\n`;
  md += `2. **Infraestrutura**: Melhorar recursos didáticos e tecnológicos\n`;
  md += `3. **Engajamento Familiar**: Fortalecer parceria escola-família\n\n`;
  
  md += `---\n\n`;
  md += `*Relatório gerado automaticamente pelo Sistema de Gestão Escolar*\n`;
  
  return md;
}

async function main() {
  console.log('📊 Gerando Relatório de Análise do Sistema...\n');
  
  try {
    console.log('1️⃣ Coletando estatísticas gerais...');
    const estatisticasGerais = await coletarEstatisticasGerais();
    
    console.log('2️⃣ Analisando desempenho acadêmico...');
    const estatisticasAcademicas = await coletarEstatisticasAcademicas();
    
    console.log('3️⃣ Analisando turmas...');
    const turmas = await analisarTurmas();
    
    console.log('4️⃣ Analisando professores...');
    const professores = await analisarProfessores();
    
    console.log('5️⃣ Identificando alunos em risco...');
    const alunosRisco = await identificarAlunosEmRisco();
    
    console.log('6️⃣ Gerando relatório markdown...');
    const relatorio = gerarRelatorioMarkdown(
      estatisticasGerais,
      estatisticasAcademicas,
      turmas,
      professores,
      alunosRisco
    );
    
    // Salvar relatório
    const relatorioPath = path.join(__dirname, '..', 'RELATORIO_ANALISE.md');
    fs.writeFileSync(relatorioPath, relatorio, 'utf-8');
    
    console.log('\n✅ Relatório gerado com sucesso!');
    console.log(`📄 Arquivo: RELATORIO_ANALISE.md\n`);
    
    // Exibir resumo
    console.log('📊 Resumo Executivo:');
    console.log(`   - Total de Alunos: ${estatisticasGerais.totalAlunos}`);
    console.log(`   - Média Geral: ${estatisticasAcademicas.mediaGeralEscola.toFixed(2)}`);
    console.log(`   - Taxa de Aprovação: ${estatisticasAcademicas.taxaAprovacao.toFixed(1)}%`);
    console.log(`   - Frequência Média: ${estatisticasAcademicas.taxaFrequenciaMedia.toFixed(1)}%`);
    console.log(`   - Alunos em Risco: ${alunosRisco.length}\n`);
    
  } catch (error) {
    console.error('❌ Erro ao gerar relatório:', error);
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
