/**
 * Helper para extrair dados de respostas paginadas ou simples
 */
export function extractData<T>(response: any): T[] {
  // Se a resposta tem o formato paginado { data: [...], pagination: {...} }
  if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
    return response.data;
  }
  
  // Se a resposta é um array direto
  if (Array.isArray(response)) {
    return response;
  }
  
  // Fallback: retorna array vazio
  console.warn('Formato de resposta não reconhecido:', response);
  return [];
}

/**
 * Helper para extrair total de registros paginados
 */
export function extractTotal(response: any): number {
  if (response && typeof response === 'object' && 'pagination' in response) {
    return response.pagination.total || 0;
  }
  
  if (Array.isArray(response)) {
    return response.length;
  }
  
  return 0;
}
