import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';
import encryption from '../services/encryption.service';

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

// Função auxiliar para descriptografar com segurança
function safeDecrypt(data: string | null): string | null {
  if (!data) return null;
  try {
    // Verificar se está no formato criptografado (salt:iv:tag:encrypted)
    if (data.includes(':') && data.split(':').length === 4) {
      return encryption.decrypt(data);
    }
    // Se não estiver criptografado, retornar como está
    return data;
  } catch (error) {
    // Se falhar ao descriptografar, retornar dado original
    return data;
  }
}

// GET todos os professores
professoresRouter.get('/', async (req, res) => {
  try {
    const professores = await prisma.professores.findMany({
      include: { disciplinas: true, turmas: true }
    });
    
    // Descriptografar dados sensíveis com segurança
    const professoresDecrypted = professores.map(prof => ({
      ...prof,
      cpf: safeDecrypt(prof.cpf) || prof.cpf,
      telefone: safeDecrypt(prof.telefone) || prof.telefone,
    }));
    
    res.json(professoresDecrypted);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar professores' });
  }
});

// GET professor por ID
professoresRouter.get('/:id', async (req, res) => {
  try {
    const professor = await prisma.professores.findUnique({
      where: { id: req.params.id },
      include: { disciplinas: true, turmas: true }
    });
    
    if (!professor) {
      return res.status(404).json({ error: 'Professor não encontrado' });
    }
    
    // Descriptografar dados sensíveis com segurança
    const professorDecrypted = {
      ...professor,
      cpf: safeDecrypt(professor.cpf) || professor.cpf,
      telefone: safeDecrypt(professor.telefone) || professor.telefone,
    };
    
    res.json(professorDecrypted);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar professor' });
  }
});

// POST criar professor
professoresRouter.post('/', async (req, res) => {
  try {
    const data = professorSchema.parse(req.body);
    
    // Criptografar dados sensíveis
    const encryptedData = {
      cpf: encryption.encrypt(data.cpf),
      telefone: encryption.encrypt(data.telefone),
    };
    
    const professor = await prisma.professores.create({
      data: {
        id: crypto.randomUUID(),
        nome: data.nome,
        cpf: encryptedData.cpf,
        email: data.email,
        telefone: encryptedData.telefone,
        area: data.area,
        updatedAt: new Date(),
        ...(data.especialidade && { especialidade: data.especialidade }),
        ...(data.componentes && { componentes: data.componentes }),
        ...(data.turmasVinculadas && { turmasVinculadas: data.turmasVinculadas }),
      }
    });

    // Se componentes e turmas foram fornecidos, criar DisciplinaTurma
    if (data.componentes && data.turmasVinculadas) {
      const componentes = JSON.parse(data.componentes) as string[];
      const turmasIds = JSON.parse(data.turmasVinculadas) as string[];

      // Buscar IDs das disciplinas pelos nomes
      const disciplinas = await prisma.disciplinas.findMany({
        where: { nome: { in: componentes } }
      });

      // Criar DisciplinaTurma para cada combinação disciplina x turma
      const disciplinaTurmasData = [];
      for (const disciplina of disciplinas) {
        for (const turmaId of turmasIds) {
          disciplinaTurmasData.push({
            id: crypto.randomUUID(),
            disciplinaId: disciplina.id,
            turmaId: turmaId,
            professorId: professor.id,
            updatedAt: new Date(),
          });
        }
      }

      if (disciplinaTurmasData.length > 0) {
        await prisma.disciplinas_turmas.createMany({
          data: disciplinaTurmasData,
          skipDuplicates: true
        });
      }
      
      // Atualizar professorId nas turmas vinculadas
      if (turmasIds.length > 0) {
        await prisma.turmas.updateMany({
          where: { id: { in: turmasIds } },
          data: { professorId: professor.id }
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
    
    // Criptografar dados sensíveis se fornecidos
    const encryptedData: any = { ...data };
    if (data.cpf) {
      encryptedData.cpf = encryption.encrypt(data.cpf);
    }
    if (data.telefone) {
      encryptedData.telefone = encryption.encrypt(data.telefone);
    }
    
    const professor = await prisma.professores.update({
      where: { id: professorId },
      data: encryptedData
    });

    // Se componentes e turmas foram fornecidos, recriar disciplinas_turmas
    if (data.componentes && data.turmasVinculadas) {
      const componentes = JSON.parse(data.componentes) as string[];
      const turmasIds = JSON.parse(data.turmasVinculadas) as string[];

      // Remover professorId das turmas antigas deste professor
      await prisma.turmas.updateMany({
        where: { professorId },
        data: { professorId: null }
      });
      
      // Remover disciplinas_turmas antigas deste professor
      await prisma.disciplinas_turmas.deleteMany({
        where: { professorId }
      });

      // Buscar IDs das disciplinas pelos nomes
      const disciplinas = await prisma.disciplinas.findMany({
        where: { nome: { in: componentes } }
      });

      // Criar novas disciplinas_turmas
      const disciplinaTurmasData = [];
      for (const disciplina of disciplinas) {
        for (const turmaId of turmasIds) {
          disciplinaTurmasData.push({
            id: crypto.randomUUID(),
            disciplinaId: disciplina.id,
            turmaId: turmaId,
            professorId,
            updatedAt: new Date(),
          });
        }
      }

      if (disciplinaTurmasData.length > 0) {
        await prisma.disciplinas_turmas.createMany({
          data: disciplinaTurmasData,
          skipDuplicates: true
        });
      }
      
      // Atualizar professorId nas novas turmas vinculadas
      if (turmasIds.length > 0) {
        await prisma.turmas.updateMany({
          where: { id: { in: turmasIds } },
          data: { professorId: professorId }
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
    await prisma.professores.delete({
      where: { id: req.params.id }
    });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar professor' });
  }
});


