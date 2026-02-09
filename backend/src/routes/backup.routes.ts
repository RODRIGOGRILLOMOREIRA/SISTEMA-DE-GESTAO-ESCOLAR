import { Router, Request, Response } from 'express'
import { backupService } from '../services/backup.service'
import { logError, logInfo } from '../lib/logger'

const router = Router()

// GET /api/backup - Lista backups disponíveis
router.get('/', async (req: Request, res: Response) => {
  try {
    const backups = await backupService.listBackups()

    res.json({
      enabled: backupService.isEnabled(),
      config: backupService.getConfig(),
      backups: backups.map(b => ({
        filename: b.filename,
        size: b.size,
        sizeMB: (b.size / (1024 * 1024)).toFixed(2),
        date: b.date,
      })),
    })
  } catch (error) {
    logError('Erro ao listar backups', error, { component: 'backup' })
    res.status(500).json({ error: 'Erro ao listar backups' })
  }
})

// POST /api/backup - Criar backup manual
router.post('/', async (req: Request, res: Response) => {
  try {
    if (!backupService.isEnabled()) {
      return res.status(400).json({ 
        error: 'Backup automático está desabilitado',
        hint: 'Configure BACKUP_ENABLED=true no .env'
      })
    }

    const result = await backupService.performBackup()

    if (result.success) {
      res.json({
        message: 'Backup criado com sucesso',
        filename: result.filename,
      })
    } else {
      res.status(500).json({
        error: 'Erro ao criar backup',
        details: result.error,
      })
    }
  } catch (error: any) {
    console.error('Erro ao criar backup:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/backup/restore - Restaurar backup
router.post('/restore', async (req: Request, res: Response) => {
  try {
    const { filename } = req.body

    if (!filename) {
      return res.status(400).json({ error: 'Nome do arquivo é obrigatório' })
    }

    const result = await backupService.restoreBackup(filename)

    if (result.success) {
      res.json({ message: 'Backup restaurado com sucesso' })
    } else {
      res.status(500).json({
        error: 'Erro ao restaurar backup',
        details: result.error,
      })
    }
  } catch (error: any) {
    console.error('Erro ao restaurar backup:', error)
    res.status(500).json({ error: error.message })
  }
})

// DELETE /api/backup/clean - Limpar backups antigos
router.delete('/clean', async (req: Request, res: Response) => {
  try {
    const deletedCount = await backupService.cleanOldBackups()

    res.json({
      message: 'Limpeza concluída',
      deletedCount,
    })
  } catch (error) {
    logError('Erro ao limpar backups', error, { component: 'backup' })
    res.status(500).json({ error: 'Erro ao limpar backups' })
  }
})

export default router
