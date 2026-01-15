import { PrismaClient } from '@prisma/client';
import { logger } from '../lib/logger';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

// Tipos para os canais de comunicação
type Channel = 'whatsapp' | 'sms' | 'email' | 'push';
type RecipientType = 'aluno' | 'responsavel' | 'professor' | 'funcionario' | 'turma' | 'todos';
type MessageStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'read';

interface SendMessageParams {
  channel: Channel | 'all';
  recipientType: RecipientType;
  recipientId?: string;
  recipientIds?: string[];
  templateId?: string;
  subject?: string;
  content: string;
  variables?: Record<string, string>;
  sentBy: string;
  scheduledFor?: Date;
}

interface TemplateVariable {
  key: string;
  label: string;
  example: string;
}

export class CommunicationService {
  
  /**
   * Criptografa dados sensíveis (API keys, tokens)
   */
  private encryptConfig(data: any): string {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return JSON.stringify({
      iv: iv.toString('hex'),
      encrypted,
      authTag: authTag.toString('hex')
    });
  }

  /**
   * Descriptografa dados sensíveis
   */
  private decryptConfig(encryptedData: string): any {
    try {
      const { iv, encrypted, authTag } = JSON.parse(encryptedData);
      const algorithm = 'aes-256-gcm';
      const key = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');
      
      const decipher = crypto.createDecipheriv(
        algorithm,
        key,
        Buffer.from(iv, 'hex')
      );
      
      decipher.setAuthTag(Buffer.from(authTag, 'hex'));
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } catch (error) {
      logger.error('Erro ao descriptografar configuração:', error);
      throw new Error('Falha ao descriptografar configuração');
    }
  }

  /**
   * Cria ou atualiza um template de mensagem
   */
  async createTemplate(data: {
    name: string;
    category: string;
    channel: string;
    subject?: string;
    content: string;
    variables: TemplateVariable[];
    createdBy: string;
  }) {
    try {
      const template = await prisma.messageTemplate.create({
        data: {
          name: data.name,
          category: data.category,
          channel: data.channel,
          subject: data.subject,
          content: data.content,
          variables: data.variables,
          createdBy: data.createdBy,
          isActive: true
        }
      });

      logger.info(`Template criado: ${template.id} - ${template.name}`);
      return template;
    } catch (error) {
      logger.error('Erro ao criar template:', error);
      throw error;
    }
  }

  /**
   * Lista templates com filtros
   */
  async listTemplates(filters?: {
    channel?: string;
    category?: string;
    isActive?: boolean;
  }) {
    try {
      return await prisma.messageTemplate.findMany({
        where: {
          ...(filters?.channel && { channel: filters.channel }),
          ...(filters?.category && { category: filters.category }),
          ...(filters?.isActive !== undefined && { isActive: filters.isActive })
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      logger.error('Erro ao listar templates:', error);
      throw error;
    }
  }

  /**
   * Atualiza um template
   */
  async updateTemplate(id: string, data: {
    name?: string;
    content?: string;
    subject?: string;
    variables?: TemplateVariable[];
    isActive?: boolean;
  }) {
    try {
      return await prisma.messageTemplate.update({
        where: { id },
        data
      });
    } catch (error) {
      logger.error('Erro ao atualizar template:', error);
      throw error;
    }
  }

  /**
   * Processa variáveis no conteúdo do template
   */
  private processTemplate(content: string, variables: Record<string, string>): string {
    let processed = content;
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, value);
    });
    
    return processed;
  }

