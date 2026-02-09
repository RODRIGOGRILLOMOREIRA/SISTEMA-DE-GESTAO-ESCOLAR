import axios from 'axios';

// Detectar se está acessando via rede local ou localhost
const getBaseURL = () => {
  const hostname = window.location.hostname;
  
  // Se acessar via IP da rede (ex: 192.168.x.x), usar o mesmo IP para o backend
  if (hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
    return `http://${hostname}:3333/api`;
  }
  
  // Se acessar via localhost, usar localhost
  return import.meta.env.VITE_API_URL || 'http://localhost:3333/api';
};

export const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
});

// Interceptor para adicionar token e debug
api.interceptors.request.use(
  (config) => {
    // Adicionar token se existir
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('🔵 Request:', config.method?.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.config.url, response.data);
    
    // Fase 4: Capturar headers de rate limit
    const rateLimitRemaining = response.headers['x-ratelimit-remaining'];
    const rateLimitReset = response.headers['x-ratelimit-reset'];
    
    if (rateLimitRemaining !== undefined && rateLimitReset !== undefined) {
      const remaining = parseInt(rateLimitRemaining);
      const resetTime = parseInt(rateLimitReset) * 1000; // Converter para ms
      
      // Emitir evento se estiver próximo do limite (menos de 20 requisições restantes)
      if (remaining < 20) {
        window.dispatchEvent(new CustomEvent('rateLimitWarning', {
          detail: { remaining, resetTime }
        }));
      }
    }
    
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.status, error.response?.data);
    
    // Fase 4: Detectar erro 429 (Too Many Requests)
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      const resetTime = retryAfter ? Date.now() + (parseInt(retryAfter) * 1000) : Date.now() + 60000;
      
      window.dispatchEvent(new CustomEvent('rateLimitExceeded', {
        detail: { resetTime }
      }));
    }
    
    // Se erro 401 (Unauthorized) e não for a rota de login, redirecionar para login
    if (error.response?.status === 401 && !error.config.url?.includes('/auth/login')) {
      console.warn('Token inválido ou expirado, redirecionando para login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Types
export interface Aluno {
  id: string;
  nome: string;
  cpf: string;
  dataNascimento: Date;
  email: string;
  telefone?: string;
  endereco?: string;
  responsavel: string;
  telefoneResp: string;
  turmaId?: string;
  turma?: Turma;
  numeroMatricula?: string;
  statusMatricula?: string;
}

export interface Professor {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  especialidade: string;
  area?: string;
  componentes?: string;
  turmasVinculadas?: string;
}

export interface Turma {
  id: string;
  nome: string;
  ano: number;
  anoLetivo: number;
  periodo: string;
  professorId?: string;
  professor?: Professor;
  alunos?: Aluno[];
  disciplinas?: Disciplina[];
}

export interface Disciplina {
  id: string;
  nome: string;
  cargaHoraria: number;
  professorId?: string;
  professor?: Professor;
  turmas?: Turma[];
}

export interface DisciplinaTurma {
  id: string;
  disciplinaId: string;
  turmaId: string;
  professorId?: string;
  disciplina?: Disciplina;
  turma?: Turma;
  professor?: Professor;
}

export interface Nota {
  id: string;
  alunoId: string;
  disciplinaId: string;
  nota: number;
  bimestre: number;
  observacao?: string;
  aluno?: Aluno;
  disciplina?: Disciplina;
}

export interface Frequencia {
  id: string;
  alunoId: string;
  turmaId: string;
  data: Date;
  presente: boolean;
  observacao?: string;
  aluno?: Aluno;
  turma?: Turma;
}

// Paginated Response
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// API Services
export const alunosAPI = {
  getAll: (page = 1, limit = 1000) => api.get<PaginatedResponse<Aluno>>(`/alunos?page=${page}&limit=${limit}`),
  getById: (id: string) => api.get<Aluno>(`/alunos/${id}`),
  getByTurma: (turmaId: string) => api.get<Aluno[]>(`/alunos/turma/${turmaId}`),
  create: (data: Omit<Aluno, 'id'>) => api.post<Aluno>('/alunos', data),
  update: (id: string, data: Partial<Aluno>) => api.put<Aluno>(`/alunos/${id}`, data),
  delete: (id: string) => api.delete(`/alunos/${id}`),
};

export const professoresAPI = {
  getAll: (page = 1, limit = 500) => api.get<PaginatedResponse<Professor>>(`/professores?page=${page}&limit=${limit}`),
  getById: (id: string) => api.get<Professor>(`/professores/${id}`),
  create: (data: Omit<Professor, 'id'>) => api.post<Professor>('/professores', data),
  update: (id: string, data: Partial<Professor>) => api.put<Professor>(`/professores/${id}`, data),
  delete: (id: string) => api.delete(`/professores/${id}`),
};

export const turmasAPI = {
  getAll: (page = 1, limit = 100) => api.get<PaginatedResponse<Turma>>(`/turmas?page=${page}&limit=${limit}`),
  getById: (id: string) => api.get<Turma>(`/turmas/${id}`),
  create: (data: Omit<Turma, 'id'>) => api.post<Turma>('/turmas', data),
  update: (id: string, data: Partial<Turma>) => api.put<Turma>(`/turmas/${id}`, data),
  delete: (id: string) => api.delete(`/turmas/${id}`),
};

export const disciplinasAPI = {
  getAll: (page = 1, limit = 100) => api.get<PaginatedResponse<Disciplina>>(`/disciplinas?page=${page}&limit=${limit}`),
  getById: (id: string) => api.get<Disciplina>(`/disciplinas/${id}`),
  create: (data: Omit<Disciplina, 'id'>) => api.post<Disciplina>('/disciplinas', data),
  update: (id: string, data: Partial<Disciplina>) => api.put<Disciplina>(`/disciplinas/${id}`, data),
  delete: (id: string) => api.delete(`/disciplinas/${id}`),
};

export const disciplinaTurmaAPI = {
  getAll: (params?: { turmaId?: string; disciplinaId?: string }) => 
    api.get<DisciplinaTurma[]>('/disciplinas-turmas', { params }),
  getById: (id: string) => api.get<DisciplinaTurma>(`/disciplinas-turmas/${id}`),
  create: (data: { disciplinaId: string; turmaId: string; professorId?: string }) => 
    api.post<DisciplinaTurma>('/disciplinas-turmas', data),
  update: (id: string, data: { professorId?: string }) => 
    api.put<DisciplinaTurma>(`/disciplinas-turmas/${id}`, data),
  delete: (id: string) => api.delete(`/disciplinas-turmas/${id}`),
};

export const notasAPI = {
  getAll: () => api.get<Nota[]>('/notas'),
  getByAluno: (alunoId: string) => api.get<Nota[]>(`/notas/aluno/${alunoId}`),
  getByTurma: (turmaId: string, anoLetivo?: number) => 
    api.get<Nota[]>(`/notas/turma/${turmaId}`, { params: { anoLetivo } }),
  create: (data: Omit<Nota, 'id'>) => api.post<Nota>('/notas', data),
  update: (id: string, data: Partial<Nota>) => api.put<Nota>(`/notas/${id}`, data),
  delete: (id: string) => api.delete(`/notas/${id}`),
};

export const frequenciasAPI = {
  getAll: () => api.get<Frequencia[]>('/frequencias'),
  getByAluno: (alunoId: string) => api.get<Frequencia[]>(`/frequencias/aluno/${alunoId}`),
  create: (data: Omit<Frequencia, 'id'>) => api.post<Frequencia>('/frequencias', data),
  update: (id: string, data: Partial<Frequencia>) => api.put<Frequencia>(`/frequencias/${id}`, data),
  delete: (id: string) => api.delete(`/frequencias/${id}`),
};

export interface Configuracao {
  id: string;
  nomeEscola: string;
  redeEscolar?: string | null;
  endereco: string;
  telefone?: string | null;
  email?: string | null;
  logoUrl?: string | null;
  temaModo: 'light' | 'dark';
  createdAt?: string;
  updatedAt?: string;
}

export const configuracoesAPI = {
  get: () => api.get<Configuracao>('/configuracoes'),
  update: (data: Partial<Configuracao>) => api.put<Configuracao>('/configuracoes', data),
};

// Auth Types
export interface LoginData {
  email: string;
  senha: string;
  twoFactorToken?: string; // FASE 4: Token 2FA opcional
}

export interface RegisterData {
  nome: string;
  email: string;
  senha: string;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipo: string;
  cargo?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  refreshToken?: string;
  user: Usuario;
  requires2FA?: boolean;
}

export const authAPI = {
  login: (data: LoginData) => api.post<AuthResponse>('/auth/login', data),
  register: (data: RegisterData) => api.post<AuthResponse>('/auth/register', data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, novaSenha: string) => 
    api.post('/auth/reset-password', { token, novaSenha }),
  resetPasswordDirect: (data: { email: string; novaSenha: string }) => 
    api.post('/auth/reset-password-direct', data),
  me: () => api.get<Usuario>('/auth/me'),
};

// Equipe Diretiva Types
export interface EquipeDiretiva {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  telefone?: string;
  cargo: string;
  createdAt?: string;
  updatedAt?: string;
}

export const equipeDiretivaAPI = {
  getAll: () => api.get<EquipeDiretiva[]>('/equipe-diretiva'),
  getById: (id: string) => api.get<EquipeDiretiva>(`/equipe-diretiva/${id}`),
  create: (data: Omit<EquipeDiretiva, 'id' | 'createdAt' | 'updatedAt'>) => 
    api.post<EquipeDiretiva>('/equipe-diretiva', data),
  update: (id: string, data: Partial<EquipeDiretiva>) => 
    api.put<EquipeDiretiva>(`/equipe-diretiva/${id}`, data),
  delete: (id: string) => api.delete(`/equipe-diretiva/${id}`),
};

// Funcionários Types
export interface Funcionario {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  telefone?: string;
  cargo: string;
  setor?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const funcionariosAPI = {
  getAll: () => api.get<Funcionario[]>('/funcionarios'),
  getById: (id: string) => api.get<Funcionario>(`/funcionarios/${id}`),
  create: (data: Omit<Funcionario, 'id' | 'createdAt' | 'updatedAt'>) => 
    api.post<Funcionario>('/funcionarios', data),
  update: (id: string, data: Partial<Funcionario>) => 
    api.put<Funcionario>(`/funcionarios/${id}`, data),
  delete: (id: string) => api.delete(`/funcionarios/${id}`),
};

// Registro de Frequência
export const registroFrequenciaAPI = {
  getByTurmaAndPeriodo: (turmaId: string, dataInicio: string, dataFim: string) =>
    api.get(`/registro-frequencia/turma/${turmaId}`, {
      params: { dataInicio, dataFim }
    }),
};

// Notificações Types
export interface ConfiguracaoNotificacao {
  id?: string;
  usuarioId: number;
  tipo: 'RESPONSAVEL' | 'PROFESSOR' | 'GESTAO';
  canal: 'WHATSAPP' | 'TELEGRAM' | 'SMS';
  telefone: string;
  telegramChatId?: string;
  notificarFrequencia: boolean;
  notificarNotas: boolean;
  notificarAlertas: boolean;
  horarioInicio: string;
  horarioFim: string;
  diasSemana: string[];
  resumoDiario: boolean;
  frequenciaMensagens: 'TODAS' | 'ALERTAS' | 'RESUMO';
  ativo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface HistoricoNotificacao {
  id: string;
  usuarioId: number;
  tipo: 'FREQUENCIA' | 'NOTA' | 'ALERTA' | 'CHAT' | 'RESUMO';
  canal: 'WHATSAPP' | 'TELEGRAM' | 'SMS';
  telefone: string;
  mensagem: string;
  status: 'PENDENTE' | 'ENVIADA' | 'ENTREGUE' | 'LIDA' | 'FALHA';
  tentativas: number;
  metadata?: any;
  enviadoEm?: string;
  entreguEm?: string;
  lidoEm?: string;
  erroMensagem?: string;
  createdAt: string;
}

export interface TesteNotificacao {
  telefone: string;
  canal: 'WHATSAPP' | 'TELEGRAM' | 'SMS';
  mensagem: string;
}

export interface StatusSistema {
  notificacoesAtivas: boolean;
  modoTeste: boolean;
  canaisDisponiveis: {
    whatsapp: boolean;
    telegram: boolean;
    sms: boolean;
  };
  iaDisponivel: boolean;
  webhooksConfigurados: {
    whatsapp: boolean;
    telegram: boolean;
  };
  filaAtiva: boolean;
  ultimaExecucao?: string;
}

export const notificacoesAPI = {
  // Configuração
  getConfig: (usuarioId: number) => 
    api.get<{ success: boolean; configuracao: ConfiguracaoNotificacao }>(`/notificacoes/configuracao/${usuarioId}`),
  
  saveConfig: (data: ConfiguracaoNotificacao) => 
    api.post<{ success: boolean; configuracao: ConfiguracaoNotificacao }>('/notificacoes/configuracao', data),
  
  deleteConfig: (usuarioId: number) => 
    api.delete<{ success: boolean; message: string }>(`/notificacoes/configuracao/${usuarioId}`),
  
  // Teste
  testNotification: (data: TesteNotificacao) => 
    api.post<{ success: boolean; message: string; resultado: any }>('/notificacoes/teste', data),
  
  // Histórico
  getHistorico: (params?: { 
    usuarioId?: number; 
    tipo?: string; 
    canal?: string; 
    status?: string;
    limit?: number;
    offset?: number;
  }) => 
    api.get<{ success: boolean; total: number; historico: HistoricoNotificacao[] }>('/notificacoes/historico', { params }),
  
  // Estatísticas
  getEstatisticas: (params: { 
    dataInicio: string; 
    dataFim: string; 
    usuarioId?: number;
  }) => 
    api.get<{ success: boolean; periodo: any; estatisticas: any }>('/notificacoes/estatisticas', { params }),
  
  // Status do sistema
  getStatus: () => 
    api.get<{ success: boolean; status: StatusSistema }>('/notificacoes/status'),
  
  // Chat IA
  chat: (data: { usuarioId: number; mensagem: string; contexto?: any }) => 
    api.post<{ success: boolean; resposta: string; timestamp: string }>('/notificacoes/chat', data),
};
