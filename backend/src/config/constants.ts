/**
 * CONSTANTES DO SISTEMA
 * 
 * Centralização de valores mágicos e configurações
 * para facilitar manutenção e evitar duplicação
 * 
 * @author Sistema de Gestão Escolar
 * @since 2026-01-23
 */

/**
 * Constantes de Segurança
 */
export const SECURITY = {
  // Bcrypt
  BCRYPT_ROUNDS: 10,
  
  // JWT
  JWT_EXPIRES_IN: '7d',
  JWT_REFRESH_EXPIRES_IN: '30d',
  JWT_MIN_SECRET_LENGTH: 32,
  
  // Rate Limiting
  RATE_LIMIT: {
    AUTH: {
      WINDOW_MS: 1 * 60 * 1000, // 1 minuto
      MAX_REQUESTS: 100, // 100 tentativas (desenvolvimento)
    },
    API: {
      WINDOW_MS: 1 * 60 * 1000, // 1 minuto
      MAX_REQUESTS: 100, // 100 requisições
    },
  },
  
  // Bloqueio de IP
  MAX_AUTH_FAILURES: 10,
  IP_BLOCK_DURATION: 3600, // 1 hora em segundos
} as const;

/**
 * Constantes de Cache
 */
export const CACHE = {
  TTL: {
    SHORT: 300,      // 5 minutos
    MEDIUM: 1800,    // 30 minutos
    LONG: 86400,     // 24 horas
    VERY_LONG: 604800, // 7 dias
  },
  
  PREFIXES: {
    USER: 'user:',
    SESSION: 'session:',
    ALUNO: 'aluno:',
    PROFESSOR: 'professor:',
    TURMA: 'turma:',
    NOTA: 'nota:',
    FREQUENCIA: 'freq:',
    BLACKLIST: 'blacklist:',
    AUTH_FAILURES: 'auth_failures:',
    RATE_LIMIT: 'rl:',
  },
} as const;

/**
 * Constantes de Backup
 */
export const BACKUP = {
  DEFAULT_SCHEDULE: '0 3 * * *', // 3h da manhã
  DEFAULT_RETENTION_DAYS: 7,
  DEFAULT_PATH: './backups',
  FILE_EXTENSION: '.sql',
  DATE_FORMAT: 'yyyyMMdd_HHmmss',
} as const;

/**
 * Constantes de Upload
 */
export const UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword'],
  PATHS: {
    FACIAL_RECOGNITION: './uploads/reconhecimento-facial',
    REGISTRO_PONTO: './uploads/registro-ponto',
    TEMP: './uploads/temp',
  },
} as const;

/**
 * Constantes de Paginação
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
} as const;

/**
 * Constantes de Notificações
 */
export const NOTIFICATIONS = {
  CHANNELS: {
    EMAIL: 'email',
    SMS: 'sms',
    WHATSAPP: 'whatsapp',
    TELEGRAM: 'telegram',
    PUSH: 'push',
  },
  
  PRIORITIES: {
    LOW: 'low',
    NORMAL: 'normal',
    HIGH: 'high',
    URGENT: 'urgent',
  },
  
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY_MS: 5000, // 5 segundos
  },
} as const;

/**
 * Constantes de Status
 */
export const STATUS = {
  MATRICULA: {
    ATIVO: 'ATIVO',
    INATIVO: 'INATIVO',
    TRANSFERIDO: 'TRANSFERIDO',
    EVADIDO: 'EVADIDO',
    CONCLUIDO: 'CONCLUIDO',
  },
  
  PRESENCA: {
    PRESENTE: 'PRESENTE',
    AUSENTE: 'AUSENTE',
    JUSTIFICADO: 'JUSTIFICADO',
  },
  
  TURNO: {
    MATUTINO: 'MATUTINO',
    VESPERTINO: 'VESPERTINO',
    NOTURNO: 'NOTURNO',
    INTEGRAL: 'INTEGRAL',
  },
} as const;

/**
 * Constantes de Validação
 */
export const VALIDATION = {
  NOME_MIN_LENGTH: 3,
  NOME_MAX_LENGTH: 255,
  CPF_LENGTH: 11,
  EMAIL_MAX_LENGTH: 255,
  SENHA_MIN_LENGTH: 6,
  TELEFONE_MIN_LENGTH: 10,
  TELEFONE_MAX_LENGTH: 15,
} as const;

/**
 * Constantes de Timeout
 */
export const TIMEOUT = {
  REQUEST_MS: 30000, // 30 segundos
  QUERY_MS: 10000,   // 10 segundos
  WEBSOCKET_MS: 60000, // 1 minuto
} as const;

/**
 * Constantes de Log
 */
export const LOG = {
  LEVELS: {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug',
    TRACE: 'trace',
  },
  
  COMPONENTS: {
    AUTH: 'auth',
    CACHE: 'cache',
    DATABASE: 'database',
    REDIS: 'redis',
    BACKUP: 'backup',
    NOTIFICACAO: 'notificacao',
    WEBSOCKET: 'websocket',
    API: 'api',
  },
} as const;

/**
 * Constantes de Erro HTTP
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Mensagens de Erro Padrão
 */
export const ERROR_MESSAGES = {
  AUTH: {
    INVALID_CREDENTIALS: 'Email ou senha inválidos',
    TOKEN_EXPIRED: 'Token expirado',
    TOKEN_INVALID: 'Token inválido',
    UNAUTHORIZED: 'Não autorizado',
    FORBIDDEN: 'Acesso negado',
  },
  
  VALIDATION: {
    REQUIRED_FIELD: 'Campo obrigatório',
    INVALID_EMAIL: 'Email inválido',
    INVALID_CPF: 'CPF inválido',
    WEAK_PASSWORD: 'Senha muito fraca',
  },
  
  DATABASE: {
    CONNECTION_ERROR: 'Erro de conexão com o banco de dados',
    QUERY_ERROR: 'Erro ao executar consulta',
    NOT_FOUND: 'Registro não encontrado',
    DUPLICATE: 'Registro duplicado',
  },
  
  SERVER: {
    INTERNAL_ERROR: 'Erro interno do servidor',
    SERVICE_UNAVAILABLE: 'Serviço temporariamente indisponível',
    TIMEOUT: 'Tempo limite excedido',
  },
} as const;

export default {
  SECURITY,
  CACHE,
  BACKUP,
  UPLOAD,
  PAGINATION,
  NOTIFICATIONS,
  STATUS,
  VALIDATION,
  TIMEOUT,
  LOG,
  HTTP_STATUS,
  ERROR_MESSAGES,
};