  /**
   * Busca destinatários com base no tipo
   */
  private async getRecipients(
    recipientType: RecipientType,
    recipientId?: string,
    recipientIds?: string[]
  ): Promise<Array<{ id: string; name: string; contact: string }>> {
    try {
      switch (recipientType) {
        case 'aluno':
          if (recipientId) {
            const aluno = await prisma.alunos.findUnique({
              where: { id: recipientId },
              select: { id: true, nome: true, email: true, telefone: true }
            });
            return aluno ? [{ id: aluno.id, name: aluno.nome, contact: aluno.email }] : [];
          }
          if (recipientIds && recipientIds.length > 0) {
            const alunos = await prisma.alunos.findMany({
              where: { id: { in: recipientIds } },
              select: { id: true, nome: true, email: true, telefone: true }
            });
            return alunos.map(a => ({ id: a.id, name: a.nome, contact: a.email }));
          }
          const allAlunos = await prisma.alunos.findMany({
            where: { statusMatricula: 'ATIVO' },
            select: { id: true, nome: true, email: true, telefone: true }
          });
          return allAlunos.map(a => ({ id: a.id, name: a.nome, contact: a.email }));

        case 'responsavel':
          if (recipientId) {
            const aluno = await prisma.alunos.findUnique({
              where: { id: recipientId },
              select: { id: true, responsavel: true, telefoneResp: true }
            });
            return aluno ? [{ id: aluno.id, name: aluno.responsavel, contact: aluno.telefoneResp }] : [];
          }
          const alunos = await prisma.alunos.findMany({
            where: recipientIds ? { id: { in: recipientIds } } : { statusMatricula: 'ATIVO' },
            select: { id: true, responsavel: true, telefoneResp: true }
          });
          return alunos.map(a => ({ id: a.id, name: a.responsavel, contact: a.telefoneResp }));

        case 'professor':
          const professores = await prisma.professor.findMany({
            where: recipientIds ? { id: { in: recipientIds } } : {},
            select: { id: true, nome: true, email: true, telefone: true }
          });
          return professores.map(p => ({ id: p.id, name: p.nome, contact: p.email }));

        case 'funcionario':
          const funcionarios = await prisma.funcionarios.findMany({
            where: recipientIds ? { id: { in: recipientIds } } : {},
            select: { id: true, nome: true, email: true, telefone: true }
          });
          return funcionarios.map(f => ({ id: f.id, name: f.nome, contact: f.email }));

        case 'turma':
          if (!recipientId) return [];
          const alunosTurma = await prisma.alunos.findMany({
            where: { turmaId: recipientId, statusMatricula: 'ATIVO' },
            select: { id: true, nome: true, email: true, telefone: true }
          });
          return alunosTurma.map(a => ({ id: a.id, name: a.nome, contact: a.email }));

        case 'todos':
          const todosAlunos = await prisma.alunos.findMany({
            where: { statusMatricula: 'ATIVO' },
            select: { id: true, nome: true, email: true }
          });
          const todosProfessores = await prisma.professor.findMany({
            select: { id: true, nome: true, email: true }
          });
          const todosFuncionarios = await prisma.funcionarios.findMany({
            select: { id: true, nome: true, email: true }
          });
          
          return [
            ...todosAlunos.map(a => ({ id: a.id, name: a.nome, contact: a.email })),
            ...todosProfessores.map(p => ({ id: p.id, name: p.nome, contact: p.email })),
            ...todosFuncionarios.map(f => ({ id: f.id, name: f.nome, contact: f.email }))
          ];

        default:
          return [];
      }
    } catch (error) {
      logger.error('Erro ao buscar destinatários:', error);
      return [];
    }
  }

