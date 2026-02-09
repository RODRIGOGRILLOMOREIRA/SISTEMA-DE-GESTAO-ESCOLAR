/**
 * Serviço de IA para Reconhecimento Facial Avançado
 * Fornece análise de vivacidade, qualidade de detecção e anti-spoofing
 */

interface AnaliseVivacidade {
  score: number;
  confiavel: boolean;
  motivo: string;
}

interface QualidadeDeteccao {
  score: number;
  adequada: boolean;
  sugestoes: string[];
}

export class ReconhecimentoFacialService {
  
  /**
   * Analisa se a detecção é de uma pessoa real (anti-spoofing)
   */
  static analisarVivacidade(expressoes: any): AnaliseVivacidade {
    // Verificar se há variação nas expressões (sinal de pessoa real)
    const valores = Object.values(expressoes) as number[];
    const soma = valores.reduce((a: number, b: number) => a + b, 0);
    const variacao = Math.max(...valores) - Math.min(...valores);
    
    // Fotos geralmente têm expressão neutra congelada
    const neutral = expressoes.neutral || 0;
    const temExpressao = neutral < 0.85;
    
    let score = 0;
    let motivo = '';
    
    if (variacao > 0.3) {
      score += 40;
      motivo += 'Boa variação de expressões. ';
    } else if (variacao > 0.15) {
      score += 20;
      motivo += 'Variação moderada. ';
    } else {
      motivo += 'Expressão congelada (possível foto). ';
    }
    
    if (temExpressao) {
      score += 30;
      motivo += 'Expressões detectadas. ';
    } else {
      motivo += 'Apenas expressão neutra. ';
    }
    
    // Analisar se há alguma emoção dominante
    const emocaoDominante = Object.entries(expressoes)
      .filter(([key]) => key !== 'neutral')
      .sort((a, b) => (b[1] as number) - (a[1] as number))[0] as [string, number] | undefined;
    
    if (emocaoDominante && emocaoDominante[1] > 0.2) {
      score += 30;
      motivo += `Emoção ${emocaoDominante[0]} detectada. `;
    }
    
    return {
      score: Math.min(100, score),
      confiavel: score >= 60,
      motivo: motivo.trim()
    };
  }
  
  /**
   * Avalia a qualidade da detecção facial
   */
  static avaliarQualidadeDeteccao(
    detectionScore: number,
    larguraBox: number,
    alturaBox: number,
    larguraImagem: number,
    alturaImagem: number
  ): QualidadeDeteccao {
    const sugestoes: string[] = [];
    let score = 0;
    
    // Score de detecção (0-100)
    score += detectionScore * 30;
    
    // Tamanho do rosto em relação à imagem
    const proporcaoLargura = larguraBox / larguraImagem;
    const proporcaoAltura = alturaBox / alturaImagem;
    
    if (proporcaoLargura >= 0.2 && proporcaoLargura <= 0.6 && 
        proporcaoAltura >= 0.3 && proporcaoAltura <= 0.8) {
      score += 40;
    } else if (proporcaoLargura < 0.15 || proporcaoAltura < 0.2) {
      sugestoes.push('Aproxime-se mais da câmera');
      score += 10;
    } else if (proporcaoLargura > 0.7 || proporcaoAltura > 0.85) {
      sugestoes.push('Afaste-se um pouco da câmera');
      score += 20;
    } else {
      score += 25;
    }
    
    // Proporção do rosto (deve ser aproximadamente retangular)
    const proporcaoRosto = larguraBox / alturaBox;
    if (proporcaoRosto >= 0.65 && proporcaoRosto <= 0.85) {
      score += 30;
    } else {
      sugestoes.push('Centralize seu rosto');
      score += 15;
    }
    
    if (detectionScore < 0.7) {
      sugestoes.push('Melhore a iluminação');
    }
    
    if (sugestoes.length === 0) {
      sugestoes.push('Detecção perfeita!');
    }
    
    return {
      score: Math.min(100, score),
      adequada: score >= 70,
      sugestoes
    };
  }
  
  /**
   * Valida se os descritores faciais são adequados para cadastro
   */
  static validarDescritoresCadastro(descritores: Float32Array[]): {
    valido: boolean;
    mensagem: string;
  } {
    if (descritores.length < 3) {
      return {
        valido: false,
        mensagem: 'São necessários pelo menos 3 descritores diferentes'
      };
    }
    
    // Verificar variação entre descritores (não devem ser idênticos)
    const primeiroDescritor = descritores[0];
    let totalVariacao = 0;
    
    for (let i = 1; i < descritores.length; i++) {
      const diferenca = this.calcularDistanciaEuclidiana(primeiroDescritor, descritores[i]);
      totalVariacao += diferenca;
    }
    
    const variacaoMedia = totalVariacao / (descritores.length - 1);
    
    if (variacaoMedia < 0.1) {
      return {
        valido: false,
        mensagem: 'Descritores muito similares. Capture fotos com diferentes ângulos e expressões'
      };
    }
    
    if (variacaoMedia > 0.8) {
      return {
        valido: false,
        mensagem: 'Descritores muito diferentes. Verifique se todas as fotos são da mesma pessoa'
      };
    }
    
    return {
      valido: true,
      mensagem: 'Descritores válidos e adequados para cadastro'
    };
  }
  
  /**
   * Calcula distância euclidiana entre dois descritores
   */
  static calcularDistanciaEuclidiana(desc1: Float32Array, desc2: Float32Array): number {
    let soma = 0;
    for (let i = 0; i < desc1.length; i++) {
      const diff = desc1[i] - desc2[i];
      soma += diff * diff;
    }
    return Math.sqrt(soma);
  }
  
  /**
   * Suaviza confiança usando média móvel
   */
  static suavizarConfianca(historico: number[], novoValor: number): number {
    const historicoAtualizado = [...historico, novoValor];
    
    // Manter apenas últimos 5 valores
    if (historicoAtualizado.length > 5) {
      historicoAtualizado.shift();
    }
    
    // Média ponderada (valores mais recentes têm maior peso)
    let soma = 0;
    let pesoTotal = 0;
    
    for (let i = 0; i < historicoAtualizado.length; i++) {
      const peso = i + 1; // Peso crescente
      soma += historicoAtualizado[i] * peso;
      pesoTotal += peso;
    }
    
    return Math.round(soma / pesoTotal);
  }
  
  /**
   * Determina se reconhecimento pode ser auto-confirmado
   */
  static podeAutoConfirmar(
    confianca: number,
    qualidade: number,
    vivacidade: number,
    framesConsecutivos: number
  ): boolean {
    return (
      confianca >= 80 &&
      qualidade >= 75 &&
      vivacidade >= 65 &&
      framesConsecutivos >= 5
    );
  }
  
  /**
   * Gera hash de descritor para comparação rápida
   */
  static gerarHashDescritor(descritor: Float32Array): string {
    // Simplificar descritor em hash para busca rápida
    const pontos = [];
    for (let i = 0; i < descritor.length; i += 16) {
      pontos.push(Math.round(descritor[i] * 1000) / 1000);
    }
    return pontos.join(',');
  }
  
  /**
   * Calcula score de similaridade entre dois descritores (0-100)
   */
  static calcularSimilaridade(desc1: Float32Array, desc2: Float32Array): number {
    const distancia = this.calcularDistanciaEuclidiana(desc1, desc2);
    // Converter distância em score de similaridade
    const similaridade = Math.max(0, 100 - (distancia * 100));
    return Math.round(similaridade);
  }
}

export default ReconhecimentoFacialService;
