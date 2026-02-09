import { Router } from 'express';
import { paginationMiddleware } from '../middlewares/pagination';
import { audit } from '../middlewares/audit';
import * as alunosController from '../controllers/alunos.controller';

export const alunosRouter = Router();

// Rotas com paginação, cache e auditoria
alunosRouter.get('/', paginationMiddleware, alunosController.listarAlunos);
alunosRouter.get('/stats/geral', alunosController.estatisticasAlunos);
alunosRouter.get('/turma/:turmaId', alunosController.listarAlunosPorTurma);
alunosRouter.get('/:id', alunosController.buscarAlunoPorId);
alunosRouter.post('/', audit.create('ALUNO'), alunosController.criarAluno);
alunosRouter.put('/:id', audit.update('ALUNO'), alunosController.atualizarAluno);
alunosRouter.delete('/:id', audit.delete('ALUNO'), alunosController.deletarAluno);

// Manter rotas antigas para compatibilidade (deprecadas)
// TODO: Remover após migração completa

// GET aluno por ID (rota antiga - deprecada)
alunosRouter.get('/old/:id', async (req, res) => {
  try {
    const aluno = await prisma.alunos.findUnique({
      where: { id: req.params.id },
      include: { turmas: true, notas: true, frequencias: true }
    });
    
    if (!aluno) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }
    
    res.json(aluno);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar aluno' });
  }
});

// POST criar aluno
alunosRouter.post('/', async (req, res) => {
  try {
    const data = alunoSchema.parse(req.body);
    
    const aluno = await prisma.alunos.create({
      data: {
        id: crypto.randomUUID(),
        nome: data.nome,
        cpf: data.cpf,
        email: data.email,
        responsavel: data.responsavel,
        telefoneResp: data.telefoneResp,
        dataNascimento: new Date(data.dataNascimento),
        updatedAt: new Date(),
        ...(data.telefone && { telefone: data.telefone }),
        ...(data.endereco && { endereco: data.endereco }),
        ...(data.turmaId && { turmaId: data.turmaId }),
      }
    });
    
    res.status(201).json(aluno);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Erro ao criar aluno' });
  }
});

// PUT atualizar aluno
alunosRouter.put('/:id', async (req, res) => {
  try {
    const data = alunoSchema.partial().parse(req.body);
    
    const aluno = await prisma.alunos.update({
      where: { id: req.params.id },
      data: data.dataNascimento ? {
        ...data,
        dataNascimento: new Date(data.dataNascimento),
      } : data
    });
    
    res.json(aluno);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar aluno' });
  }
});

// DELETE aluno
alunosRouter.delete('/:id', async (req, res) => {
  try {
    const alunoId = req.params.id;
    
    // Deletar registros relacionados primeiro
    await prisma.$transaction([
      prisma.notas.deleteMany({ where: { alunoId } }),
      prisma.notas_finais.deleteMany({ where: { alunoId } }),
      prisma.frequencias.deleteMany({ where: { alunoId } }),
      prisma.matriculas.deleteMany({ where: { alunoId } }),
      prisma.alunos.delete({ where: { id: alunoId } })
    ]);
    
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar aluno:', error);
    res.status(500).json({ error: 'Erro ao deletar aluno' });
  }
});


