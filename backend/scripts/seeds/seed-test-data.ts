/// <reference types="node" />

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// ============================================
// GERADORES DE DADOS ÚNICOS
// ============================================

const nomesUnicos = new Set<string>();
const cpfsUnicos = new Set<string>();
const emailsUnicos = new Set<string>();
const telefonesUnicos = new Set<string>();

const primeiroNomes = [
  'João', 'Maria', 'José', 'Ana', 'Pedro', 'Juliana', 'Carlos', 'Mariana',
  'Lucas', 'Fernanda', 'Rafael', 'Beatriz', 'Gabriel', 'Camila', 'Bruno',
  'Letícia', 'Ricardo', 'Larissa', 'Felipe', 'Amanda', 'Thiago', 'Patrícia',
  'André', 'Isabela', 'Diego', 'Carla', 'Rodrigo', 'Jéssica', 'Leandro', 'Aline',
  'Marcos', 'Renata', 'Vinicius', 'Daniela', 'Guilherme', 'Cristina', 'Eduardo',
  'Sandra', 'Fernando', 'Silvia', 'Gustavo', 'Paula', 'Henrique', 'Tatiana',
  'Maurício', 'Vanessa', 'Roberto', 'Luciana', 'Alexandre', 'Adriana'
];

const sobrenomes = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Pereira', 'Costa', 'Ferreira',
  'Rodrigues', 'Almeida', 'Nascimento', 'Araujo', 'Ribeiro', 'Carvalho', 'Gomes',
  'Martins', 'Rocha', 'Alves', 'Monteiro', 'Mendes', 'Barbosa', 'Pinto', 'Castro',
  'Teixeira', 'Cardoso', 'Moreira', 'Cavalcanti', 'Nunes', 'Freitas', 'Dias',
  'Lopes', 'Fernandes', 'Correia', 'Machado', 'Azevedo', 'Campos', 'Cunha',
  'Duarte', 'Farias', 'Melo', 'Barros', 'Vieira', 'Ramos', 'Soares', 'Moura',
  'Cruz', 'Miranda', 'Andrade', 'Pires', 'Nogueira'
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
  throw new Error('Não foi possível gerar um nome único');
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

function gerarEmailUnico(nome: string, tipo: string): string {
  let tentativas = 0;
  const nomeNormalizado = nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '.');
  
  while (tentativas < 100) {
    const sufixo = tentativas > 0 ? tentativas : '';
    const email = `${nomeNormalizado}${sufixo}@${tipo}.escola.edu.br`;
    
    if (!emailsUnicos.has(email)) {
      emailsUnicos.add(email);
      return email;
    }
    tentativas++;
  }
  throw new Error('Não foi possível gerar um email único');
}

function gerarTelefoneUnico(): string {
  let tentativas = 0;
  while (tentativas < 1000) {
    const ddd = Math.floor(11 + Math.random() * 88);
    const numero = Math.floor(900000000 + Math.random() * 99999999);
    const telefone = `(${ddd}) ${numero.toString().substring(0, 5)}-${numero.toString().substring(5)}`;
    
    if (!telefonesUnicos.has(telefone)) {
      telefonesUnicos.add(telefone);
      return telefone;
    }
    tentativas++;
  }
  throw new Error('Não foi possível gerar um telefone único');
}

// ============================================
// FUNÇÕES DE CRIAÇÃO DE DADOS
// ============================================

async function criarEquipeDiretiva() {
  console.log('📊 Criando Equipe Diretiva (5 membros)...');
  
  const cargos = ['Diretor Geral', 'Vice-Diretor', 'Coordenador Pedagógico', 'Orientador Educacional', 'Supervisor Escolar'];
  const diretores = [];
  
  for (let i = 0; i < 5; i++) {
    const nome = gerarNomeUnico();
    const diretor = await prisma.equipe_diretiva.create({
      data: {
        id: uuidv4(),
        nome,
        cpf: gerarCPFUnico(),
        email: gerarEmailUnico(nome, 'direcao'),
        telefone: gerarTelefoneUnico(),
        cargo: cargos[i],
        cargaHorariaSemanal: 40,
        horarioEntradaPadrao: '08:00',
        horarioSaidaPadrao: '17:00',
        updatedAt: new Date()
      }
    });
    
    // Criar usuário correspondente
    await prisma.usuarios.create({
      data: {
        id: uuidv4(),
        nome: diretor.nome,
        email: diretor.email,
        senha: await bcrypt.hash('Direcao@2025', 10),
        role: 'DIRECAO',
        updatedAt: new Date()
      }
    });
    
    diretores.push(diretor);
    console.log(`  ✅ ${diretor.cargo}: ${diretor.nome}`);
  }
  
  return diretores;
}

