/// <reference types="node" />

import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// ============================================
// GERADORES DE DADOS ÚNICOS PARA ALUNOS
// ============================================

const nomesUnicos = new Set<string>();
const cpfsUnicos = new Set<string>();
const emailsUnicos = new Set<string>();

const primeiroNomes = [
  'Miguel', 'Arthur', 'Bernardo', 'Heitor', 'Davi', 'Lorenzo', 'Théo', 'Pedro',
  'Gabriel', 'Enzo', 'Matheus', 'Lucas', 'Benjamin', 'Nicolas', 'Guilherme',
  'Rafael', 'Joaquim', 'Samuel', 'Enzo Gabriel', 'João Miguel', 'Henrique',
  'Alice', 'Sophia', 'Helena', 'Valentina', 'Laura', 'Isabella', 'Manuela',
  'Júlia', 'Heloísa', 'Luiza', 'Maria Luiza', 'Lorena', 'Lívia', 'Giovanna',
  'Maria Eduarda', 'Beatriz', 'Maria Clara', 'Cecília', 'Eloá', 'Lara',
  'Maria Júlia', 'Isadora', 'Mariana', 'Emanuelly', 'Ana Júlia', 'Ana Luiza',
  'Ana Clara', 'Melissa', 'Yasmin', 'Maria Alice', 'Isabelly', 'Lavínia',
  'Esther', 'Sarah', 'Elisa', 'Antonella', 'Rafaela', 'Maria Cecília',
  'Liz', 'Marina', 'Nicole', 'Maya', 'Ayla', 'Bruna', 'Larissa', 'Letícia'
];

const sobrenomes = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Pereira', 'Costa', 'Ferreira',
  'Rodrigues', 'Almeida', 'Nascimento', 'Araujo', 'Ribeiro', 'Carvalho', 'Gomes',
  'Martins', 'Rocha', 'Alves', 'Monteiro', 'Mendes', 'Barbosa', 'Pinto', 'Castro',
  'Teixeira', 'Cardoso', 'Moreira', 'Cavalcanti', 'Nunes', 'Freitas', 'Dias',
  'Lopes', 'Fernandes', 'Correia', 'Machado', 'Azevedo', 'Campos', 'Cunha',
  'Duarte', 'Farias', 'Melo', 'Barros', 'Vieira', 'Ramos', 'Soares', 'Moura'
];

function gerarNomeUnico(): string {
  let tentativas = 0;
  while (tentativas < 1000) {
    const primeiro = primeiroNomes[Math.floor(Math.random() * primeiroNomes.length)];
    const sobrenome1 = sobrenomes[Math.floor(Math.random() * sobrenomes.length)];
    const sobrenome2 = sobrenomes[Math.floor(Math.random() * sobrenomes.length)];
    const nomeCompleto = `${primeiro} ${sobrenome1} ${sobrenome2}`;
    
    if (!nomesUnicos.has(nomeCompleto)) {
      nomesUnicos.add(nomeCompleto);
      return nomeCompleto;
    }
    tentativas++;
  }
  throw new Error('Não foi possível gerar um nome único para aluno');
}

function gerarCPFUnico(): string {
  let tentativas = 0;
  while (tentativas < 1000) {
    const cpf = Math.floor(10000000000 + Math.random() * 90000000000).toString();
    const cpfFormatado = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    
    if (!cpfsUnicos.has(cpfFormatado)) {
      cpfsUnicos.add(cpfFormatado);
      return cpfFormatado;
    }
    tentativas++;
  }
  throw new Error('Não foi possível gerar um CPF único');
}

function gerarEmailUnico(nome: string): string {
  let tentativas = 0;
  const nomeNormalizado = nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '.');
  
  while (tentativas < 100) {
    const sufixo = tentativas > 0 ? tentativas : '';
    const email = `${nomeNormalizado}${sufixo}@aluno.escola.edu.br`;
    
    if (!emailsUnicos.has(email)) {
      emailsUnicos.add(email);
      return email;
    }
    tentativas++;
  }
  throw new Error('Não foi possível gerar um email único');
}

function gerarTelefone(): string {
  const ddd = Math.floor(11 + Math.random() * 88);
  const numero = Math.floor(900000000 + Math.random() * 99999999);
  return `(${ddd}) ${numero.toString().substring(0, 5)}-${numero.toString().substring(5)}`;
}

function gerarDataNascimento(ano: number): Date {
  // Alunos do 1º ao 5º ano: 6 a 10 anos (2019 a 2015)
  // Alunos do 6º ao 9º ano: 11 a 14 anos (2014 a 2011)
  let anoNascimento: number;
  
  if (ano >= 1 && ano <= 5) {
    // Anos Iniciais: 6 a 10 anos
    anoNascimento = 2025 - (5 + ano);
  } else {
    // Anos Finais: 11 a 14 anos
    anoNascimento = 2025 - (5 + ano);
  }
  
  const mes = Math.floor(Math.random() * 12);
  const dia = Math.floor(Math.random() * 28) + 1;
  
  return new Date(anoNascimento, mes, dia);
}

function gerarNumeroMatricula(ano: number, sequencia: number): string {
  const anoAtual = new Date().getFullYear();
  return `${anoAtual}${ano.toString().padStart(2, '0')}${sequencia.toString().padStart(4, '0')}`;
}

