import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333/api',
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
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.status, error.response?.data);
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

// API Services
export const alunosAPI = {
  getAll: () => api.get<Aluno[]>('/alunos'),
  getById: (id: string) => api.get<Aluno>(`/alunos/${id}`),
  getByTurma: (turmaId: string) => api.get<Aluno[]>(`/alunos/turma/${turmaId}`),
  create: (data: Omit<Aluno, 'id'>) => api.post<Aluno>('/alunos', data),
  update: (id: string, data: Partial<Aluno>) => api.put<Aluno>(`/alunos/${id}`, data),
  delete: (id: string) => api.delete(`/alunos/${id}`),
};

export const professoresAPI = {
  getAll: () => api.get<Professor[]>('/professores'),
  getById: (id: string) => api.get<Professor>(`/professores/${id}`),
  create: (data: Omit<Professor, 'id'>) => api.post<Professor>('/professores', data),
  update: (id: string, data: Partial<Professor>) => api.put<Professor>(`/professores/${id}`, data),
  delete: (id: string) => api.delete(`/professores/${id}`),
};

export const turmasAPI = {
  getAll: () => api.get<Turma[]>('/turmas'),
  getById: (id: string) => api.get<Turma>(`/turmas/${id}`),
  create: (data: Omit<Turma, 'id'>) => api.post<Turma>('/turmas', data),
  update: (id: string, data: Partial<Turma>) => api.put<Turma>(`/turmas/${id}`, data),
  delete: (id: string) => api.delete(`/turmas/${id}`),
};

export const disciplinasAPI = {
  getAll: () => api.get<Disciplina[]>('/disciplinas'),
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
  token: string;
  usuario: Usuario;
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
