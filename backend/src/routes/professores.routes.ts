import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

export const professoresRouter = Router();

const professorSchema = z.object({
  nome: z.string().min(3),
  cpf: z.string().min(11).max(14),
  email: z.string().email(),
  telefone: z.string(),
  especialidade: z.string().optional(),
  area: z.enum(['Anos Iniciais', 'Anos Finais', 'Ambos']),
  componentes: z.string().optional(),
  turmasVinculadas: z.string().optional(),
});

// GET todos os professores
professoresRouter.get('/', async (req, res) => {
  try {
    const professores = await prisma.professor.findMany({
      include: { disciplinas: true, turmas: true }
    });
    res.json(professores);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar professores' });
  }
});

// GET professor por ID
professoresRouter.get('/:id', async (req, res) => {
  try {
    const professor = await prisma.professor.findUnique({
      where: { id: req.params.id },
      include: { disciplinas: true, turmas: true }
    });
    
    if (!professor) {
      return res.status(404).json({ error: 'Professor não encontrado' });
    }
    
    res.json(professor);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar professor' });
  }
});

// POST criar professor
professoresRouter.post('/', async (req, res) => {
  try {
    const data = professorSchema.parse(req.body);
    
    const professor = await prisma.professor.create({
      data
    });

    // Se componentes e turmas foram fornecidos, criar DisciplinaTurma
    if (data.componentes && data.turmasVinculadas) {
      const componentes = JSON.parse(data.componentes) as string[];
      const turmasIds = JSON.parse(data.turmasVinculadas) as string[];

      // Buscar IDs das disciplinas pelos nomes
      const disciplinas = await prisma.disciplina.findMany({
        where: { nome: { in: componentes } }
      });

      // Criar DisciplinaTurma para cada combinação disciplina x turma
      const disciplinaTurmasData = [];
      for (const disciplina of disciplinas) {
        for (const turmaId of turmasIds) {
          disciplinaTurmasData.push({
            disciplinaId: disciplina.id,
            turmaId: turmaId,
            professorId: professor.id
          });
        }
      }

      if (disciplinaTurmasData.length > 0) {
        await prisma.disciplinaTurma.createMany({
          data: disciplinaTurmasData,
          skipDuplicates: true
        });
      }
    }
    
    res.status(201).json(professor);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Erro ao criar professor:', error);
    res.status(500).json({ error: 'Erro ao criar professor' });
  }
});

// PUT atualizar professor
professoresRouter.put('/:id', async (req, res) => {
  try {
    const data = professorSchema.partial().parse(req.body);
    const professorId = req.params.id;
    
    const professor = await prisma.professor.update({
      where: { id: professorId },
      data
    });

    // Se componentes e turmas foram fornecidos, recriar DisciplinaTurma
    if (data.componentes && data.turmasVinculadas) {
      // Remover DisciplinaTurma antigas deste professor
      await prisma.disciplinaTurma.deleteMany({
        where: { professorId }
      });

      const componentes = JSON.parse(data.componentes) as string[];
      const turmasIds = JSON.parse(data.turmasVinculadas) as string[];

      // Buscar IDs das disciplinas pelos nomes
      const disciplinas = await prisma.disciplina.findMany({
        where: { nome: { in: componentes } }
      });

      // Criar novas DisciplinaTurma
      const disciplinaTurmasData = [];
      for (const disciplina of disciplinas) {
        for (const turmaId of turmasIds) {
          disciplinaTurmasData.push({
            disciplinaId: disciplina.id,
            turmaId: turmaId,
            professorId: professorId
          });
        }
      }

      if (disciplinaTurmasData.length > 0) {
        await prisma.disciplinaTurma.createMany({
          data: disciplinaTurmasData,
          skipDuplicates: true
        });
      }
    }
    
    res.json(professor);
  } catch (error) {
    console.error('Erro ao atualizar professor:', error);
    res.status(500).json({ error: 'Erro ao atualizar professor' });
  }
});

// DELETE professor
professoresRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.professor.delete({
      where: { id: req.params.id }
    });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar professor' });
  }
});