  /**
   * Envia mensagem(ns) através do canal especificado
   */
  async sendMessage(params: SendMessageParams) {
    try {
      const {
        channel,
        recipientType,
        recipientId,
        recipientIds,
        templateId,
        subject,
        content,
        variables = {},
        sentBy,
        scheduledFor
      } = params;

      // Buscar template se fornecido
      let finalContent = content;
      let finalSubject = subject;
      
      if (templateId) {
        const template = await prisma.messageTemplate.findUnique({
          where: { id: templateId }
        });
        
        if (!template) {
          throw new Error('Template não encontrado');
        }
        
        finalContent = this.processTemplate(template.content, variables);
        finalSubject = template.subject ? this.processTemplate(template.subject, variables) : subject;
      } else if (variables && Object.keys(variables).length > 0) {
        finalContent = this.processTemplate(content, variables);
        if (subject) {
          finalSubject = this.processTemplate(subject, variables);
        }
      }

      // Buscar destinatários
      const recipients = await this.getRecipients(recipientType, recipientId, recipientIds);
      
      if (recipients.length === 0) {
        throw new Error('Nenhum destinatário encontrado');
      }

      logger.info(`Enviando mensagens para ${recipients.length} destinatário(s) via ${channel}`);

      // Determinar canais a usar
      const channels: Channel[] = channel === 'all' 
        ? ['whatsapp', 'sms', 'email', 'push'] 
        : [channel];

      const messages = [];

      // Criar mensagens para cada destinatário e canal
      for (const recipient of recipients) {
        for (const ch of channels) {
          // Determinar o contato apropriado para o canal
          let contact = recipient.contact;
          if (ch === 'whatsapp' || ch === 'sms') {
            // Aqui deveria buscar telefone específico se necessário
            contact = recipient.contact;
          }

          const message = await prisma.message.create({
            data: {
              templateId,
              channel: ch,
              recipientType,
              recipientId: recipient.id,
              recipient: contact,
              subject: finalSubject,
              content: finalContent,
              status: scheduledFor ? 'pending' : 'pending',
              sentBy,
              sentAt: scheduledFor ? null : new Date()
            }
          });

          messages.push(message);

          // Se não for agendado, enviar imediatamente
          if (!scheduledFor) {
            await this.sendToProvider(message.id, ch, contact, finalSubject, finalContent);
          }
        }
      }

      logger.info(`${messages.length} mensagens criadas`);
      
      return {
        success: true,
        messagesCreated: messages.length,
        recipients: recipients.length,
        channels: channels.length,
        messageIds: messages.map(m => m.id)
      };
    } catch (error) {
      logger.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  /**
   * Envia mensagem para o provedor específico
   */
  private async sendToProvider(
    messageId: string,
    channel: Channel,
    recipient: string,
    subject: string | null | undefined,
    content: string
  ) {
    try {
      // Buscar configuração do canal
      const channelConfig = await prisma.communicationChannel.findUnique({
        where: { channel }
      });

      if (!channelConfig || !channelConfig.isActive) {
        await this.updateMessageStatus(messageId, 'failed', 'Canal não configurado ou inativo');
        return;
      }

      const config = this.decryptConfig(channelConfig.config as any);

      // Simular envio (aqui seria a integração real com os provedores)
      switch (channel) {
        case 'email':
          await this.sendEmail(config, recipient, subject || 'Sem assunto', content);
          break;
        case 'sms':
          await this.sendSMS(config, recipient, content);
          break;
        case 'whatsapp':
          await this.sendWhatsApp(config, recipient, content);
          break;
        case 'push':
          await this.sendPushNotification(config, recipient, subject || '', content);
          break;
      }

      await this.updateMessageStatus(messageId, 'sent');
      
      // Atualizar analytics
      await this.updateAnalytics(channel, 'sent');
      
    } catch (error) {
      logger.error(`Erro ao enviar via ${channel}:`, error);
      await this.updateMessageStatus(messageId, 'failed', error instanceof Error ? error.message : 'Erro desconhecido');
    }
  }

  /**
   * Envia email (implementação simulada)
   */
  private async sendEmail(config: any, to: string, subject: string, content: string) {
    logger.info(`📧 Email enviado para ${to}: ${subject}`);
    // Aqui iria a integração real com SendGrid, AWS SES, etc
    // const nodemailer = require('nodemailer');
    // const transporter = nodemailer.createTransporter(config);
    // await transporter.sendMail({ from: config.from, to, subject, html: content });
  }

  /**
   * Envia SMS (implementação simulada)
   */
  private async sendSMS(config: any, to: string, content: string) {
    logger.info(`📱 SMS enviado para ${to}: ${content.substring(0, 50)}...`);
    // Aqui iria a integração real com Twilio
    // const client = require('twilio')(config.accountSid, config.authToken);
    // await client.messages.create({ from: config.from, to, body: content });
  }

  /**
   * Envia WhatsApp (implementação simulada)
   */
  private async sendWhatsApp(config: any, to: string, content: string) {
    logger.info(`💬 WhatsApp enviado para ${to}: ${content.substring(0, 50)}...`);
    // Aqui iria a integração real com Twilio WhatsApp API ou WhatsApp Business API
    // const client = require('twilio')(config.accountSid, config.authToken);
    // await client.messages.create({ from: `whatsapp:${config.from}`, to: `whatsapp:${to}`, body: content });
  }

  /**
   * Envia Push Notification (implementação simulada)
   */
  private async sendPushNotification(config: any, to: string, title: string, body: string) {
    logger.info(`🔔 Push enviado para ${to}: ${title}`);
    // Aqui iria a integração real com Firebase Cloud Messaging
    // const admin = require('firebase-admin');
    // await admin.messaging().send({ token: to, notification: { title, body } });
  }

  /**
   * Atualiza status de uma mensagem
   */
  private async updateMessageStatus(
    messageId: string,
    status: MessageStatus,
    errorMessage?: string
  ) {
    try {
      await prisma.message.update({
        where: { id: messageId },
        data: {
          status,
          ...(status === 'sent' && { sentAt: new Date() }),
          ...(status === 'delivered' && { deliveredAt: new Date() }),
          ...(status === 'read' && { readAt: new Date() }),
          ...(errorMessage && { errorMessage })
        }
      });
    } catch (error) {
      logger.error('Erro ao atualizar status da mensagem:', error);
    }
  }

  /**
   * Atualiza analytics
   */
  private async updateAnalytics(channel: string, metric: 'sent' | 'delivered' | 'failed' | 'read') {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existing = await prisma.messageAnalytics.findUnique({
        where: {
          date_channel: {
            date: today,
            channel
          }
        }
      });

      if (existing) {
        await prisma.messageAnalytics.update({
          where: { id: existing.id },
          data: {
            [metric]: { increment: 1 }
          }
        });
      } else {
        await prisma.messageAnalytics.create({
          data: {
            date: today,
            channel,
            [metric]: 1
          }
        });
      }
    } catch (error) {
      logger.error('Erro ao atualizar analytics:', error);
    }
  }

  /**
   * Agenda envio de mensagem
   */
  async scheduleMessage(data: {
    templateId: string;
    channel: string;
    recipientType: RecipientType;
    recipientIds?: string[];
    scheduledFor: Date;
    recurrence?: 'daily' | 'weekly' | 'monthly';
    createdBy: string;
  }) {
    try {
      const schedule = await prisma.messageSchedule.create({
        data: {
          templateId: data.templateId,
          channel: data.channel,
          recipientType: data.recipientType,
          recipientIds: data.recipientIds || null,
          scheduledFor: data.scheduledFor,
          recurrence: data.recurrence,
          nextSendAt: data.scheduledFor,
          createdBy: data.createdBy,
          isActive: true
        },
        include: {
          template: true
        }
      });

      logger.info(`Mensagem agendada: ${schedule.id} para ${schedule.scheduledFor}`);
      return schedule;
    } catch (error) {
      logger.error('Erro ao agendar mensagem:', error);
      throw error;
    }
  }

  /**
   * Processa mensagens agendadas
   */
  async processScheduledMessages() {
    try {
      const now = new Date();
      
      const schedules = await prisma.messageSchedule.findMany({
        where: {
          isActive: true,
          nextSendAt: {
            lte: now
          }
        },
        include: {
          template: true
        }
      });

      logger.info(`Processando ${schedules.length} mensagens agendadas`);

      for (const schedule of schedules) {
        try {
          // Enviar mensagem
          await this.sendMessage({
            channel: schedule.channel as any,
            recipientType: schedule.recipientType as RecipientType,
            recipientIds: schedule.recipientIds as string[] | undefined,
            templateId: schedule.templateId,
            content: schedule.template.content,
            subject: schedule.template.subject || undefined,
            sentBy: schedule.createdBy
          });

          // Atualizar agendamento
          let nextSendAt: Date | null = null;
          
          if (schedule.recurrence) {
            const current = new Date(schedule.scheduledFor);
            
            switch (schedule.recurrence) {
              case 'daily':
                nextSendAt = new Date(current.setDate(current.getDate() + 1));
                break;
              case 'weekly':
                nextSendAt = new Date(current.setDate(current.getDate() + 7));
                break;
              case 'monthly':
                nextSendAt = new Date(current.setMonth(current.getMonth() + 1));
                break;
            }
          }

          await prisma.messageSchedule.update({
            where: { id: schedule.id },
            data: {
              lastSentAt: now,
              nextSendAt,
              sentCount: { increment: 1 },
              isActive: nextSendAt ? true : false
            }
          });

        } catch (error) {
          logger.error(`Erro ao processar agendamento ${schedule.id}:`, error);
        }
      }
      
      return schedules.length;
    } catch (error) {
      logger.error('Erro ao processar mensagens agendadas:', error);
      throw error;
    }
  }

  /**
   * Configura canal de comunicação
   */
  async configureChannel(data: {
    channel: Channel;
    provider: string;
    config: any;
    limits?: any;
  }) {
    try {
      // Criptografar configuração sensível
      const encryptedConfig = this.encryptConfig(data.config);

      const existing = await prisma.communicationChannel.findUnique({
        where: { channel: data.channel }
      });

      if (existing) {
        return await prisma.communicationChannel.update({
          where: { channel: data.channel },
          data: {
            provider: data.provider,
            config: encryptedConfig as any,
            limits: data.limits,
            isActive: true
          }
        });
      } else {
        return await prisma.communicationChannel.create({
          data: {
            channel: data.channel,
            provider: data.provider,
            config: encryptedConfig as any,
            limits: data.limits,
            isActive: true
          }
        });
      }
    } catch (error) {
      logger.error('Erro ao configurar canal:', error);
      throw error;
    }
  }

  /**
   * Busca analytics de comunicação
   */
  async getAnalytics(filters?: {
    startDate?: Date;
    endDate?: Date;
    channel?: string;
  }) {
    try {
      const where: any = {};
      
      if (filters?.startDate || filters?.endDate) {
        where.date = {};
        if (filters.startDate) where.date.gte = filters.startDate;
        if (filters.endDate) where.date.lte = filters.endDate;
      }
      
      if (filters?.channel) {
        where.channel = filters.channel;
      }

      const analytics = await prisma.messageAnalytics.findMany({
        where,
        orderBy: { date: 'desc' }
      });

      // Calcular totais
      const totals = analytics.reduce((acc, curr) => ({
        sent: acc.sent + curr.sent,
        delivered: acc.delivered + curr.delivered,
        failed: acc.failed + curr.failed,
        read: acc.read + curr.read,
        clicked: acc.clicked + curr.clicked
      }), { sent: 0, delivered: 0, failed: 0, read: 0, clicked: 0 });

      return {
        analytics,
        totals,
        deliveryRate: totals.sent > 0 ? (totals.delivered / totals.sent * 100).toFixed(2) : 0,
        readRate: totals.delivered > 0 ? (totals.read / totals.delivered * 100).toFixed(2) : 0,
        failureRate: totals.sent > 0 ? (totals.failed / totals.sent * 100).toFixed(2) : 0
      };
    } catch (error) {
      logger.error('Erro ao buscar analytics:', error);
      throw error;
    }
  }

  /**
   * Busca histórico de mensagens
   */
  async getMessageHistory(filters?: {
    channel?: string;
    recipientType?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 50;
      const skip = (page - 1) * limit;

      const where: any = {};
      
      if (filters?.channel) where.channel = filters.channel;
      if (filters?.recipientType) where.recipientType = filters.recipientType;
      if (filters?.status) where.status = filters.status;
      
      if (filters?.startDate || filters?.endDate) {
        where.createdAt = {};
        if (filters.startDate) where.createdAt.gte = filters.startDate;
        if (filters.endDate) where.createdAt.lte = filters.endDate;
      }

      const [messages, total] = await Promise.all([
        prisma.message.findMany({
          where,
          include: {
            template: {
              select: { name: true, category: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.message.count({ where })
      ]);

      return {
        messages,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Erro ao buscar histórico:', error);
      throw error;
    }
  }
}

export default new CommunicationService();
