import { Router, Request, Response } from 'express'
import { maintenanceService } from '../middlewares/maintenance'

const router = Router()

// GET /api/maintenance - Verificar status do modo de manutenção
router.get('/', async (req: Request, res: Response) => {
  try {
    const status = await maintenanceService.isMaintenanceMode()
    res.json(status)
  } catch (error) {
    console.error('Erro ao verificar modo de manutenção:', error)
    res.status(500).json({ error: 'Erro ao verificar modo de manutenção' })
  }
})

// POST /api/maintenance/enable - Ativar modo de manutenção
router.post('/enable', async (req: Request, res: Response) => {
  try {
    const { message, startTime, endTime, allowedIPs } = req.body

    await maintenanceService.setMaintenanceMode(true, {
      message,
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
      allowedIPs,
    })

    res.json({
      message: 'Modo de manutenção ativado',
      enabled: true,
    })
  } catch (error) {
    console.error('Erro ao ativar modo de manutenção:', error)
    res.status(500).json({ error: 'Erro ao ativar modo de manutenção' })
  }
})

// POST /api/maintenance/disable - Desativar modo de manutenção
router.post('/disable', async (req: Request, res: Response) => {
  try {
    await maintenanceService.setMaintenanceMode(false)

    res.json({
      message: 'Modo de manutenção desativado',
      enabled: false,
    })
  } catch (error) {
    console.error('Erro ao desativar modo de manutenção:', error)
    res.status(500).json({ error: 'Erro ao desativar modo de manutenção' })
  }
})

// POST /api/maintenance/clear-cache - Limpar cache do modo de manutenção
router.post('/clear-cache', async (req: Request, res: Response) => {
  try {
    maintenanceService.clearCache()
    res.json({ message: 'Cache limpo com sucesso' })
  } catch (error) {
    console.error('Erro ao limpar cache:', error)
    res.status(500).json({ error: 'Erro ao limpar cache' })
  }
})

export default router
