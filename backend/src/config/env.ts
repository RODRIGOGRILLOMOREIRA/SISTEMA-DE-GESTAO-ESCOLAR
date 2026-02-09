/**
 * VALIDAÇÃO DE VARIÁVEIS DE AMBIENTE
 * 
 * Sistema robusto de validação usando Zod
 * Garante que todas as variáveis críticas estão configuradas
 * corretamente antes do servidor iniciar.
 * 
 * @author Sistema de Gestão Escolar
 * @since 2026-01-23
 */

import { z } from 'zod';

/**
 * Schema de validação para variáveis de ambiente
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL deve ser uma URL válida'),
  POSTGRES_USER: z.string().min(1, 'POSTGRES_USER é obrigatório'),
  POSTGRES_PASSWORD: z.string().min(1, 'POSTGRES_PASSWORD é obrigatório'),
  POSTGRES_HOST: z.string().min(1, 'POSTGRES_HOST é obrigatório'),
  POSTGRES_PORT: z.string().regex(/^\d+$/, 'POSTGRES_PORT deve ser um número'),
  POSTGRES_DB: z.string().min(1, 'POSTGRES_DB é obrigatório'),

  // Server
  PORT: z.string().regex(/^\d+$/, 'PORT deve ser um número').default('3333'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Frontend
  FRONTEND_URL: z.string().url('FRONTEND_URL deve ser uma URL válida'),

  // Security - CRÍTICO
  JWT_SECRET: z.string().min(32, '⚠️  JWT_SECRET deve ter no mínimo 32 caracteres para segurança'),
  ENCRYPTION_KEY: z.string().length(64, '⚠️  ENCRYPTION_KEY deve ter exatamente 64 caracteres hexadecimais'),

  // Redis
  REDIS_URL: z.string().optional(),
  UPSTASH_REDIS_URL: z.string().optional(),
  REDIS_WRITE_BOTH: z.string().optional().default('true'),
  REDIS_READ_PREFERENCE: z.enum(['local', 'cloud']).optional().default('local'),
  REDIS_SYNC_ENABLED: z.string().optional().default('false'),

  // Backup
  BACKUP_ENABLED: z.string().optional().default('true'),
  BACKUP_SCHEDULE: z.string().optional().default('0 3 * * *'),
  BACKUP_RETENTION_DAYS: z.string().regex(/^\d+$/).optional().default('7'),
  BACKUP_PATH: z.string().optional().default('./backups'),
  BACKUP_ON_START: z.string().optional().default('false'),

  // Notificações (Opcionais)
  NOTIFICACOES_ATIVAS: z.string().optional().default('false'),
  MODO_TESTE: z.string().optional().default('true'),
  WHATSAPP_API_URL: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_ACCESS_TOKEN: z.string().optional(),
  WHATSAPP_VERIFY_TOKEN: z.string().optional(),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_WEBHOOK_URL: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),

  // AI (Opcional)
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().optional().default('gpt-4'),

  // Observabilidade
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug', 'trace']).optional().default('info'),
  LOG_TO_FILE: z.string().optional().default('true'),

  // Development
  DISABLE_CACHE: z.string().optional().default('false'),
  DEBUG_SQL: z.string().optional().default('false'),
});

/**
 * Tipo inferido do schema
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Variáveis de ambiente validadas e tipadas
 */
let validatedEnv: Env;

/**
 * Validar variáveis de ambiente
 * Deve ser chamado no início do servidor
 */
export function validateEnv(): Env {
  try {
    validatedEnv = envSchema.parse(process.env);
    
    console.log('✅ Variáveis de ambiente validadas com sucesso');
    
    // Avisos para configurações importantes
    if (validatedEnv.NODE_ENV === 'production') {
      if (!validatedEnv.REDIS_URL && !validatedEnv.UPSTASH_REDIS_URL) {
        console.warn('⚠️  AVISO: Nenhum Redis configurado em produção');
      }
      
      if (validatedEnv.JWT_SECRET.length < 64) {
        console.warn('⚠️  AVISO: JWT_SECRET recomendado ter 64+ caracteres em produção');
      }
    }
    
    return validatedEnv;
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ ERRO: Variáveis de ambiente inválidas:\n');
      
      error.errors.forEach((err) => {
        console.error(`  • ${err.path.join('.')}: ${err.message}`);
      });
      
      console.error('\n📝 Verifique o arquivo .env.example para referência');
      console.error('💡 Copie: cp .env.example .env\n');
      
      process.exit(1);
    }
    
    throw error;
  }
}

/**
 * Obter variáveis de ambiente validadas
 * Garante que validateEnv() foi chamado antes
 */
export function getEnv(): Env {
  if (!validatedEnv) {
    throw new Error('validateEnv() deve ser chamado antes de getEnv()');
  }
  return validatedEnv;
}

/**
 * Helper para converter string para boolean
 */
export function envBoolean(value: string | undefined, defaultValue = false): boolean {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Helper para converter string para número
 */
export function envNumber(value: string | undefined, defaultValue = 0): number {
  if (!value) return defaultValue;
  const num = parseInt(value, 10);
  return isNaN(num) ? defaultValue : num;
}

/**
 * Exportar constantes úteis
 */
export const ENV_CONSTANTS = {
  IS_PRODUCTION: () => getEnv().NODE_ENV === 'production',
  IS_DEVELOPMENT: () => getEnv().NODE_ENV === 'development',
  IS_TEST: () => getEnv().NODE_ENV === 'test',
} as const;

export default { validateEnv, getEnv, envBoolean, envNumber, ENV_CONSTANTS };
