/**
 * Rotas de Configuração de Notificações
 * Permite usuários configurarem suas preferências de notificações
 */

import { Router } from 'express';
import { prisma } from '../lib/prisma';
import iaService from '../services/ia.service';

const router = Router();

/**
 * GET /api/notificacoes/config/:usuarioId
 * Obter configuração de notificações
 */
router.get('/config/:usuarioId', async (req, res) => {
  try {
    const { usuarioId } = req.params;

    let config = await prisma.configuracao_notificacao.findUnique({
      where: { usuarioId }
    });

    if (!config) {
      // Criar configuração padrão
      config = await prisma.configuracao_notificacao.create({
        data: {
          usuarioId,
          tipoPerfil: 'RESPONSAVEL', // Padrão, deve ser ajustado
          whatsappAtivo: true,
          smsAtivo: false,
          notificarFrequencia: true,
          notificarNotas: true,
          notificarAlertas: true,
          resumoDiario: false,
          frequenciaMensagens: 'TODAS'
        }
      });
    }

    res.json(config);
  } catch (error: any) {
    console.error('Erro ao buscar configuração:', error);
    res.status(500).json({ error: 'Erro ao buscar configuração' });
  }
});

/**
 * PUT /api/notificacoes/config/:usuarioId
 * Atualizar configuração de notificações
 */
router.put('/config/:usuarioId', async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const dados = req.body;

    const config = await prisma.configuracao_notificacao.upsert({
      where: { usuarioId },
      update: dados,
      create: {
        usuarioId,
        ...dados
      }
    });

    res.json({ success: true, config });
  } catch (error: any) {
    console.error('Erro ao atualizar configuração:', error);
    res.status(500).json({ error: 'Erro ao atualizar configuração' });
  }
});

/**
 * GET /api/notificacoes/logs/:usuarioId
 * Histórico de notificações enviadas
 */
router.get('/logs/:usuarioId', async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const { limit = '50', offset = '0' } = req.query;

    const logs = await prisma.log_notificacao.findMany({
      where: { destinatarioId: usuarioId },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    const total = await prisma.log_notificacao.count({
      where: { destinatarioId: usuarioId }
    });

    res.json({ logs, total });
  } catch (error: any) {
    console.error('Erro ao buscar logs:', error);
    res.status(500).json({ error: 'Erro ao buscar logs' });
  }
});

/**
 * GET /api/notificacoes/estatisticas/:usuarioId
 * Estatísticas de notificações
 */
router.get('/estatisticas/:usuarioId', async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const [total, enviados, falhas, porTipo] = await Promise.all([
      prisma.log_notificacao.count({
        where: { destinatarioId: usuarioId }
      }),
      prisma.log_notificacao.count({
        where: { destinatarioId: usuarioId, status: 'ENVIADO' }
      }),
      prisma.log_notificacao.count({
        where: { destinatarioId: usuarioId, status: 'FALHA' }
      }),
      prisma.log_notificacao.groupBy({
        by: ['tipoEvento'],
        where: { destinatarioId: usuarioId },
        _count: true
      })
    ]);

    res.json({
      total,
      enviados,
      falhas,
      taxaSucesso: total > 0 ? ((enviados / total) * 100).toFixed(1) : 0,
      porTipo
    });
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

/**
 * POST /api/notificacoes/webhook/whatsapp
 * Webhook para receber mensagens do WhatsApp
 */
router.post('/webhook/whatsapp', async (req, res) => {
  try {
    const body = req.body;

    // Validar webhook do WhatsApp
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field === 'messages') {
            const message = change.value.messages?.[0];
            if (message && message.type === 'text') {
              await processarMensagemRecebida({
                origem: 'WHATSAPP',
                remetenteId: message.from,
                mensagem: message.text.body,
                timestamp: message.timestamp
              });
            }
          }
        }
      }
    }

    res.status(200).send('EVENT_RECEIVED');
  } catch (error: any) {
    console.error('Erro no webhook WhatsApp:', error);
    res.status(500).send('ERROR');
  }
});

/**
 * GET /api/notificacoes/webhook/whatsapp
 * Verificação do webhook (Meta requer)
 */
router.get('/webhook/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'meu_token_secreto';

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✅ Webhook do WhatsApp verificado');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

/**
 * POST /api/notificacoes/chat
 * Enviar mensagem para a IA
 */
router.post('/chat', async (req, res) => {
  try {
    const { usuarioId, tipoPerfil, mensagem, contexto } = req.body;

    if (!iaService.isAtivo()) {
      return res.json({
        resposta: 'Desculpe, o serviço de chatbot não está disponível no momento.'
      });
    }

    const resposta = await iaService.processarMensagem({
      usuarioId,
      tipoPerfil,
      mensagem,
      contexto
    });

    res.json(resposta);
  } catch (error: any) {
    console.error('Erro no chat IA:', error);
    res.status(500).json({ error: 'Erro ao processar mensagem' });
  }
});

/**
 * POST /api/notificacoes/teste
 * Enviar notificação de teste
 */
router.post('/teste', async (req, res) => {
  try {
    const { telefone, mensagem, canal = 'whatsapp' } = req.body;

    if (!telefone || !mensagem) {
      return res.status(400).json({ error: 'Telefone e mensagem são obrigatórios' });
    }

    let sucesso = false;

    if (canal === 'whatsapp') {
      const whatsappService = (await import('../services/whatsapp.service')).default;
      sucesso = await whatsappService.enviarMensagem({
        to: telefone,
        message: mensagem
      });
    } else if (canal === 'sms') {
      const smsService = (await import('../services/sms.service')).default;
      sucesso = await smsService.enviarSMS({
        to: telefone,
        message: mensagem
      });
    }

    res.json({ success: sucesso, canal, telefone });
  } catch (error: any) {
    console.error('Erro ao enviar teste:', error);
    res.status(500).json({ error: 'Erro ao enviar notificação de teste' });
  }
});

/**
 * Processar mensagem recebida (resposta de usuário)
 */
async function processarMensagemRecebida(dados: any) {
  try {
    // Salvar mensagem recebida
    const webhook = await prisma.webhook_message.create({
      data: {
        origem: dados.origem,
        remetenteId: dados.remetenteId,
        mensagem: dados.mensagem,
        processado: false
      }
    });

    // TODO: Identificar usuário pelo telefone
    // TODO: Processar com IA se for uma pergunta
    // TODO: Responder automaticamente

    console.log('📩 Mensagem recebida:', dados.remetenteId, '-', dados.mensagem);

    // Marcar como processado
    await prisma.webhook_message.update({
      where: { id: webhook.id },
      data: { processado: true }
    });

  } catch (error) {
    console.error('❌ Erro ao processar mensagem recebida:', error);
  }
}

export { router as notificacoesRouter };
