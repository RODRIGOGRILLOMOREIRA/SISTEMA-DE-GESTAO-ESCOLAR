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