async function criarFuncionarios() {
  console.log('\n👥 Criando Funcionários (9 membros)...');
  
  const cargosSetores = [
    { cargo: 'Secretário Escolar', setor: 'Secretaria' },
    { cargo: 'Auxiliar de Secretaria', setor: 'Secretaria' },
    { cargo: 'Coordenador de TI', setor: 'Tecnologia' },
    { cargo: 'Auxiliar de Biblioteca', setor: 'Biblioteca' },
    { cargo: 'Inspetor de Alunos', setor: 'Disciplina' },
    { cargo: 'Auxiliar de Limpeza', setor: 'Serviços Gerais' },
    { cargo: 'Merendeira', setor: 'Alimentação' },
    { cargo: 'Porteiro', setor: 'Segurança' },
    { cargo: 'Auxiliar Administrativo', setor: 'Administração' }
  ];
  
  const funcionarios = [];
  
  for (let i = 0; i < 9; i++) {
    const nome = gerarNomeUnico();
    const funcionario = await prisma.funcionarios.create({
      data: {
        id: uuidv4(),
        nome,
        cpf: gerarCPFUnico(),
        email: gerarEmailUnico(nome, 'func'),
        telefone: gerarTelefoneUnico(),
        cargo: cargosSetores[i].cargo,
        setor: cargosSetores[i].setor,
        cargaHorariaSemanal: 40,
        horarioEntradaPadrao: '08:00',
        horarioSaidaPadrao: '17:00',
        updatedAt: new Date()
      }
    });
    
    // Criar usuário correspondente
    await prisma.usuarios.create({
      data: {
        id: uuidv4(),
        nome: funcionario.nome,
        email: funcionario.email,
        senha: await bcrypt.hash('Func@2025', 10),
        role: 'FUNCIONARIO',
        isActive: true,
        updatedAt: new Date()
      }
    });
    
    funcionarios.push(funcionario);
    console.log(`  ✅ ${funcionario.cargo}: ${funcionario.nome}`);
  }
  
  return funcionarios;
}

async function criarProfessores() {
  console.log('\n👨‍🏫 Criando Professores (21 membros)...');
  
  const especialidades = [
    'Língua Portuguesa', 'Matemática', 'Ciências', 'Geografia', 'História',
    'Inglês', 'Educação Física', 'Artes', 'Ensino Religioso'
  ];
  
  const professores = [];
  let professorIndex = 0;
  
  // Criar professores para cada especialidade
  for (const especialidade of especialidades) {
    // Cada especialidade terá 2 ou 3 professores
    const qtdProfessores = especialidade === 'Língua Portuguesa' || especialidade === 'Matemática' ? 3 : 2;
    
    for (let i = 0; i < qtdProfessores; i++) {
      if (professorIndex >= 21) break;
      
      const nome = gerarNomeUnico();
      const cargaHoraria = i === 0 ? 40 : 20; // Primeiro tem 40h, demais 20h
      
      const professor = await prisma.professores.create({
        data: {
          id: uuidv4(),
          nome,
          cpf: gerarCPFUnico(),
          email: gerarEmailUnico(nome, 'prof'),
          telefone: gerarTelefoneUnico(),
          especialidade,
          area: especialidade,
          componentes: especialidade,
          cargaHorariaSemanal: cargaHoraria,
          horarioEntradaPadrao: '07:30',
          horarioSaidaPadrao: cargaHoraria === 40 ? '17:30' : '12:30',
          updatedAt: new Date()
        }
      });
      
      // Criar usuário correspondente
      await prisma.usuarios.create({
        data: {
          id: uuidv4(),
          nome: professor.nome,
          email: professor.email,
          senha: await bcrypt.hash('Prof@2025', 10),
          role: 'PROFESSOR',
          isActive: true,
          updatedAt: new Date()
        }
      });
      
      professores.push(professor);
      professorIndex++;
      console.log(`  ✅ Professor ${professorIndex}: ${professor.nome} - ${especialidade} (${cargaHoraria}h)`);
    }
  }
  
  return professores;
}

