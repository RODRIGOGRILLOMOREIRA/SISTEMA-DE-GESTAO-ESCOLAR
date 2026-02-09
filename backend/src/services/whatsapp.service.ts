/**
 * Serviço de Integração WhatsApp Business API
 * Suporta Meta Business API e Twilio
 */

import axios from 'axios';

export interface WhatsAppMessage {
  to: string; // Número com código do país: +5511999999999
  message: string;
  buttons?: Array<{ id: string; title: string }>;
  imageUrl?: string;
}

class WhatsAppService {
  private provider: 'meta' | 'twilio' | 'disabled';
  private apiKey: string;
  private phoneNumberId: string; // Para Meta
  private accountSid: string; // Para Twilio
  private authToken: string; // Para Twilio
  private fromNumber: string; // Número do WhatsApp Business

  constructor() {
    this.provider = (process.env.WHATSAPP_PROVIDER as any) || 'disabled';
    this.apiKey = process.env.WHATSAPP_API_KEY || '';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.fromNumber = process.env.WHATSAPP_FROM_NUMBER || '';

    if (this.provider !== 'disabled') {
      console.log(`📱 WhatsApp Service inicializado: Provider ${this.provider}`);
    }
  }

  /**
   * Enviar mensagem via WhatsApp
   */
  async enviarMensagem(dados: WhatsAppMessage): Promise<boolean> {
    if (this.provider === 'disabled') {
      console.log('📱 [SIMULAÇÃO] WhatsApp:', dados.to, '-', dados.message.substring(0, 50));
      return true;
    }

    try {
      if (this.provider === 'meta') {
        return await this.enviarViaMeta(dados);
      } else if (this.provider === 'twilio') {
        return await this.enviarViaTwilio(dados);
      }
      return false;
    } catch (error: any) {
      console.error('❌ Erro ao enviar WhatsApp:', error.message);
      return false;
    }
  }

  /**
   * Enviar via Meta Business API
   */
  private async enviarViaMeta(dados: WhatsAppMessage): Promise<boolean> {
    const url = `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`;
    
    const payload: any = {
      messaging_product: 'whatsapp',
      to: this.formatarNumero(dados.to),
      type: 'text',
      text: {
        body: dados.message
      }
    };

    // Se tiver botões, muda para tipo interactive
    if (dados.buttons && dados.buttons.length > 0) {
      payload.type = 'interactive';
      payload.interactive = {
        type: 'button',
        body: {
          text: dados.message
        },
        action: {
          buttons: dados.buttons.map(btn => ({
            type: 'reply',
            reply: {
              id: btn.id,
              title: btn.title
            }
          }))
        }
      };
      delete payload.text;
    }

    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ WhatsApp enviado via Meta:', dados.to);
    return response.status === 200;
  }

  /**
   * Enviar via Twilio
   */
  private async enviarViaTwilio(dados: WhatsAppMessage): Promise<boolean> {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
    
    const params = new URLSearchParams();
    params.append('From', `whatsapp:${this.fromNumber}`);
    params.append('To', `whatsapp:${this.formatarNumero(dados.to)}`);
    params.append('Body', dados.message);

    if (dados.imageUrl) {
      params.append('MediaUrl', dados.imageUrl);
    }

    const response = await axios.post(url, params, {
      auth: {
        username: this.accountSid,
        password: this.authToken
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log('✅ WhatsApp enviado via Twilio:', dados.to);
    return response.status === 201;
  }

  /**
   * Formatar número para padrão internacional
   */
  private formatarNumero(numero: string): string {
    // Remove caracteres não numéricos
    let limpo = numero.replace(/\D/g, '');
    
    // Se não começar com código do país, adiciona +55 (Brasil)
    if (!limpo.startsWith('55')) {
      limpo = '55' + limpo;
    }
    
    // Remove o + se existir
    limpo = limpo.replace('+', '');
    
    return limpo;
  }

  /**
   * Validar se número tem WhatsApp (apenas Meta API suporta)
   */
  async validarNumero(numero: string): Promise<boolean> {
    if (this.provider !== 'meta') {
      return true; // Assume que sim
    }

    try {
      const url = `https://graph.facebook.com/v18.0/${this.phoneNumberId}/contacts`;
      const response = await axios.post(
        url,
        {
          blocking: 'wait',
          contacts: [this.formatarNumero(numero)]
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.contacts && response.data.contacts.length > 0;
    } catch (error) {
      console.error('⚠️ Erro ao validar número WhatsApp:', error);
      return false;
    }
  }

  /**
   * Verificar se serviço está ativo
   */
  isAtivo(): boolean {
    return this.provider !== 'disabled';
  }
}

// Singleton
export const whatsappService = new WhatsAppService();
export default whatsappService;
