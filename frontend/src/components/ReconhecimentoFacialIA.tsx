import { useState, useRef, useEffect } from 'react';
import { loadFaceApi } from '../utils/faceApiLoader';
import { api } from '../lib/api';
import './ReconhecimentoFacialIA.css';

interface ReconhecimentoFacialIAProps {
  onReconhecimentoSucesso?: (pessoaId: string, tipoPessoa: string, nome: string, confianca: number, foto: string) => void;
  onErro?: (erro: string) => void;
  autoStart?: boolean;
}

interface DeteccaoAtual {
  pessoaId: string;
  nome: string;
  tipoPessoa: string;
  confianca: number;
  expressoes: any;
  qualidadeDeteccao: number;
  vivacidade: number;
}

export default function ReconhecimentoFacialIA({ 
  onReconhecimentoSucesso, 
  onErro,
  autoStart = true 
}: ReconhecimentoFacialIAProps = {}) {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [deteccaoAtual, setDeteccaoAtual] = useState<DeteccaoAtual | null>(null);
  const [multiDeteccoes, setMultiDeteccoes] = useState<DeteccaoAtual[]>([]);
  const [_processando, setProcessando] = useState(false);
  const [status, setStatus] = useState('Inicializando...');
  const [_calibrando, _setCalibrando] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionInterval = useRef<any>(null);
  const faceapiRef = useRef<typeof import('face-api.js') | null>(null);
  const labeledDescriptors = useRef<any[]>([]);
  const deteccaoConsecutiva = useRef<Map<string, number>>(new Map());
  const historicoConfianca = useRef<Map<string, number[]>>(new Map());
  const isProcessingRef = useRef<boolean>(false);

  useEffect(() => {
    carregarModelos();
    return () => {
      pararCamera();
    };
  }, []);

  useEffect(() => {
    if (modelsLoaded && autoStart) {
      iniciarReconhecimento();
    }
  }, [modelsLoaded, autoStart]);

  const carregarModelos = async () => {
    try {
      setStatus('📦 Carregando modelos de IA...');
      
      // Carregar face-api dinamicamente
      const faceapi = await loadFaceApi();
      faceapiRef.current = faceapi;
      
      const MODEL_URL = '/models';
      
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]);

      setModelsLoaded(true);
      setStatus('✅ IA pronta para reconhecimento');
      
      await carregarDescritoresCadastrados();
    } catch (error) {
      console.error('❌ Erro ao carregar modelos:', error);
      setStatus('❌ Erro ao carregar IA');
      onErro?.('Erro ao carregar modelos de IA');
    }
  };

  const carregarDescritoresCadastrados = async () => {
    try {
      if (!faceapiRef.current) return;
      const faceapi = faceapiRef.current;
      
      setStatus('📥 Carregando perfis cadastrados...');
      const response = await api.get('/reconhecimento-facial/api/descritores');
      const cadastros = response.data;

      if (cadastros.length === 0) {
        setStatus('⚠️ Nenhum perfil cadastrado');
        console.log('⚠️ Sistema funcionará em modo de calibração automática');
        return;
      }

      const labeled: any[] = [];

      for (const cadastro of cadastros) {
        const descritores = JSON.parse(cadastro.descritores);
        const descriptors = descritores.map((d: number[]) => new Float32Array(d));
        
        const labeledDescriptor = new faceapi.LabeledFaceDescriptors(
          `${cadastro.pessoaId}|${cadastro.tipoPessoa}|${cadastro.nome}`,
          descriptors
        );
        labeled.push(labeledDescriptor);
      }

      labeledDescriptors.current = labeled;
      console.log(`✅ ${labeled.length} perfil(is) carregado(s)`);
      setStatus(`✅ ${labeled.length} perfil(is) pronto(s)`);
    } catch (error) {
      console.error('❌ Erro ao carregar descritores:', error);
      setStatus('⚠️ Funcionando em modo calibração');
    }
  };

  const iniciarReconhecimento = async () => {
    if (!modelsLoaded) {
      onErro?.('Modelos de IA não carregados');
      return;
    }

    try {
      setStatus('📹 Iniciando câmera...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: 'user',
          frameRate: { ideal: 30, max: 30 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraAtiva(true);
        setStatus('👤 Aguardando detecção...');
        
        videoRef.current.onloadedmetadata = () => {
          console.log('✅ Câmera pronta, iniciando reconhecimento contínuo');
          iniciarDeteccaoInteligente();
        };
      }
    } catch (error) {
      console.error('❌ Erro ao acessar câmera:', error);
      setStatus('❌ Erro na câmera');
      onErro?.('Não foi possível acessar a câmera');
    }
  };

  const iniciarDeteccaoInteligente = () => {
    if (!faceapiRef.current) {
      console.error('face-api não carregado');
      return;
    }
    const faceapi = faceapiRef.current;
    
    setProcessando(true);

    const faceMatcher = labeledDescriptors.current.length > 0 
      ? new faceapi.FaceMatcher(labeledDescriptors.current, 0.55) 
      : null;
    
    console.log(`🔍 Modo: ${faceMatcher ? 'Reconhecimento' : 'Calibração Automática'}`);
    setStatus(faceMatcher ? '🔍 Escaneando rostos...' : '🔧 Modo calibração ativo');
    
    detectionInterval.current = setInterval(async () => {
      // Evitar processamento simultâneo
      if (isProcessingRef.current) {
        return;
      }

      if (videoRef.current && canvasRef.current && modelsLoaded) {
        try {
          isProcessingRef.current = true;

          // Verificar se o vídeo está pronto
          if (!videoRef.current.videoWidth || !videoRef.current.videoHeight) {
            isProcessingRef.current = false;
            return;
          }

          // Verificar se há processamento em andamento (evita sobrecarga)
          if (videoRef.current.paused || videoRef.current.ended) {
            isProcessingRef.current = false;
            return;
          }

          // Detectar rostos com landmarks, descritores e expressões
          const detections = await faceapi
            .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions({
              inputSize: CONFIG.DETECTOR.inputSize,
              scoreThreshold: CONFIG.DETECTOR.scoreThreshold
            }))
            .withFaceLandmarks()
            .withFaceDescriptors()
            .withFaceExpressions();

          const displaySize = {
            width: videoRef.current.videoWidth,
            height: videoRef.current.videoHeight
          };

          if (canvasRef.current) {
            canvasRef.current.width = displaySize.width;
            canvasRef.current.height = displaySize.height;

            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              
              if (detections.length > 0) {
                const deteccoesProcessadas: DeteccaoAtual[] = [];

                for (let i = 0; i < resizedDetections.length; i++) {
                  const detection = resizedDetections[i];
                  const expressions = detection.expressions;
                  const descriptor = detection.descriptor;
                  
                  // Calcular qualidade da detecção
                  const qualidadeDeteccao = detection.detection.score * 100;
                  
                  // Analisar vivacidade (detecção de rosto real vs foto)
                  const vivacidade = calcularVivacidade(expressions);
                  
                  let pessoaInfo: DeteccaoAtual | null = null;

                  if (faceMatcher) {
                    // Modo reconhecimento
                    const bestMatch = faceMatcher.findBestMatch(descriptor);
                    
                    if (bestMatch.label !== 'unknown') {
                      const [pessoaId, tipoPessoa, nome] = bestMatch.label.split('|');
                      const distancia = bestMatch.distance;
                      const confiancaAtual = Math.round((1 - distancia) * 100);

                      // Adicionar ao histórico para suavizar confiança
                      const historico = historicoConfianca.current.get(pessoaId) || [];
                      historico.push(confiancaAtual);
                      if (historico.length > 5) historico.shift();
                      historicoConfianca.current.set(pessoaId, historico);

                      const confiancaMedia = Math.round(
                        historico.reduce((a, b) => a + b, 0) / historico.length
                      );

                      pessoaInfo = {
                        pessoaId,
                        nome,
                        tipoPessoa,
                        confianca: confiancaMedia,
                        expressoes: expressions,
                        qualidadeDeteccao,
                        vivacidade
                      };

                      // Contabilizar detecções consecutivas
                      const consecutivas = (deteccaoConsecutiva.current.get(pessoaId) || 0) + 1;
                      deteccaoConsecutiva.current.set(pessoaId, consecutivas);

                      // Desenhar box verde se reconhecido com alta confiança
                      const cor = confiancaMedia > 65 ? '#10b981' : confiancaMedia > 50 ? '#f59e0b' : '#ef4444';
                      const label = `${nome}\n${confiancaMedia}% | Q:${Math.round(qualidadeDeteccao)}% | V:${Math.round(vivacidade)}%`;
                      
                      desenharDeteccao(ctx, detection.detection.box, label, cor);

                      // Auto-confirmar se alta confiança + boa qualidade + vivacidade alta
                      if (confiancaMedia > 65 && qualidadeDeteccao > 60 && vivacidade > 50 && consecutivas >= 3) {
                        console.log(`🎉 Reconhecimento confirmado: ${nome} (${consecutivas} frames consecutivos)`);
                        setStatus(`✅ ${nome} reconhecido!`);
                        capturarFotoEConfirmar(pessoaInfo);
                        return;
                      }

                      deteccoesProcessadas.push(pessoaInfo);
                    } else {
                      // Desconhecido
                      desenharDeteccao(ctx, detection.detection.box, '❌ Não cadastrado', '#ef4444');
                    }
                  } else {
                    // Modo calibração - apenas detecta sem reconhecer
                    desenharDeteccao(ctx, detection.detection.box, 
                      `🔧 Detectado\nQ:${Math.round(qualidadeDeteccao)}% | V:${Math.round(vivacidade)}%`, 
                      '#3b82f6'
                    );
                  }

                  // Desenhar landmarks
                  faceapi.draw.drawFaceLandmarks(canvas, [detection]);
                }

                // Atualizar estados
                if (deteccoesProcessadas.length > 0) {
                  setDeteccaoAtual(deteccoesProcessadas[0]);
                  setMultiDeteccoes(deteccoesProcessadas);
                  
                  if (deteccoesProcessadas.length === 1) {
                    const det = deteccoesProcessadas[0];
                    setStatus(`🎯 ${det.nome} | ${det.confianca}%`);
                  } else {
                    setStatus(`👥 ${deteccoesProcessadas.length} pessoas detectadas`);
                  }
                } else {
                  setDeteccaoAtual(null);
                  setMultiDeteccoes([]);
                }
              } else {
                // Nenhum rosto detectado
                setDeteccaoAtual(null);
                setMultiDeteccoes([]);
                setStatus('👤 Aguardando rosto...');
                deteccaoConsecutiva.current.clear();
                historicoConfianca.current.clear();
              }
            }
          }
        } catch (error) {
          console.error('Erro na detecção:', error);
        } finally {
          isProcessingRef.current = false;
        }
      }
    }, CONFIG.DETECTION_INTERVAL);
  };

  const calcularVivacidade = (expressions: any): number => {
    // Análise de vivacidade baseada em expressões
    // Fotos geralmente têm expressão neutra congelada
    // Pessoas reais têm micro-expressões
    
    const valores = Object.values(expressions) as number[];
    // const soma = valores.reduce((a: number, b: number) => a + b, 0);
    const variacao = Math.max(...valores) - Math.min(...valores);
    
    // Quanto maior a variação, mais provável ser pessoa real
    const scoreVariacao = variacao * 100;
    
    // Detectar se há alguma expressão além de neutra
    const temExpressao = expressions.neutral < 0.8;
    const bonusExpressao = temExpressao ? 20 : 0;
    
    return Math.min(100, scoreVariacao + bonusExpressao);
  };

  const desenharDeteccao = (ctx: CanvasRenderingContext2D, box: any, label: string, cor: string) => {
    const { x, y, width, height } = box;
    
    // Desenhar retângulo
    ctx.strokeStyle = cor;
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, width, height);
    
    // Desenhar cantos arredondados (UI moderna)
    const cornerSize = 15;
    ctx.fillStyle = cor;
    
    // Canto superior esquerdo
    ctx.fillRect(x, y, cornerSize, 3);
    ctx.fillRect(x, y, 3, cornerSize);
    
    // Canto superior direito
    ctx.fillRect(x + width - cornerSize, y, cornerSize, 3);
    ctx.fillRect(x + width - 3, y, 3, cornerSize);
    
    // Canto inferior esquerdo
    ctx.fillRect(x, y + height - 3, cornerSize, 3);
    ctx.fillRect(x, y + height - cornerSize, 3, cornerSize);
    
    // Canto inferior direito
    ctx.fillRect(x + width - cornerSize, y + height - 3, cornerSize, 3);
    ctx.fillRect(x + width - 3, y + height - cornerSize, 3, cornerSize);
    
    // Desenhar label com fundo
    const lines = label.split('\n');
    const lineHeight = 24;
    const padding = 8;
    const labelWidth = Math.max(...lines.map(l => ctx.measureText(l).width)) + padding * 2;
    const labelHeight = lines.length * lineHeight + padding * 2;
    
    ctx.fillStyle = cor;
    ctx.fillRect(x, y - labelHeight - 5, labelWidth, labelHeight);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Inter, sans-serif';
    lines.forEach((line, i) => {
      ctx.fillText(line, x + padding, y - labelHeight - 5 + padding + (i + 1) * lineHeight - 5);
    });
  };

  const capturarFotoEConfirmar = async (deteccao: DeteccaoAtual) => {
    if (!videoRef.current || !canvasRef.current) return;

    // Parar detecção temporariamente
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
    }

    // Capturar frame atual
    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const fotoDataUrl = canvas.toDataURL('image/jpeg', 0.9);

      console.log('📸 Foto capturada, chamando callback...', {
        pessoaId: deteccao.pessoaId,
        nome: deteccao.nome,
        confianca: deteccao.confianca,
        temCallback: !!onReconhecimentoSucesso
      });

      // Se houver callback, chamar
      if (onReconhecimentoSucesso) {
        try {
          await onReconhecimentoSucesso(
            deteccao.pessoaId,
            deteccao.tipoPessoa,
            deteccao.nome,
            deteccao.confianca,
            fotoDataUrl
          );
          console.log('✅ Callback executado com sucesso');
          
          // Reiniciar detecção após 2 segundos
          setTimeout(() => {
            console.log('🔄 Reiniciando detecção...');
            setDeteccaoAtual(null);
            iniciarDeteccaoInteligente();
          }, 2000);
        } catch (error) {
          console.error('❌ Erro no callback:', error);
          setStatus(`❌ Erro ao registrar ponto`);
          // Reiniciar detecção mesmo com erro
          setTimeout(() => {
            setDeteccaoAtual(null);
            iniciarDeteccaoInteligente();
          }, 3000);
        }
      } else {
        // Modo standalone: registrar ponto diretamente
        registrarPontoAutomatico(deteccao, fotoDataUrl);
      }

      setStatus(`✅ ${deteccao.nome} confirmado!`);
      
      // Opcional: parar câmera após confirmar
      // pararCamera();
    }
  };

  const registrarPontoAutomatico = async (deteccao: DeteccaoAtual, foto: string) => {
    try {
      setStatus('Registrando ponto...');

      // Criar FormData com foto
      const blob = await fetch(foto).then(r => r.blob());
      const formData = new FormData();
      formData.append('foto', blob, 'registro-ia.jpg');
      formData.append('pessoaId', deteccao.pessoaId);
      formData.append('tipoPessoa', deteccao.tipoPessoa);
      formData.append('tipoRegistro', 'ENTRADA');
      formData.append('observacao', `Reconhecimento automático IA - ${deteccao.confianca}% confiança`);
      formData.append('reconhecimentoIA', 'true');
      formData.append('confianca', deteccao.confianca.toString());

      await api.post('/ponto', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setStatus(`✅ Ponto de ${deteccao.nome} registrado com sucesso!`);
      
      // Limpar após alguns segundos
      setTimeout(() => {
        setDeteccaoAtual(null);
        setStatus('🔍 Pronto para novo reconhecimento');
      }, 3000);
    } catch (error: any) {
      console.error('Erro ao registrar ponto:', error);
      setStatus(`❌ Erro ao registrar: ${error.response?.data?.message || 'Erro desconhecido'}`);
      onErro?.(error.response?.data?.message || 'Erro ao registrar ponto');
    }
  };

  const confirmarDeteccaoManual = () => {
    if (deteccaoAtual && deteccaoAtual.confianca > 60) {
      capturarFotoEConfirmar(deteccaoAtual);
    }
  };

  const pararCamera = () => {
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraAtiva(false);
    setProcessando(false);
    setDeteccaoAtual(null);
    setMultiDeteccoes([]);
    deteccaoConsecutiva.current.clear();
    historicoConfianca.current.clear();
  };

  return (
    <div className="reconhecimento-facial-ia">
      <div className="video-container">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`video-feed ${cameraAtiva ? 'active' : ''}`}
        />
        <canvas
          ref={canvasRef}
          className="detection-overlay"
        />
        
        <div className="status-overlay">
          <div className={`status-badge ${deteccaoAtual ? 'detected' : ''}`}>
            {status}
          </div>
        </div>

        {deteccaoAtual && (
          <div className="info-overlay">
            <div className="person-info">
              <h3>{deteccaoAtual.nome}</h3>
              <div className="metrics">
                <div className="metric">
                  <span className="label">Confiança</span>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill confidence" 
                      style={{ width: `${deteccaoAtual.confianca}%` }}
                    />
                  </div>
                  <span className="value">{deteccaoAtual.confianca}%</span>
                </div>
                <div className="metric">
                  <span className="label">Qualidade</span>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill quality" 
                      style={{ width: `${deteccaoAtual.qualidadeDeteccao}%` }}
                    />
                  </div>
                  <span className="value">{Math.round(deteccaoAtual.qualidadeDeteccao)}%</span>
                </div>
                <div className="metric">
                  <span className="label">Vivacidade</span>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill liveness" 
                      style={{ width: `${deteccaoAtual.vivacidade}%` }}
                    />
                  </div>
                  <span className="value">{Math.round(deteccaoAtual.vivacidade)}%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="controls">
        {!cameraAtiva ? (
          <button 
            onClick={iniciarReconhecimento}
            className="btn-primary"
            disabled={!modelsLoaded}
          >
            🎥 Iniciar Reconhecimento
          </button>
        ) : (
          <>
            <button 
              onClick={confirmarDeteccaoManual}
              className="btn-success"
              disabled={!deteccaoAtual || deteccaoAtual.confianca < 60}
            >
              ✅ Confirmar e Registrar
            </button>
            <button 
              onClick={pararCamera}
              className="btn-danger"
            >
              ⏹️ Parar
            </button>
          </>
        )}
      </div>

      {multiDeteccoes.length > 1 && (
        <div className="multi-detections">
          <h4>Pessoas Detectadas:</h4>
          {multiDeteccoes.map((det, i) => (
            <div key={i} className="detection-item" onClick={() => capturarFotoEConfirmar(det)}>
              <span>{det.nome}</span>
              <span className="confidence">{det.confianca}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
