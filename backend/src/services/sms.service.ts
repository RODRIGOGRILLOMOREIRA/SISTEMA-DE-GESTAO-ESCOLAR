/**
 * Serviço de Envio de SMS
 * Suporta Twilio e AWS SNS
 */

import axios from 'axios';

export interface SMSMessage {
  to: string; // Número com código do país: +5511999999999
  message: string;
}

class SMSService {
  private provider: 'twilio' | 'aws' | 'disabled';
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor() {
    this.provider = (process.env.SMS_PROVIDER as any) || 'disabled';
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.fromNumber = process.env.SMS_FROM_NUMBER || '';

    if (this.provider !== 'disabled') {
      console.log(`📧 SMS Service inicializado: Provider ${this.provider}`);
    }
  }

  /**
   * Enviar SMS
   */
  async enviarSMS(dados: SMSMessage): Promise<boolean> {
    if (this.provider === 'disabled') {
      console.log('📧 [SIMULAÇÃO] SMS:', dados.to, '-', dados.message.substring(0, 50));
      return true;
    }

    try {
      if (this.provider === 'twilio') {
        return await this.enviarViaTwilio(dados);
      } else if (this.provider === 'aws') {
        return await this.enviarViaAWS(dados);
      }
      return false;
    } catch (error: any) {
      console.error('❌ Erro ao enviar SMS:', error.message);
      return false;
    }
  }

  /**
   * Enviar via Twilio
   */
  private async enviarViaTwilio(dados: SMSMessage): Promise<boolean> {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
    
    const params = new URLSearchParams();
    params.append('From', this.fromNumber);
    params.append('To', this.formatarNumero(dados.to));
    params.append('Body', this.truncarMensagem(dados.message));

    const response = await axios.post(url, params, {
      auth: {
        username: this.accountSid,
        password: this.authToken
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log('✅ SMS enviado via Twilio:', dados.to);
    return response.status === 201;
  }

  /**
   * Enviar via AWS SNS
   */
  private async enviarViaAWS(dados: SMSMessage): Promise<boolean> {
    // TODO: Implementar AWS SNS quando necessário
    console.log('⚠️ AWS SNS ainda não implementado');
    return false;
  }

  /**
   * Formatar número para padrão internacional
   */
  private formatarNumero(numero: string): string {
    let limpo = numero.replace(/\D/g, '');
    
    if (!limpo.startsWith('+')) {
      if (!limpo.startsWith('55')) {
        limpo = '+55' + limpo;
      } else {
        limpo = '+' + limpo;
      }
    }
    
    return limpo;
  }

  /**
   * Truncar mensagem para limite de 160 caracteres do SMS
   */
  private truncarMensagem(mensagem: string): string {
    const limite = 160;
    if (mensagem.length <= limite) {
      return mensagem;
    }
    return mensagem.substring(0, limite - 3) + '...';
  }

  /**
   * Verificar se serviço está ativo
   */
  isAtivo(): boolean {
    return this.provider !== 'disabled';
  }
}

// Singleton
export const smsService = new SMSService();
export default smsService;
