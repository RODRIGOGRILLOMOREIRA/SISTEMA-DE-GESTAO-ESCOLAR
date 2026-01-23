import { Job } from 'bull';
import { notificationService } from '../services/notification.service';

/**
 * Interface para job de notificação
 */
interface NotificationJobData {
  tipo: 'NOTA_LANCADA' | 'FALTA_REGISTRADA' | 'AVISO_GERAL' | 'REUNIAO' | 'EVENTO';
  destinatarioId: string;
  destinatarioNome: string;
  destinatarioTipo: 'ALUNO' | 'RESPONSAVEL' | 'PROFESSOR' | 'FUNCIONARIO';
  titulo: string;
  mensagem: string;
  metadata?: Record<string, any>;
  canais: ('WHATSAPP' | 'SMS' | 'EMAIL')[];
  prioridade: 'ALTA' | 'MEDIA' | 'BAIXA';
}

/**
 * Processa job de notificação
 * Tenta enviar por todos os canais solicitados
 */
async function processNotification(job: Job<NotificationJobData>) {
  const { data } = job;
  
  console.log(`📨 Processando notificação ${job.id} para ${data.destinatarioNome}`);
  
  const results: any = {
    jobId: job.id,
    destinatario: data.destinatarioNome,
    sucesso: [],
    falhas: [],
  };

  // Atualiza progresso
  await job.progress(10);

  try {
    // Busca informações de contato do destinatário
    const contato = await buscarContatoDestinatario(data.destinatarioId, data.destinatarioTipo);
    
    if (!contato) {
      throw new Error(`Destinatário ${data.destinatarioId} não encontrado`);
    }

    await job.progress(30);

    // Processa cada canal solicitado
    const totalCanais = data.canais.length;
    let processados = 0;

    for (const canal of data.canais) {
      try {
        switch (canal) {
          case 'WHATSAPP':
            if (contato.telefone) {
              await notificationService.enviarWhatsApp({
                telefone: contato.telefone,
                mensagem: data.mensagem,
                metadata: data.metadata,
              });
              results.sucesso.push({ canal: 'WHATSAPP', status: 'enviado' });
            } else {
              results.falhas.push({ canal: 'WHATSAPP', erro: 'Telefone não cadastrado' });
            }
            break;

          case 'SMS':
            if (contato.telefone) {
              await notificationService.enviarSMS({
                telefone: contato.telefone,
                mensagem: data.mensagem.substring(0, 160), // Limita SMS a 160 caracteres
              });
              results.sucesso.push({ canal: 'SMS', status: 'enviado' });
            } else {
              results.falhas.push({ canal: 'SMS', erro: 'Telefone não cadastrado' });
            }
            break;

          case 'EMAIL':
            if (contato.email) {
              await notificationService.enviarEmail({
                email: contato.email,
                assunto: data.titulo,
                corpo: data.mensagem,
                metadata: data.metadata,
              });
              results.sucesso.push({ canal: 'EMAIL', status: 'enviado' });
            } else {
              results.falhas.push({ canal: 'EMAIL', erro: 'E-mail não cadastrado' });
            }
            break;
        }

        processados++;
        const progress = 30 + (processados / totalCanais) * 60;
        await job.progress(Math.round(progress));
        
      } catch (error: any) {
        console.error(`❌ Erro ao enviar ${canal}:`, error.message);
        results.falhas.push({ 
          canal, 
          erro: error.message,
        });
      }
    }

    await job.progress(100);

    // Se pelo menos um canal foi enviado com sucesso, considera job OK
    if (results.sucesso.length > 0) {
      console.log(`✅ Notificação ${job.id} enviada:`, results);
      return results;
    } else {
      throw new Error(`Nenhum canal de notificação funcionou: ${JSON.stringify(results.falhas)}`);
    }
    
  } catch (error: any) {
    console.error(`❌ Erro ao processar notificação ${job.id}:`, error.message);
    
    // Se é um erro recuperável, lança para retry
    if (error.message.includes('timeout') || error.message.includes('conexão')) {
      throw error; // Bull fará retry automaticamente
    }
    
    // Erros não recuperáveis
    results.falhas.push({ erro: error.message });
    return results;
  }
}

/**
 * Busca informações de contato do destinatário
 */
async function buscarContatoDestinatario(id: string, tipo: string) {
  const { prisma } = await import('../lib/prisma');
  
  try {
    switch (tipo) {
      case 'ALUNO':
        const aluno = await prisma.alunos.findUnique({
          where: { id },
          select: {
            email: true,
            telefone: true,
            telefoneResp: true,
          },
        });
        return aluno ? {
          email: aluno.email,
          telefone: aluno.telefoneResp || aluno.telefone, // Prioriza telefone responsável
        } : null;

      case 'RESPONSAVEL':
        // Se for responsável, busca pelo aluno
        const alunoResp = await prisma.alunos.findFirst({
          where: { responsavel: id }, // Assumindo que responsavel é identificador
          select: {
            telefoneResp: true,
            email: true,
          },
        });
        return alunoResp ? {
          telefone: alunoResp.telefoneResp,
          email: alunoResp.email,
        } : null;

      case 'PROFESSOR':
        const professor = await prisma.professores.findUnique({
          where: { id },
          select: {
            email: true,
            telefone: true,
          },
        });
        return professor;

      case 'FUNCIONARIO':
        const funcionario = await prisma.funcionarios.findUnique({
          where: { id },
          select: {
            email: true,
            telefone: true,
          },
        });
        return funcionario;

      default:
        return null;
    }
  } catch (error) {
    console.error('❌ Erro ao buscar contato:', error);
    return null;
  }
}

/**
 * Exporta a função processadora para ser usada pela fila
 */
export { processNotification };

console.log('🚀 Notification Worker pronto para ser registrado');