async function criarAlunosParaTurma(turma: any, quantidade: number, sequenciaInicial: number): Promise<number> {
  console.log(`\n  📝 Criando ${quantidade} alunos para ${turma.nome}...`);
  
  const alunos = [];
  const batchSize = 10; // Processar em lotes de 10
  let sequenciaAtual = sequenciaInicial;
  
  for (let i = 0; i < quantidade; i++) {
    const nome = gerarNomeUnico();
    const nomeResponsavel = gerarNomeUnico();
    const sequencia = sequenciaAtual + i;
    
    const aluno = {
      id: uuidv4(),
      nome,
      cpf: gerarCPFUnico(),
      dataNascimento: gerarDataNascimento(turma.ano),
      email: gerarEmailUnico(nome),
      telefone: gerarTelefone(),
      endereco: `Rua Exemplo, ${Math.floor(Math.random() * 1000) + 1}`,
      responsavel: nomeResponsavel,
      telefoneResp: gerarTelefone(),
      turmaId: turma.id,
      numeroMatricula: gerarNumeroMatricula(turma.ano, sequencia),
      statusMatricula: 'ATIVO',
      updatedAt: new Date()
    };
    
    alunos.push(aluno);
    
    // Inserir em lotes
    if (alunos.length >= batchSize || i === quantidade - 1) {
      await prisma.alunos.createMany({
        data: alunos
      });
      
      console.log(`    ✅ ${alunos.length} alunos criados (${i + 1}/${quantidade})`);
      alunos.length = 0; // Limpar array
      
      // Pequena pausa para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return sequenciaAtual + quantidade;
}

async function criarMatriculas() {
  console.log('\n📋 Criando matrículas para todos os alunos...');
  
  const alunos = await prisma.alunos.findMany({
    select: { id: true, turmaId: true }
  });
  
  const batchSize = 50;
  let processados = 0;
  
  for (let i = 0; i < alunos.length; i += batchSize) {
    const lote = alunos.slice(i, i + batchSize);
    const matriculas = lote.map(aluno => ({
      id: uuidv4(),
      alunoId: aluno.id,
      turmaId: aluno.turmaId!,
      dataMatricula: new Date(),
      status: 'ATIVA',
      updatedAt: new Date()
    }));
    
    await prisma.matriculas.createMany({
      data: matriculas
    });
    
    processados += lote.length;
    console.log(`  ✅ ${processados}/${alunos.length} matrículas criadas`);
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function vincularDisciplinasATurmas() {
  console.log('\n🔗 Vinculando disciplinas às turmas...');
  
  const turmas = await prisma.turmas.findMany();
  const disciplinas = await prisma.disciplinas.findMany();
  const professores = await prisma.professores.findMany();
  
  let totalVinculos = 0;
  
  for (const turma of turmas) {
    for (const disciplina of disciplinas) {
      // Buscar professor da especialidade
      const professor = professores.find(p => p.especialidade === disciplina.nome);
      
      await prisma.disciplinas_turmas.create({
        data: {
          id: uuidv4(),
          disciplinaId: disciplina.id,
          turmaId: turma.id,
          professorId: professor?.id,
          updatedAt: new Date()
        }
      });
      
      totalVinculos++;
    }
    
    console.log(`  ✅ ${turma.nome}: ${disciplinas.length} disciplinas vinculadas`);
  }
  
  console.log(`  📊 Total: ${totalVinculos} vínculos criados`);
}

async function main() {
  console.log('🚀 Criando 200 alunos distribuídos em 9 turmas...\n');
  
  try {
    // Buscar turmas
    const turmas = await prisma.turmas.findMany({
      orderBy: { ano: 'asc' }
    });
    
    if (turmas.length === 0) {
      console.error('❌ Nenhuma turma encontrada! Execute primeiro: npm run seed:base');
      process.exit(1);
    }
    
    console.log(`📚 Turmas encontradas: ${turmas.length}`);
    
    // Distribuir 200 alunos entre 9 turmas (~22-23 por turma)
    const alunosPorTurma = [22, 22, 22, 22, 22, 23, 23, 23, 21]; // Total: 200
    let sequenciaGlobal = 1;
    
    for (let i = 0; i < turmas.length; i++) {
      sequenciaGlobal = await criarAlunosParaTurma(turmas[i], alunosPorTurma[i], sequenciaGlobal);
    }
    
    // Criar matrículas
    await criarMatriculas();
    
    // Vincular disciplinas às turmas
    await vincularDisciplinasATurmas();
    
    // Contar totais
    const totalAlunos = await prisma.alunos.count();
    const totalMatriculas = await prisma.matriculas.count();
    const totalVinculos = await prisma.disciplinas_turmas.count();
    
    console.log('\n✅ Alunos criados com sucesso!');
    console.log(`\n📊 Resumo Final:`);
    console.log(`   - ${totalAlunos} Alunos criados`);
    console.log(`   - ${totalMatriculas} Matrículas ativas`);
    console.log(`   - ${totalVinculos} Disciplinas vinculadas às turmas`);
    
    console.log('\n⏳ Próxima etapa: Execute "npm run seed:notas" para gerar notas e frequências');
    console.log('   (dividido para não sobrecarregar a memória)\n');
    
  } catch (error) {
    console.error('❌ Erro ao criar alunos:', error);
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
