import cron from 'node-cron'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'
import { prisma } from '../lib/prisma'

const execPromise = promisify(exec)

interface BackupConfig {
  enabled: boolean
  schedule: string // Cron expression
  retentionDays: number // Quantos dias manter backups
  path: string // Caminho para salvar backups
}

class BackupService {
  private config: BackupConfig = {
    enabled: process.env.BACKUP_ENABLED === 'true',
    schedule: process.env.BACKUP_SCHEDULE || '0 3 * * *', // 3h da manhã por padrão
    retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '7'),
    path: process.env.BACKUP_PATH || path.join(process.cwd(), 'backups'),
  }

  private isRunning = false

  async initialize() {
    if (!this.config.enabled) {
      console.log('ℹ️ Backup automático desabilitado')
      return
    }

    // Criar diretório de backups se não existir
    try {
      await fs.mkdir(this.config.path, { recursive: true })
      console.log(`✅ Diretório de backups: ${this.config.path}`)
    } catch (error) {
      console.error('❌ Erro ao criar diretório de backups:', error)
      return
    }

    // Agendar backup automático
    cron.schedule(this.config.schedule, async () => {
      console.log(`⏰ Iniciando backup automático...`)
      await this.performBackup()
    })

    console.log(`✅ Backup automático agendado: ${this.config.schedule}`)

    // Fazer backup inicial se solicitado
    if (process.env.BACKUP_ON_START === 'true') {
      console.log('🚀 Fazendo backup inicial...')
      await this.performBackup()
    }

    // Limpar backups antigos na inicialização
    await this.cleanOldBackups()
  }

  async performBackup(): Promise<{ success: boolean; filename?: string; error?: string }> {
    if (this.isRunning) {
      console.log('⏳ Backup já está em execução')
      return { success: false, error: 'Backup já está em execução' }
    }

    this.isRunning = true
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `backup_${timestamp}.sql`
    const filepath = path.join(this.config.path, filename)

    try {
      console.log(`📦 Criando backup: ${filename}`)

      // Extrair informações da connection string
      const dbUrl = process.env.DATABASE_URL
      if (!dbUrl) {
        throw new Error('DATABASE_URL não configurada')
      }

      // Parse da URL do banco de dados
      const url = new URL(dbUrl)
      const host = url.hostname
      const port = url.port || '5432'
      const database = url.pathname.slice(1)
      const username = url.username
      const password = url.password

      // Comando pg_dump (Windows)
      const command = `set PGPASSWORD=${password} && pg_dump -h ${host} -p ${port} -U ${username} -d ${database} -F c -f "${filepath}"`

      await execPromise(command, {
        timeout: 300000, // 5 minutos
        maxBuffer: 50 * 1024 * 1024, // 50MB
      })

      // Verificar se o arquivo foi criado
      const stats = await fs.stat(filepath)
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2)

      console.log(`✅ Backup criado com sucesso: ${filename} (${sizeMB} MB)`)

      // Registrar no banco de dados
      await this.logBackup(filename, stats.size, 'SUCCESS')

      return { success: true, filename }
    } catch (error: any) {
      console.error('❌ Erro ao criar backup:', error.message)

      // Tentar remover arquivo parcial
      try {
        await fs.unlink(filepath)
      } catch {}

      // Registrar erro no banco
      await this.logBackup(filename, 0, 'FAILED', error.message)

      return { success: false, error: error.message }
    } finally {
      this.isRunning = false
    }
  }

  async cleanOldBackups(): Promise<number> {
    try {
      const files = await fs.readdir(this.config.path)
      const now = Date.now()
      const maxAge = this.config.retentionDays * 24 * 60 * 60 * 1000

      let deletedCount = 0

      for (const file of files) {
        if (!file.startsWith('backup_') || !file.endsWith('.sql')) {
          continue
        }

        const filepath = path.join(this.config.path, file)
        const stats = await fs.stat(filepath)
        const age = now - stats.mtimeMs

        if (age > maxAge) {
          await fs.unlink(filepath)
          deletedCount++
          console.log(`🗑️ Backup antigo removido: ${file}`)
        }
      }

      if (deletedCount > 0) {
        console.log(`✅ ${deletedCount} backup(s) antigo(s) removido(s)`)
      }

      return deletedCount
    } catch (error) {
      console.error('❌ Erro ao limpar backups antigos:', error)
      return 0
    }
  }

  async listBackups(): Promise<Array<{ filename: string; size: number; date: Date }>> {
    try {
      const files = await fs.readdir(this.config.path)
      const backups = []

      for (const file of files) {
        if (!file.startsWith('backup_') || !file.endsWith('.sql')) {
          continue
        }

        const filepath = path.join(this.config.path, file)
        const stats = await fs.stat(filepath)

        backups.push({
          filename: file,
          size: stats.size,
          date: stats.mtime,
        })
      }

      // Ordenar por data (mais recente primeiro)
      return backups.sort((a, b) => b.date.getTime() - a.date.getTime())
    } catch (error) {
      console.error('❌ Erro ao listar backups:', error)
      return []
    }
  }

  async restoreBackup(filename: string): Promise<{ success: boolean; error?: string }> {
    const filepath = path.join(this.config.path, filename)

    try {
      // Verificar se o arquivo existe
      await fs.access(filepath)

      console.log(`📥 Restaurando backup: ${filename}`)

      // Extrair informações da connection string
      const dbUrl = process.env.DATABASE_URL
      if (!dbUrl) {
        throw new Error('DATABASE_URL não configurada')
      }

      const url = new URL(dbUrl)
      const host = url.hostname
      const port = url.port || '5432'
      const database = url.pathname.slice(1)
      const username = url.username
      const password = url.password

      // Comando pg_restore (Windows)
      const command = `set PGPASSWORD=${password} && pg_restore -h ${host} -p ${port} -U ${username} -d ${database} -c -F c "${filepath}"`

      await execPromise(command, {
        timeout: 600000, // 10 minutos
        maxBuffer: 100 * 1024 * 1024, // 100MB
      })

      console.log(`✅ Backup restaurado com sucesso: ${filename}`)

      return { success: true }
    } catch (error: any) {
      console.error('❌ Erro ao restaurar backup:', error.message)
      return { success: false, error: error.message }
    }
  }

  private async logBackup(
    filename: string,
    size: number,
    status: 'SUCCESS' | 'FAILED',
    error?: string
  ) {
    try {
      // Criar tabela de logs de backup se não existir
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS backup_logs (
          id SERIAL PRIMARY KEY,
          filename VARCHAR(255) NOT NULL,
          size BIGINT NOT NULL,
          status VARCHAR(20) NOT NULL,
          error TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `

      await prisma.$executeRaw`
        INSERT INTO backup_logs (filename, size, status, error)
        VALUES (${filename}, ${size}, ${status}, ${error || null})
      `
    } catch (error) {
      console.error('⚠️ Erro ao registrar log de backup:', error)
    }
  }

  getConfig() {
    return this.config
  }

  isEnabled() {
    return this.config.enabled
  }
}

export const backupService = new BackupService()
