/**
 * =====================================
 * BUSCA AUTOCOMPLETE COM REDIS
 * =====================================
 * 
 * Sistema de busca instant

ânea com cache
 * Sugestões em tempo real ao digitar
 */

import redis from '../lib/redis';
import { log } from '../lib/logger';
import { prisma } from '../lib/prisma';

/**
 * Indexar aluno para busca
 */
export async function indexAluno(aluno: any): Promise<void> {
  try {
    const searchData = {
      id: aluno.id,
      nome: aluno.nome,
      email: aluno.email,
      numeroMatricula: aluno.numeroMatricula,
      turma: aluno.turma?.nome || '',
    };
    
    // Salvar dados completos
    await redis.setex(
      `search:aluno:${aluno.id}`,
      3600, // 1 hora
      JSON.stringify(searchData)
    );
    
    // Indexar termos de busca (nome quebrado em palavras)
    const terms = aluno.nome.toLowerCase().split(' ');
    for (const term of terms) {
      if (term.length >= 2) {
        // Adicionar ao conjunto de sugestões
        await redis.zadd(`search:suggest:alunos`, 0, term);
        
        // Mapear termo para ID
        await redis.sadd(`search:term:${term}:alunos`, aluno.id);
      }
    }
    
    // Indexar matrícula
    if (aluno.numeroMatricula) {
      await redis.sadd(`search:matricula:${aluno.numeroMatricula}`, aluno.id);
    }
  } catch (error) {
    log.error({ err: error, alunoId: aluno.id }, 'Erro ao indexar aluno');
  }
}

/**
 * Indexar professor para busca
 */
export async function indexProfessor(professor: any): Promise<void> {
  try {
    const searchData = {
      id: professor.id,
      nome: professor.nome,
      email: professor.email,
      especialidade: professor.especialidade,
    };
    
    await redis.setex(
      `search:professor:${professor.id}`,
      3600,
      JSON.stringify(searchData)
    );
    
    const terms = professor.nome.toLowerCase().split(' ');
    for (const term of terms) {
      if (term.length >= 2) {
        await redis.zadd(`search:suggest:professores`, 0, term);
        await redis.sadd(`search:term:${term}:professores`, professor.id);
      }
    }
  } catch (error) {
    log.error({ err: error, professorId: professor.id }, 'Erro ao indexar professor');
  }
}

/**
 * Indexar turma para busca
 */
export async function indexTurma(turma: any): Promise<void> {
  try {
    const searchData = {
      id: turma.id,
      nome: turma.nome,
      ano: turma.ano,
      periodo: turma.periodo,
      anoLetivo: turma.anoLetivo,
    };
    
    await redis.setex(
      `search:turma:${turma.id}`,
      3600,
      JSON.stringify(searchData)
    );
    
    const terms = turma.nome.toLowerCase().split(' ');
    for (const term of terms) {
      if (term.length >= 2) {
        await redis.zadd(`search:suggest:turmas`, 0, term);
        await redis.sadd(`search:term:${term}:turmas`, turma.id);
      }
    }
  } catch (error) {
    log.error({ err: error, turmaId: turma.id }, 'Erro ao indexar turma');
  }
}

/**
 * Buscar com autocomplete
 */
export async function autocomplete(
  query: string,
  type: 'alunos' | 'professores' | 'turmas' | 'all' = 'all',
  limit = 10
): Promise<any> {
  try {
    if (!query || query.length < 2) {
      return { suggestions: [], results: [] };
    }
    
    const lowerQuery = query.toLowerCase();
    
    // Buscar sugestões de termos
    const suggestions = await getSuggestions(lowerQuery, type, limit);
    
    // Buscar resultados exatos
    const results = await searchExact(lowerQuery, type, limit);
    
    return {
      query,
      suggestions,
      results,
    };
  } catch (error) {
    log.error({ err: error, query, type }, 'Erro no autocomplete');
    return { suggestions: [], results: [] };
  }
}

/**
 * Obter sugestões de termos
 */
