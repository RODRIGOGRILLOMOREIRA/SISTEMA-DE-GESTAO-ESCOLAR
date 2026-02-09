import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { requireRole } from '../middlewares/rbac.middleware';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient() as any; // Cast para contornar cache do TypeScript

/**
 * @route POST /api/communication/templates
 * @desc Criar novo template de mensagem
 * @access Private - ADMIN, COORDENADOR, DIRETOR
 */
router.post('/templates', authMiddleware, requireRole(['ADMIN', 'COORDENADOR', 'DIRETOR']), async (req, res) => {
  try {
    const { name, category, channel, subject, content, variables } = req.body;
    
    if (!name || !category || !channel || !content) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: name, category, channel, content'
      });
    }

    const template = await prisma.messageTemplate.create({
      data: {
        name,
        category,
        channel,
        subject,
        content,
        variables: variables || [],
        createdBy: req.user!.id
      }
    });

    res.status(201).json({
      success: true,
      message: 'Template criado com sucesso',
      template
    });
  } catch (error) {
    console.error('Erro ao criar template:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar template',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

/**
 * @route GET /api/communication/templates
 * @desc Listar templates com filtros opcionais
 * @access Private - Todos os papéis autenticados
 */
router.get('/templates', authMiddleware, requireRole(['ADMIN', 'COORDENADOR', 'DIRETOR', 'PROFESSOR', 'SECRETARIO']), async (req, res) => {
  try {
    const { channel, category, isActive } = req.query;
    
    const templates = await prisma.messageTemplate.findMany({
      where: {
        ...(channel && { channel: channel as string }),
        ...(category && { category: category as string }),
        ...(isActive !== undefined && { isActive: isActive === 'true' })
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      templates,
      total: templates.length
    });
  } catch (error) {
    console.error('Erro ao listar templates:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar templates'
    });
  }
});

/**
 * @route POST /api/communication/send
 * @desc Enviar mensagem
 * @access Private - ADMIN, COORDENADOR, DIRETOR, PROFESSOR
 */
router.post('/send', authMiddleware, requireRole(['ADMIN', 'COORDENADOR', 'DIRETOR', 'PROFESSOR']), async (req, res) => {
  try {
    const {
      channel,
      recipientType,
      recipient,
      recipientId,
      templateId,
      subject,
      content
    } = req.body;

    if (!channel || !recipientType || !recipient || !content) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: channel, recipientType, recipient, content'
      });
    }

    const message = await prisma.message.create({
      data: {
        channel,
        recipientType,
        recipient,
        recipientId,
        templateId,
        subject,
        content,
        sentBy: req.user!.id,
        status: 'pending'
      }
    });

    // Aqui você adicionaria a lógica de envio real (Twilio, SendGrid, etc)
    // Por ora, apenas marca como enviado
    await prisma.message.update({
      where: { id: message.id },
      data: {
        status: 'sent',
        sentAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Mensagem enviada com sucesso',
      data: message
    });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao enviar mensagem'
    });
  }
});

/**
 * @route GET /api/communication/history
 * @desc Buscar histórico de mensagens
 * @access Private - Todos os papéis autenticados
 */
router.get('/history', authMiddleware, requireRole(['ADMIN', 'COORDENADOR', 'DIRETOR', 'PROFESSOR', 'SECRETARIO']), async (req, res) => {
  try {
    const { channel, status, limit = '50' } = req.query;

    const messages = await prisma.message.findMany({
      where: {
        ...(channel && { channel: channel as string }),
        ...(status && { status: status as string })
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      include: {
        template: {
          select: {
            name: true,
            category: true
          }
        }
      }
    });

    res.json({
      success: true,
      messages,
      total: messages.length
    });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar histórico'
    });
  }
});

/**
 * @route GET /api/communication/stats
 * @desc Estatísticas gerais de comunicação
 * @access Private - Todos os papéis autenticados
 */
router.get('/stats', authMiddleware, requireRole(['ADMIN', 'COORDENADOR', 'DIRETOR', 'PROFESSOR', 'SECRETARIO']), async (req, res) => {
  try {
    const [
      totalMessages,
      sentToday,
      pendingMessages,
      totalTemplates
    ] = await Promise.all([
      prisma.message.count(),
      prisma.message.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.message.count({
        where: { status: 'pending' }
      }),
      prisma.messageTemplate.count({
        where: { isActive: true }
      })
    ]);

    res.json({
      success: true,
      stats: {
        totalMessages,
        sentToday,
        pendingMessages,
        totalTemplates
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas'
    });
  }
});

export default router;
