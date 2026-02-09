/**
 * Middleware de Paginação
 * Padroniza paginação em todas as rotas
 */

import { Request, Response, NextFunction } from 'express';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  sort: string;
  order: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Middleware que extrai parâmetros de paginação da query string
 * e adiciona no objeto da requisição
 */
export const paginationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Extrair parâmetros
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
  const skip = (page - 1) * limit;
  const sort = (req.query.sort as string) || 'createdAt';
  const order = (req.query.order as 'asc' | 'desc') || 'desc';

  // Adicionar ao request
  (req as any).pagination = {
    page,
    limit,
    skip,
    sort,
    order,
  } as PaginationParams;

  next();
};

/**
 * Helper para formatar resposta paginada
 * @param data Dados da página atual
 * @param total Total de registros
 * @param page Página atual
 * @param limit Itens por página
 * @returns Resposta paginada formatada
 */
export const paginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext,
      hasPrev,
    },
  };
};

/**
 * Helper para gerar chave de cache baseada em paginação
 * @param baseKey Chave base (ex: 'alunos')
 * @param params Parâmetros de paginação
 * @param filters Filtros adicionais (opcional)
 * @returns Chave de cache única
 */
export const getCacheKey = (
  baseKey: string,
  params: PaginationParams,
  filters?: Record<string, any>
): string => {
  const filterStr = filters
    ? Object.entries(filters)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => `${key}:${value}`)
        .join(':')
    : '';

  return `${baseKey}:page:${params.page}:limit:${params.limit}:sort:${params.sort}:order:${params.order}${filterStr ? ':' + filterStr : ''}`;
};

/**
 * Middleware para adicionar headers de paginação na resposta
 */
export const paginationHeadersMiddleware = (
  data: any,
  total: number,
  page: number,
  limit: number,
  res: Response
) => {
  const totalPages = Math.ceil(total / limit);

  res.setHeader('X-Total-Count', total.toString());
  res.setHeader('X-Page', page.toString());
  res.setHeader('X-Per-Page', limit.toString());
  res.setHeader('X-Total-Pages', totalPages.toString());
  res.setHeader('X-Has-Next', (page < totalPages).toString());
  res.setHeader('X-Has-Prev', (page > 1).toString());

  return res;
};