async function getSuggestions(
  query: string,
  type: string,
  limit: number
): Promise<string[]> {
  try {
    const suggestions: Set<string> = new Set();
    
    const types = type === 'all' ? ['alunos', 'professores', 'turmas'] : [type];
    
    for (const t of types) {
      // Buscar termos que começam com a query
      const terms = await redis.zrangebylex(
        `search:suggest:${t}`,
        `[${query}`,
        `[${query}\xff`,
        'LIMIT',
        0,
        limit
      );
      
      terms.forEach((term: string) => suggestions.add(term));
    }
    
    return Array.from(suggestions).slice(0, limit);
  } catch (error) {
    log.error({ err: error }, 'Erro ao obter sugestões');
    return [];
  }
}

/**
 * Buscar resultados exatos
 */
async function searchExact(
  query: string,
  type: string,
  limit: number
): Promise<any[]> {
  try {
    const results: any[] = [];
    const types = type === 'all' ? ['alunos', 'professores', 'turmas'] : [type];
    
    for (const t of types) {
      // Buscar IDs pelos termos
      const terms = query.split(' ').filter(term => term.length >= 2);
      const ids: Set<string> = new Set();
      
      for (const term of terms) {
        const termIds = await redis.smembers(`search:term:${term}:${t}`);
        termIds.forEach((id: string) => ids.add(id));
      }
      
      // Buscar dados completos
      for (const id of Array.from(ids).slice(0, limit)) {
        const data = await redis.get(`search:${t.slice(0, -1)}:${id}`);
        if (data) {
          results.push({
            type: t.slice(0, -1),
            ...JSON.parse(data),
          });
        }
      }
    }
    
    return results.slice(0, limit);
  } catch (error) {
    log.error({ err: error }, 'Erro na busca exata');
    return [];
  }
}

/**
 * Reindexar todos os dados
 */
export async function reindexAll(): Promise<void> {
  try {
    log.info({ component: 'search' }, '🔄 Iniciando reindexação...');
    
    // Limpar índices antigos
    const keys = await redis.keys('search:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    
    // Indexar alunos
    const alunos = await prisma.alunos.findMany({
      include: { turmas: true },
    });
    for (const aluno of alunos) {
      await indexAluno(aluno);
    }
    
    // Indexar professores
    const professores = await prisma.professores.findMany();
    for (const professor of professores) {
      await indexProfessor(professor);
    }
    
    // Indexar turmas
    const turmas = await prisma.turmas.findMany();
    for (const turma of turmas) {
      await indexTurma(turma);
    }
    
    log.info({ 
      alunos: alunos.length,
      professores: professores.length,
      turmas: turmas.length,
    }, '✅ Reindexação concluída');
  } catch (error) {
    log.error({ err: error }, 'Erro ao reindexar dados');
  }
}

/**
 * Busca avançada (fallback para banco de dados)
 */
export async function advancedSearch(
  query: string,
  filters: any = {}
): Promise<any> {
  try {
    const results: any = {
      alunos: [],
      professores: [],
      turmas: [],
    };
    
    // Buscar no banco se Redis falhar ou para resultados mais completos
    if (filters.includeAlunos !== false) {
      results.alunos = await prisma.alunos.findMany({
        where: {
          OR: [
            { nome: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { numeroMatricula: { contains: query } },
          ],
        },
        include: { turmas: true },
        take: 10,
      });
    }
    
    if (filters.includeProfessores !== false) {
      results.professores = await prisma.professores.findMany({
        where: {
          OR: [
            { nome: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { especialidade: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
      });
    }
    
    if (filters.includeTurmas !== false) {
      results.turmas = await prisma.turmas.findMany({
        where: {
          nome: { contains: query, mode: 'insensitive' },
        },
        take: 10,
      });
    }
    
    return results;
  } catch (error) {
    log.error({ err: error, query }, 'Erro na busca avançada');
    return { alunos: [], professores: [], turmas: [] };
  }
}

export default {
  indexAluno,
  indexProfessor,
  indexTurma,
  autocomplete,
  reindexAll,
  advancedSearch,
};