async function criarDisciplinas(professores: any[]) {
  console.log('\n📚 Criando Disciplinas...');
  
  const disciplinasConfig = [
    { nome: 'Língua Portuguesa', cargaHoraria: 5, especialidade: 'Língua Portuguesa' },
    { nome: 'Matemática', cargaHoraria: 5, especialidade: 'Matemática' },
    { nome: 'Ciências', cargaHoraria: 3, especialidade: 'Ciências' },
    { nome: 'Geografia', cargaHoraria: 2, especialidade: 'Geografia' },
    { nome: 'História', cargaHoraria: 2, especialidade: 'História' },
    { nome: 'Inglês', cargaHoraria: 2, especialidade: 'Inglês' },
    { nome: 'Educação Física', cargaHoraria: 2, especialidade: 'Educação Física' },
    { nome: 'Artes', cargaHoraria: 2, especialidade: 'Artes' },
    { nome: 'Ensino Religioso', cargaHoraria: 1, especialidade: 'Ensino Religioso' }
  ];
  
  const disciplinas = [];
  
  for (const config of disciplinasConfig) {
    // Buscar um professor da especialidade
    const professor = professores.find(p => p.especialidade === config.especialidade);
    
    const disciplina = await prisma.disciplinas.create({
      data: {
        id: uuidv4(),
        nome: config.nome,
        cargaHoraria: config.cargaHoraria,
        professorId: professor?.id,
        updatedAt: new Date()
      }
    });
    
    disciplinas.push(disciplina);
    console.log(`  ✅ ${disciplina.nome} - ${config.cargaHoraria}h/semana`);
  }
  
  return disciplinas;
}

async function criarTurmas(professores: any[]) {
  console.log('\n🎓 Criando Turmas (9 turmas)...');
  
  const turmasConfig = [
    { nome: '1º ano', ano: 1, tipo: 'Anos Iniciais', periodo: 'MATUTINO' },
    { nome: '2º ano', ano: 2, tipo: 'Anos Iniciais', periodo: 'MATUTINO' },
    { nome: '3º ano', ano: 3, tipo: 'Anos Iniciais', periodo: 'MATUTINO' },
    { nome: '4º ano', ano: 4, tipo: 'Anos Iniciais', periodo: 'VESPERTINO' },
    { nome: '5º ano', ano: 5, tipo: 'Anos Iniciais', periodo: 'VESPERTINO' },
    { nome: '6º ano', ano: 6, tipo: 'Anos Finais', periodo: 'MATUTINO' },
    { nome: '7º ano', ano: 7, tipo: 'Anos Finais', periodo: 'MATUTINO' },
    { nome: '8º ano', ano: 8, tipo: 'Anos Finais', periodo: 'VESPERTINO' },
    { nome: '9º ano', ano: 9, tipo: 'Anos Finais', periodo: 'VESPERTINO' }
  ];
  
  const turmas = [];
  
  for (let i = 0; i < turmasConfig.length; i++) {
    const config = turmasConfig[i];
    // Atribuir um professor titular (com 40h)
    const professorTitular = professores.find(p => p.cargaHorariaSemanal === 40);
    
    const turma = await prisma.turmas.create({
      data: {
        id: uuidv4(),
        nome: config.nome,
        ano: config.ano,
        periodo: config.periodo,
        professorId: professorTitular?.id,
        anoLetivo: 2025,
        updatedAt: new Date()
      }
    });
    
    turmas.push(turma);
    console.log(`  ✅ ${turma.nome} - ${config.tipo} - ${turma.periodo}`);
  }
  
  return turmas;
}

// ============================================
// FUNÇÃO PRINCIPAL
// ============================================

async function main() {
  console.log('🚀 Iniciando população do banco com dados fictícios...\n');
  console.log('⚠️  ATENÇÃO: Este processo irá criar dados de teste no banco!\n');
  
  try {
    // Limpar contadores
    nomesUnicos.clear();
    cpfsUnicos.clear();
    emailsUnicos.clear();
    telefonesUnicos.clear();
    
    // Criar dados básicos
    const diretores = await criarEquipeDiretiva();
    const funcionarios = await criarFuncionarios();
    const professores = await criarProfessores();
    const disciplinas = await criarDisciplinas(professores);
    const turmas = await criarTurmas(professores);
    
    console.log('\n✅ Dados básicos criados com sucesso!');
    console.log(`\n📊 Resumo:`);
    console.log(`   - ${diretores.length} membros da Equipe Diretiva`);
    console.log(`   - ${funcionarios.length} Funcionários`);
    console.log(`   - ${professores.length} Professores`);
    console.log(`   - ${disciplinas.length} Disciplinas`);
    console.log(`   - ${turmas.length} Turmas`);
    
    console.log('\n⏳ Próxima etapa: Execute "npm run seed:alunos" para criar os 200 alunos');
    console.log('   (dividido em etapa separada para não sobrecarregar a memória)\n');
    
  } catch (error) {
    console.error('❌ Erro ao criar dados:', error);
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
