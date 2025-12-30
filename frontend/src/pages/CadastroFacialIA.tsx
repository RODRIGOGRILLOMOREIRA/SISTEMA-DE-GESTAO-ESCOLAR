import { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';
import { api } from '../lib/api';
import './CadastroFacialIA.css';

interface Pessoa {
  id: string;
  nome: string;
  tipo: 'PROFESSOR' | 'FUNCIONARIO' | 'EQUIPE_DIRETIVA';
}

interface CadastroExistente {
  pessoaId: string;
  tipoPessoa: string;
  cadastradoEm: string;
  atualizadoEm: string;
}

export default function CadastroFacialIA() {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [pessoaSelecionada, setPessoaSelecionada] = useState<Pessoa | null>(null);
  const [fotosCapturadas, setFotosCapturadas] = useState<string[]>([]);
  const [descritoresCapturados, setDescritoresCapturados] = useState<Float32Array[]>([]);
  const [status, setStatus] = useState('Carregando modelos de IA...');
  const [cadastrosExistentes, setCadastrosExistentes] = useState<CadastroExistente[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [apagando, setApagando] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<number | null>(null);

  // Carregar modelos face-api.js
  useEffect(() => {
    const carregarModelos = async () => {
      try {
        console.log('📦 Iniciando carregamento de modelos...');
        setStatus('📦 Carregando modelos de IA...');
        const MODEL_URL = '/models';
        
        console.log('📂 URL dos modelos:', MODEL_URL);
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);

        console.log('✅ Modelos carregados com sucesso!');
        setModelsLoaded(true);
        setStatus('✅ Modelos carregados! Selecione uma pessoa para cadastrar.');
      } catch (error) {
        console.error('❌ Erro ao carregar modelos:', error);
        setStatus('❌ Erro ao carregar modelos de IA. Verifique o console.');
      }
    };

    carregarModelos();
  }, []);

  // Buscar pessoas e cadastros existentes
  useEffect(() => {
    const buscarDados = async () => {
      try {
        // Buscar professores, funcionários e equipe diretiva
        const [professoresRes, funcionariosRes, equipeRes, cadastrosRes] = await Promise.all([
          api.get('/professores'),
          api.get('/funcionarios'),
          api.get('/equipe-diretiva'),
          api.get('/reconhecimento-facial')
        ]);

        const todasPessoas: Pessoa[] = [
          ...(professoresRes.data || []).map((p: any) => ({ id: p.id, nome: p.nome, tipo: 'PROFESSOR' as const })),
          ...(funcionariosRes.data || []).map((f: any) => ({ id: f.id, nome: f.nome, tipo: 'FUNCIONARIO' as const })),
          ...(equipeRes.data || []).map((e: any) => ({ id: e.id, nome: e.nome, tipo: 'EQUIPE_DIRETIVA' as const }))
        ];

        setPessoas(todasPessoas);
        setCadastrosExistentes(cadastrosRes.data || []);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };

    buscarDados();
  }, []);

  // Iniciar câmera
  const iniciarCamera = async () => {
    try {
      console.log('📹 Solicitando acesso à câmera...');
      setStatus('📹 Iniciando câmera...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });

      console.log('✅ Acesso à câmera concedido');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Aguardar vídeo estar pronto
        videoRef.current.onloadedmetadata = () => {
          console.log('✅ Metadados do vídeo carregados');
          if (videoRef.current) {
            videoRef.current.play().then(() => {
              console.log('✅ Vídeo está tocando');
              setCameraAtiva(true);
              setStatus('✅ Câmera ativa. Aguarde a detecção do rosto...');
              
              // Iniciar detecção contínua após vídeo carregar
              setTimeout(() => {
                console.log('🔍 Iniciando detecção facial...');
                iniciarDeteccaoContinua();
              }, 1000);
            }).catch(err => {
              console.error('❌ Erro ao reproduzir vídeo:', err);
              setStatus('❌ Erro ao iniciar vídeo');
            });
          }
        };
      }
    } catch (error) {
      console.error('❌ Erro ao acessar câmera:', error);
      setStatus('❌ Erro ao acessar câmera. Verifique as permissões.');
    }
  };

  // Parar câmera
  const pararCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    setCameraAtiva(false);
    setStatus('Câmera desativada');
  };

  // Detecção contínua para feedback visual
  const iniciarDeteccaoContinua = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }

    console.log('🔍 Loop de detecção iniciado');
    let frameCount = 0;

    detectionIntervalRef.current = window.setInterval(async () => {
      if (!videoRef.current || !canvasRef.current || !modelsLoaded) {
        console.log('⚠️ Requisitos não atendidos:', {
          video: !!videoRef.current,
          canvas: !!canvasRef.current,
          models: modelsLoaded
        });
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;

      frameCount++;
      if (frameCount % 10 === 0) {
        console.log(`🎬 Frame ${frameCount} - readyState: ${video.readyState} (4 = pronto)`);
      }

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        try {
          const detection = await faceapi
            .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({
              inputSize: 416,
              scoreThreshold: 0.5
            }))
            .withFaceLandmarks();

          if (detection) {
            if (frameCount % 10 === 0) {
              console.log('✅ Rosto detectado! Score:', detection.detection.score);
            }

            // Ajustar canvas ao vídeo
            const displaySize = { width: video.videoWidth, height: video.videoHeight };
            faceapi.matchDimensions(canvas, displaySize);

            // Redimensionar detecção
            const resizedDetection = faceapi.resizeResults(detection, displaySize);

            // Limpar canvas e desenhar
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              
              // Desenhar box verde ao redor do rosto
              faceapi.draw.drawDetections(canvas, [resizedDetection]);
              faceapi.draw.drawFaceLandmarks(canvas, [resizedDetection]);
              
              // Adicionar texto indicando que está pronto
              ctx.fillStyle = '#10b981';
              ctx.font = 'bold 20px Arial';
              ctx.fillText('✓ Rosto Detectado - Pronto!', 10, 30);
            }

            // Atualizar status apenas se mudou
            if (!status.includes('Rosto detectado')) {
              setStatus('✅ Rosto detectado! Clique em "Capturar Foto"');
            }
          } else {
            if (frameCount % 30 === 0) {
              console.log('⚠️ Nenhum rosto detectado neste frame');
            }
            // Limpar canvas se não houver detecção
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
          }
        } catch (error) {
          console.error('❌ Erro na detecção contínua:', error);
        }
      }
    }, 150);
  };

  // Capturar foto
  const capturarFoto = async () => {
    console.log('📸 Tentando capturar foto...');
    
    if (!videoRef.current || !canvasRef.current || !modelsLoaded) {
      console.error('❌ Requisitos não atendidos:', {
        video: !!videoRef.current,
        canvas: !!canvasRef.current,
        models: modelsLoaded
      });
      setStatus('❌ Aguarde o carregamento dos modelos');
      return;
    }

    const video = videoRef.current;

    console.log('📹 Estado do vídeo:', {
      readyState: video.readyState,
      width: video.videoWidth,
      height: video.videoHeight,
      paused: video.paused
    });

    // Verificar se o vídeo está pronto
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      console.warn('⏳ Vídeo ainda não está pronto');
      setStatus('⏳ Aguarde, vídeo carregando...');
      return;
    }

    try {
      setStatus('📸 Capturando foto e extraindo descritor...');
      console.log('🔍 Detectando rosto...');

      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({
          inputSize: 416,
          scoreThreshold: 0.5
        }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        console.error('❌ Nenhum rosto detectado na captura');
        setStatus('❌ Nenhum rosto detectado. Posicione-se melhor e tente novamente.');
        return;
      }

      console.log('✅ Rosto detectado na captura!', {
        score: detection.detection.score,
        box: detection.detection.box,
        descriptorLength: detection.descriptor.length
      });

      // Capturar imagem do canvas
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const fotoDataUrl = canvas.toDataURL('image/jpeg', 0.9);

        console.log('📷 Foto capturada, tamanho:', fotoDataUrl.length, 'bytes');

        // Adicionar foto e descritor
        setFotosCapturadas(prev => [...prev, fotoDataUrl]);
        setDescritoresCapturados(prev => [...prev, detection.descriptor]);

        const totalFotos = fotosCapturadas.length + 1;
        console.log(`✅ Total de fotos: ${totalFotos}`);
        setStatus(`✅ Foto ${totalFotos} capturada! ${totalFotos >= 3 ? 'Você já pode salvar.' : `Capture mais ${3 - totalFotos} foto(s).`}`);
      }
    } catch (error) {
      console.error('❌ Erro ao capturar foto:', error);
      setStatus('❌ Erro ao capturar foto. Tente novamente.');
    }
  };

  // Remover foto
  const removerFoto = (index: number) => {
    setFotosCapturadas(prev => prev.filter((_, i) => i !== index));
    setDescritoresCapturados(prev => prev.filter((_, i) => i !== index));
    setStatus(`Foto ${index + 1} removida. ${fotosCapturadas.length - 1} fotos restantes.`);
  };

  // Salvar cadastro
  const salvarCadastro = async () => {
    console.log('💾 Iniciando salvamento de cadastro...');
    
    if (!pessoaSelecionada) {
      console.error('❌ Nenhuma pessoa selecionada');
      setStatus('❌ Selecione uma pessoa');
      return;
    }

    if (fotosCapturadas.length < 3) {
      console.error('❌ Fotos insuficientes:', fotosCapturadas.length);
      setStatus('❌ São necessárias pelo menos 3 fotos');
      return;
    }

    console.log('📋 Dados para salvar:', {
      pessoaId: pessoaSelecionada.id,
      nome: pessoaSelecionada.nome,
      tipo: pessoaSelecionada.tipo,
      totalFotos: fotosCapturadas.length,
      totalDescritores: descritoresCapturados.length
    });

    try {
      setSalvando(true);
      setStatus('💾 Salvando cadastro...');

      // Converter fotos base64 para Blob
      console.log('🔄 Criando FormData...');
      const formData = new FormData();
      formData.append('pessoaId', pessoaSelecionada.id);
      formData.append('tipoPessoa', pessoaSelecionada.tipo);
      
      // Converter descritores para JSON
      console.log('🔄 Convertendo descritores...');
      const descritoresJson = JSON.stringify(
        descritoresCapturados.map(d => Array.from(d))
      );
      formData.append('descritores', descritoresJson);
      console.log('✅ Descritores convertidos, tamanho:', descritoresJson.length, 'caracteres');

      // Adicionar fotos
      console.log('🔄 Convertendo fotos para Blob...');
      for (let i = 0; i < fotosCapturadas.length; i++) {
        const blob = await fetch(fotosCapturadas[i]).then(r => r.blob());
        formData.append('fotos', blob, `foto-${i}.jpg`);
        console.log(`✅ Foto ${i + 1} adicionada:`, blob.size, 'bytes');
      }

      console.log('📤 Enviando para servidor...');
      console.log('📋 Conteúdo do FormData:', {
        pessoaId: pessoaSelecionada.id,
        tipoPessoa: pessoaSelecionada.tipo,
        totalFotos: fotosCapturadas.length,
        descritoresSize: descritoresJson.length
      });
      
      const response = await api.post('/reconhecimento-facial', formData);

      console.log('✅ Resposta do servidor:', response.data);
      setStatus(`✅ Cadastro de ${pessoaSelecionada.nome} salvo com sucesso!`);
      
      // Limpar
      setFotosCapturadas([]);
      setDescritoresCapturados([]);
      setPessoaSelecionada(null);
      pararCamera();

      // Atualizar lista de cadastros
      console.log('🔄 Atualizando lista de cadastros...');
      const cadastrosRes = await api.get('/reconhecimento-facial');
      setCadastrosExistentes(cadastrosRes.data || []);
      console.log('✅ Lista atualizada');
    } catch (error: any) {
      console.error('❌ Erro ao salvar cadastro:', error);
      console.error('❌ Detalhes do erro:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      const mensagemErro = error.response?.data?.message || error.message || 'Erro desconhecido';
      setStatus(`❌ Erro ao salvar: ${mensagemErro}`);
    } finally {
      setSalvando(false);
    }
  };

  // Verificar se pessoa já tem cadastro
  const temCadastro = (pessoaId: string) => {
    return cadastrosExistentes.some(c => c.pessoaId === pessoaId);
  };

  // Apagar cadastro existente
  const apagarCadastro = async (pessoaId: string) => {
    if (!confirm('Tem certeza que deseja apagar este cadastro? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      setApagando(true);
      setStatus('Apagando cadastro...');

      await api.delete(`/reconhecimento-facial/${pessoaId}`);

      setStatus(`✅ Cadastro apagado com sucesso!`);
      
      // Atualizar lista de cadastros
      const cadastrosRes = await api.get('/reconhecimento-facial');
      setCadastrosExistentes(cadastrosRes.data || []);
    } catch (error) {
      console.error('Erro ao apagar cadastro:', error);
      setStatus('❌ Erro ao apagar cadastro');
    } finally {
      setApagando(false);
    }
  };

  return (
    <div className="cadastro-facial-ia-container">
      <header className="cadastro-header">
        <h1>🤖 Cadastro Facial com IA</h1>
        <p>Sistema de reconhecimento facial para registro de ponto</p>
      </header>

      <div className="cadastro-content">
        {/* Seleção de pessoa */}
        <section className="selecao-pessoa">
          <h2>1. Selecione a Pessoa</h2>
          <select
            value={pessoaSelecionada?.id || ''}
            onChange={(e) => {
              const pessoa = pessoas.find(p => p.id === e.target.value);
              setPessoaSelecionada(pessoa || null);
              setFotosCapturadas([]);
              setDescritoresCapturados([]);
              pararCamera();
            }}
            disabled={cameraAtiva}
          >
            <option value="">Selecione...</option>
            {pessoas.map(p => (
              <option key={p.id} value={p.id}>
                {p.nome} ({p.tipo}) {temCadastro(p.id) ? '✅ Cadastrado' : ''}
              </option>
            ))}
          </select>
        </section>

        {/* Câmera */}
        {pessoaSelecionada && (
          <section className="camera-section">
            <h2>2. Capture as Fotos (mínimo 3)</h2>
            <div className="video-container">
              <video ref={videoRef} className="video-preview" />
              <canvas ref={canvasRef} className="canvas-overlay" />
            </div>

            <div className="camera-controls">
              {!cameraAtiva ? (
                <button onClick={iniciarCamera} className="btn-primary" disabled={!modelsLoaded}>
                  📷 Iniciar Câmera
                </button>
              ) : (
                <>
                  <button onClick={capturarFoto} className="btn-success">
                    📸 Capturar Foto ({fotosCapturadas.length}/5)
                  </button>
                  <button onClick={pararCamera} className="btn-secondary">
                    ⏹️ Parar Câmera
                  </button>
                </>
              )}
            </div>

            <div className="status-message">{status}</div>
          </section>
        )}

        {/* Fotos capturadas */}
        {fotosCapturadas.length > 0 && (
          <section className="fotos-capturadas">
            <h2>3. Fotos Capturadas ({fotosCapturadas.length})</h2>
            <div className="fotos-grid">
              {fotosCapturadas.map((foto, index) => (
                <div key={index} className="foto-item">
                  <img src={foto} alt={`Foto ${index + 1}`} />
                  <button onClick={() => removerFoto(index)} className="btn-remove">
                    ❌
                  </button>
                  <span className="foto-numero">Foto {index + 1}</span>
                </div>
              ))}
            </div>

            <button
              onClick={salvarCadastro}
              className="btn-save"
              disabled={fotosCapturadas.length < 3 || salvando}
            >
              {salvando ? '⏳ Salvando...' : '💾 Salvar Cadastro'}
            </button>
          </section>
        )}

        {/* Cadastros existentes */}
        <section className="cadastros-existentes">
          <h2>📋 Cadastros Existentes ({cadastrosExistentes.length})</h2>
          <div className="lista-cadastros">
            {cadastrosExistentes.map(cadastro => {
              const pessoa = pessoas.find(p => p.id === cadastro.pessoaId);
              return (
                <div key={cadastro.pessoaId} className="cadastro-item">
                  <div className="cadastro-info">
                    <strong>{pessoa?.nome || 'Desconhecido'}</strong>
                    <span className="cadastro-tipo">{cadastro.tipoPessoa}</span>
                  </div>
                  <div className="cadastro-datas">
                    <small>Cadastrado: {new Date(cadastro.cadastradoEm).toLocaleDateString()}</small>
                    <small>Atualizado: {new Date(cadastro.atualizadoEm).toLocaleDateString()}</small>
                  </div>
                  <button 
                    onClick={() => apagarCadastro(cadastro.pessoaId)}
                    className="btn-danger"
                    disabled={apagando}
                    title="Apagar este cadastro"
                  >
                    🗑️ Apagar
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
