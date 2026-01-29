/**
 * Encryption Service - Criptografia de Dados Sensíveis
 * Fase 4 - Segurança Avançada
 * 
 * Utiliza AES-256-GCM para criptografia autenticada
 */

import crypto from 'crypto';
import { log } from '../lib/logger';

// Chave de criptografia - DEVE ser armazenada em variável de ambiente
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // Para GCM
const TAG_LENGTH = 16; // Authentication tag length
const SALT_LENGTH = 64;

/**
 * Gerar chave a partir da master key e salt
 */
function deriveKey(salt: Buffer): Buffer {
  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  return crypto.pbkdf2Sync(key, salt, 100000, 32, 'sha256');
}

/**
 * Criptografar texto
 * @param text Texto a ser criptografado
 * @returns Texto criptografado em formato: salt:iv:tag:encrypted
 */
export function encrypt(text: string): string {
  try {
    if (!text) return '';

    // Gerar salt e IV aleatórios
    const salt = crypto.randomBytes(SALT_LENGTH);
    const key = deriveKey(salt);
    const iv = crypto.randomBytes(IV_LENGTH);

    // Criar cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Criptografar
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Obter authentication tag
    const tag = cipher.getAuthTag();

    // Retornar: salt:iv:tag:encrypted
    const result = [
      salt.toString('hex'),
      iv.toString('hex'),
      tag.toString('hex'),
      encrypted
    ].join(':');

    return result;
  } catch (error: any) {
    log.error({ err: error, component: 'encryption' }, 'Erro ao criptografar dados');
    throw new Error('Erro ao criptografar dados');
  }
}

/**
 * Descriptografar texto
 * @param encryptedData Texto criptografado (formato: salt:iv:tag:encrypted)
 * @returns Texto original
 */
export function decrypt(encryptedData: string): string {
  try {
    if (!encryptedData) return '';

    // Separar componentes
    const parts = encryptedData.split(':');
    if (parts.length !== 4) {
      throw new Error('Formato de dado criptografado inválido');
    }

    const [saltHex, ivHex, tagHex, encrypted] = parts;

    // Converter de hex para Buffer
    const salt = Buffer.from(saltHex, 'hex');
    const key = deriveKey(salt);
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');

    // Criar decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    // Descriptografar
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error: any) {
    log.error({ err: error, component: 'encryption' }, 'Erro ao descriptografar dados');
    throw new Error('Erro ao descriptografar dados');
  }
}

/**
 * Descriptografar texto de forma segura (retorna original se falhar)
 * Útil para dados que podem estar não criptografados
 */
export function safeDecrypt(encryptedData: string): string {
  try {
    if (!encryptedData) return '';
    
    // Verificar se parece estar criptografado (formato salt:iv:tag:encrypted)
    const parts = encryptedData.split(':');
    if (parts.length !== 4) {
      // Não está no formato criptografado, retornar como está
      return encryptedData;
    }

    return decrypt(encryptedData);
  } catch (error) {
    // Se falhar ao descriptografar, retornar o dado original
    return encryptedData;
  }
}

/**
 * Criptografar CPF (remove pontuação antes)
 */
export function encryptCPF(cpf: string): string {
  if (!cpf) return '';
  // Remover pontuação
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  return encrypt(cleanCPF);
}

/**
 * Descriptografar CPF e formatar
 */
export function decryptCPF(encryptedCPF: string, format: boolean = true): string {
  if (!encryptedCPF) return '';
  const cpf = decrypt(encryptedCPF);
  
  if (format && cpf.length === 11) {
    // Formatar: 000.000.000-00
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  
  return cpf;
}

/**
 * Criptografar telefone (remove pontuação antes)
 */
export function encryptPhone(phone: string): string {
  if (!phone) return '';
  // Remover pontuação
  const cleanPhone = phone.replace(/[^\d]/g, '');
  return encrypt(cleanPhone);
}

/**
 * Descriptografar telefone e formatar
 */
export function decryptPhone(encryptedPhone: string, format: boolean = true): string {
  if (!encryptedPhone) return '';
  const phone = decrypt(encryptedPhone);
  
  if (format) {
    // Formatar baseado no tamanho
    if (phone.length === 11) {
      // Celular: (00) 00000-0000
      return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (phone.length === 10) {
      // Fixo: (00) 0000-0000
      return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
  }
  
  return phone;
}

/**
 * Hash de senha (one-way, não pode ser revertido)
 * Usar bcrypt para senhas ao invés de criptografia
 */
export function hashPassword(password: string): string {
  return crypto
    .createHash('sha256')
    .update(password)
    .digest('hex');
}

/**
 * Verificar integridade de dados
 */
export function generateChecksum(data: string): string {
  return crypto
    .createHash('sha256')
    .update(data)
    .digest('hex');
}

/**
 * Verificar se ENCRYPTION_KEY está configurada corretamente
 */
export function isEncryptionConfigured(): boolean {
  return !!process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length === 64;
}

/**
 * Gerar nova chave de criptografia (para setup inicial)
 */
export function generateEncryptionKey(): string {
  const key = crypto.randomBytes(32).toString('hex');
  log.warn({ component: 'encryption' }, 'Nova chave de criptografia gerada. Adicione ao .env');
  console.log('\n⚠️  IMPORTANTE: Adicione esta chave ao arquivo .env:');
  console.log(`ENCRYPTION_KEY=${key}\n`);
  return key;
}

// Verificar configuração na inicialização
if (!isEncryptionConfigured()) {
  log.warn({ component: 'encryption' }, 
    'ENCRYPTION_KEY não configurada no .env. Usando chave temporária (NÃO USAR EM PRODUÇÃO)');
  if (process.env.NODE_ENV === 'production') {
    throw new Error('ENCRYPTION_KEY deve ser configurada em produção');
  }
}

export default {
  encrypt,
  decrypt,
  safeDecrypt,
  encryptCPF,
  decryptCPF,
  encryptPhone,
  decryptPhone,
  hashPassword,
  generateChecksum,
  isEncryptionConfigured,
  generateEncryptionKey
};
