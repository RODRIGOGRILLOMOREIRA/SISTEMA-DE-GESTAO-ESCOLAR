import { useState, useRef, useEffect } from 'react';
import { api } from '../lib/api';
import './CadastroFacial.css';

interface CadastroFacialProps {
  pessoaId: string;
  pessoaNome: string;
  tipoPessoa: 'PROFESSOR' | 'FUNCIONARIO' | 'EQUIPE_DIRETIVA';
  onConcluido: () => void;
  onCancelar: () => void;
}

export default function CadastroFacial({ pessoaId, pessoaNome, tipoPessoa, onConcluido, onCancelar }: CadastroFacialProps) {
  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [fotosCapturaadas, setFotosCapturaadas] = useState<string[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [modoUpload, setModoUpload] = useState(false); // Novo: modo upload de arquivos

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cameraInicializandoRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log('🔧 Componente CadastroFacial montado');
    console.log('   Pessoa:', pessoaNome);
    console.log('   Tipo:', tipoPessoa);
    return () => {
      console.log('🔧 Componente CadastroFacial desmontando - limpando câmera');
      pararCamera();
    };
  }, []);

  const iniciarCamera = async () => {
    if (cameraInicializandoRef.current) {
      console.log('⚠️ Câmera já está inicializando, ignorando chamada duplicada');
      return;
    }
    
    cameraInicializandoRef.current = true;
    
    try {
      setMensagem({ tipo: 'info', texto: '📹 Iniciando câmera...' });
      console.log('🎥 ETAPA 1: Renderizando elemento de vídeo...');
      
      // PRIMEIRO: ativar câmera para renderizar o <video>
      setCameraAtiva(true);
      
      // SEGUNDO: aguardar um tick para o React renderizar
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('🎥 ETAPA 2: Solicitando acesso à câmera...');
      
      // Verificar se o navegador suporta câmera
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Seu navegador não suporta acesso à câmera. Use Chrome, Edge ou Firefox atualizado.');
      }
      
      // Verificar permissão primeiro (se disponível)
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
          console.log('🔐 Status da permissão:', permissionStatus.state);
          
          if (permissionStatus.state === 'denied') {
            throw { 
              name: 'NotAllowedError', 
              message: 'Permissão da câmera foi negada. Você precisa permitir nas configurações do navegador.' 
            };
          }
        } catch (permError) {
          console.log('⚠️ Não foi possível verificar permissão:', permError);
          // Continua mesmo se não conseguir verificar
        }
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } 
      });
      
      console.log('✅ ETAPA 3: Permissão concedida, stream obtido');
      streamRef.current = stream;
      
      if (!videoRef.current) {
        console.error('❌ Elemento de vídeo não encontrado!');
        setMensagem({ tipo: 'error', texto: '❌ Erro: elemento de vídeo não encontrado' });
        setCameraAtiva(false);
        return;
      }

      const video = videoRef.current;
      console.log('✅ ETAPA 4: Elemento de vídeo encontrado');
      
      // Atribuir stream ao vídeo
      video.srcObject = stream;
      console.log('✅ ETAPA 5: Stream atribuído ao vídeo');
      
      // Forçar reprodução
      try {
        await video.play();
        console.log('✅ ETAPA 6: Video.play() executado');
      } catch (playError) {
        console.error('❌ Erro no play():', playError);
      }
      
      // Aguardar vídeo estar pronto com timeout
      console.log('⏳ ETAPA 7: Aguardando vídeo carregar...');
      let tentativas = 0;
      const maxTentativas = 50; // 5 segundos
      
      const verificarVideo = setInterval(() => {
        tentativas++;
        const largura = video.videoWidth;
        const altura = video.videoHeight;
        const estado = video.readyState;
        
        console.log(`   Tentativa ${tentativas}/${maxTentativas}: ${largura}x${altura} (readyState: ${estado})`);
        
        if (largura > 0 && altura > 0) {
          clearInterval(verificarVideo);
          console.log('✅ ETAPA 8: Vídeo PRONTO!');
          console.log(`   Dimensões finais: ${largura}x${altura}`);
          
          // Já foi definido no início: setCameraAtiva(true);
          setMensagem({ tipo: 'success', texto: '✅ Câmera ativa! Clique em CAPTURAR FOTO.' });
          console.log('✅ SISTEMA PRONTO PARA CAPTURA');
          cameraInicializandoRef.current = false;
          
        } else if (tentativas >= maxTentativas) {
          clearInterval(verificarVideo);
          console.error('❌ TIMEOUT: Vídeo não carregou após 5 segundos');
          setMensagem({ tipo: 'error', texto: '❌ Câmera não respondeu. Tente novamente ou use outro navegador.' });
          setCameraAtiva(false); // Desativa se falhou
          cameraInicializandoRef.current = false;
          pararCamera();
        }
      }, 100);
      
    } catch (error: any) {
      console.error('❌ ERRO ao acessar câmera:', error);
      console.error('   Nome do erro:', error.name);
      console.error('   Mensagem:', error.message);
      
      let mensagemErro = '❌ Erro ao acessar câmera';
      
      // Tratamento específico para cada tipo de erro
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        mensagemErro = '🚫 PERMISSÃO NEGADA! Clique no ícone de câmera na barra de endereço e permita o acesso.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        mensagemErro = '📷 Nenhuma câmera encontrada no dispositivo.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        mensagemErro = '⚠️ Câmera em uso por outro aplicativo. Feche outros programas que usam a câmera.';
      } else if (error.name === 'OverconstrainedError') {
        mensagemErro = '⚙️ Configurações da câmera não suportadas. Tentando configuração alternativa...';
      } else if (error.message) {
        mensagemErro = `❌ ${error.message}`;
      }
      
      setMensagem({ tipo: 'error', texto: mensagemErro });
      setCameraAtiva(false);
      cameraInicializandoRef.current = false;
    }
  };

  const pararCamera = () => {
    console.log('🛑 Parando câmera...');
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('🔴 Track parado:', track.kind);
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setCameraAtiva(false);
    cameraInicializandoRef.current = false;
    console.log('✅ Câmera desligada');
  };

  const selecionarArquivos = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    console.log(`📁 ${files.length} arquivo(s) selecionado(s)`);
    
    const fotosRestantes = 3 - fotosCapturaadas.length;
    const arquivosParaProcessar = Math.min(files.length, fotosRestantes);
    
    for (let i = 0; i < arquivosParaProcessar; i++) {
      const file = files[i];
      
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        console.error('❌ Arquivo não é uma imagem:', file.name);
        continue;
      }
      
      // Validar tamanho (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        console.error('❌ Arquivo muito grande:', file.name);
        setMensagem({ tipo: 'error', texto: '❌ Imagem muito grande (máx 10MB)' });
        continue;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        console.log('✅ Foto carregada:', file.name);
        
        setFotosCapturaadas(prev => {
          if (prev.length < 3) {
            const novasFotos = [...prev, base64];
            console.log(`📸 Total de fotos: ${novasFotos.length}/3`);
            
            if (novasFotos.length === 3) {
              setMensagem({ tipo: 'success', texto: '✅ 3 fotos carregadas! Clique em SALVAR.' });
            }
            
            return novasFotos;
          }
          return prev;
        });
      };
      
      reader.readAsDataURL(file);
    }
    
    // Limpar input para permitir selecionar os mesmos arquivos novamente
    if (event.target) {
      event.target.value = '';
    }
  };

  const capturarFoto = () => {
    if (!videoRef.current) {
      console.error('❌ videoRef.current é null');
      setMensagem({ tipo: 'error', texto: '❌ Vídeo não disponível' });
      return;
    }

    console.log('📸 Capturando foto...');
    console.log('📹 Estado da câmera:', { cameraAtiva, fotosCapturaadas: fotosCapturaadas.length });
    
    const video = videoRef.current;
    console.log('📹 Propriedades do vídeo:', {
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
      readyState: video.readyState,
      paused: video.paused
    });
    
    // Verificar se vídeo tem dimensões válidas
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.error('❌ Vídeo sem dimensões:', video.videoWidth, 'x', video.videoHeight);
      setMensagem({ tipo: 'error', texto: '❌ Vídeo não está pronto. Aguarde e tente novamente.' });
      return;
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    console.log('📐 Canvas criado:', canvas.width, 'x', canvas.height);
    
    const context = canvas.getContext('2d');
    if (context) {
      // Espelhar horizontalmente
      context.save();
      context.scale(-1, 1);
      context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      context.restore();
      
      const fotoBase64 = canvas.toDataURL('image/jpeg', 0.95);
      const novasFotos = [...fotosCapturaadas, fotoBase64];
      setFotosCapturaadas(novasFotos);
      
      console.log(`✅ Foto ${novasFotos.length}/3 capturada (${fotoBase64.length} bytes)`);
      
      setMensagem({ 
        tipo: 'success', 
        texto: `✅ Foto ${novasFotos.length}/3 capturada! ${novasFotos.length < 3 ? `Capture mais ${3 - novasFotos.length}.` : 'Pronto! Clique em Salvar.'}` 
      });

      // Parar câmera após 3 fotos
      if (novasFotos.length >= 3) {
        console.log('🛑 3 fotos capturadas - parando câmera');
        pararCamera();
      }
    } else {
      console.error('❌ Não foi possível obter contexto do canvas');
      setMensagem({ tipo: 'error', texto: '❌ Erro ao processar imagem' });
    }
  };

  const refazerFoto = (index: number) => {
    const novasFotos = fotosCapturaadas.filter((_, i) => i !== index);
    setFotosCapturaadas(novasFotos);
    console.log(`🔄 Foto ${index + 1} removida`);
    
    if (novasFotos.length < 3 && !cameraAtiva) {
      iniciarCamera();
    }
    
    setMensagem({ tipo: 'info', texto: `Foto ${index + 1} removida. ${3 - novasFotos.length} restante(s).` });
  };

  const salvarCadastro = async () => {
    if (fotosCapturaadas.length < 3) {
      setMensagem({ tipo: 'error', texto: '❌ É necessário capturar 3 fotos.' });
      return;
    }

    try {
      setSalvando(true);
      setMensagem({ tipo: 'info', texto: '⏳ Salvando cadastro...' });
      console.log('💾 Salvando cadastro facial...');

      const formData = new FormData();
      formData.append('pessoaId', pessoaId);
      formData.append('tipoPessoa', tipoPessoa);
      formData.append('descritores', JSON.stringify([])); // Vazio para simplificar

      // Converter fotos base64 para Blob
      for (let i = 0; i < fotosCapturaadas.length; i++) {
        const base64 = fotosCapturaadas[i];
        const base64Data = base64.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        
        for (let j = 0; j < byteCharacters.length; j++) {
          byteNumbers[j] = byteCharacters.charCodeAt(j);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });
        formData.append('fotos', blob, `foto-${i}.jpg`);
      }

      console.log('📤 Enviando para o servidor...');
      const response = await api.post('/reconhecimento-facial', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('✅ Resposta do servidor:', response.data);
      setMensagem({ tipo: 'success', texto: '✅ Cadastro salvo com sucesso!' });
      
      setTimeout(() => {
        pararCamera();
        onConcluido();
      }, 1500);

    } catch (error: any) {
      console.error('❌ Erro ao salvar:', error);
      console.error('❌ Detalhes:', error.response?.data);
      const errorMsg = error.response?.data?.error || 'Erro ao salvar cadastro';
      setMensagem({ tipo: 'error', texto: `❌ ${errorMsg}` });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="cadastro-facial-modal">
      <div className="cadastro-facial-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h2 style={{ margin: 0 }}>📸 Cadastro Facial Simples</h2>
          <button 
            onClick={onCancelar}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              fontSize: '1.5rem',
              cursor: 'pointer',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Fechar"
          >
            ✕
          </button>
        </div>
        <p className="pessoa-info"><strong>{pessoaNome}</strong></p>

        {mensagem.texto && (
          <div className={`mensagem mensagem-${mensagem.tipo}`}>
            {mensagem.texto}
            {mensagem.tipo === 'error' && mensagem.texto.includes('PERMISSÃO NEGADA') && (
              <div style={{ marginTop: '15px', padding: '15px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px', textAlign: 'left' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>🔧 Como permitir acesso à câmera:</p>
                <ol style={{ paddingLeft: '20px', margin: 0 }}>
                  <li>Clique no <strong>ícone de cadeado 🔒</strong> ou <strong>câmera 📷</strong> na barra de endereço (canto superior esquerdo)</li>
                  <li>Selecione <strong>"Sempre permitir acesso à câmera"</strong></li>
                  <li>Clique em <strong>"Concluído"</strong> ou <strong>"Recarregar"</strong></li>
                  <li>Tente iniciar a câmera novamente</li>
                </ol>
              </div>
            )}
            {mensagem.tipo === 'error' && mensagem.texto.includes('em uso') && (
              <div style={{ marginTop: '15px', padding: '15px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px', textAlign: 'left' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>🔧 Câmera em uso:</p>
                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                  <li>Feche programas como <strong>Skype, Teams, Zoom, OBS</strong></li>
                  <li>Feche <strong>outras abas do navegador</strong> que usam câmera</li>
                  <li>Reinicie o navegador se necessário</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {!cameraAtiva && fotosCapturaadas.length === 0 && !modoUpload && (
          <div className="instrucoes">
            <h3>📋 Instruções:</h3>
            <ul>
              <li>✅ Capture ou envie 3 fotos do seu rosto</li>
              <li>🔄 Tire fotos em ângulos diferentes</li>
              <li>💡 Mantenha boa iluminação</li>
              <li>😊 Olhe para a câmera</li>
            </ul>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
              <button className="btn-iniciar" onClick={iniciarCamera} style={{ background: '#10b981' }}>
                📷 Usar Câmera (Webcam)
              </button>
              
              <button 
                className="btn-iniciar" 
                onClick={() => setModoUpload(true)}
                style={{ background: '#3b82f6' }}
              >
                📁 Enviar Fotos do Computador
              </button>
              
              <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '10px', textAlign: 'center' }}>
                💡 Se a câmera não funcionar, use "Enviar Fotos"
              </p>
            </div>
          </div>
        )}

        {!cameraAtiva && modoUpload && (
          <div className="instrucoes">
            <h3>📁 Enviar Fotos</h3>
            <p style={{ marginBottom: '15px' }}>Selecione 3 fotos do seu rosto (pode selecionar várias de uma vez)</p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            
            {fotosCapturaadas.length < 3 && (
              <button 
                className="btn-iniciar" 
                onClick={selecionarArquivos}
                style={{ background: '#3b82f6', marginBottom: '15px' }}
              >
                📂 Selecionar Fotos ({fotosCapturaadas.length}/3)
              </button>
            )}
            
            <button 
              onClick={() => {
                setModoUpload(false);
                setFotosCapturaadas([]);
              }}
              style={{ 
                background: '#6b7280', 
                border: 'none',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              ← Voltar para Câmera
            </button>
          </div>
        )}

        {cameraAtiva && (
          <div className="camera-section">
            <div className="video-container">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                style={{ transform: 'scaleX(-1)', width: '100%', borderRadius: '10px' }}
              />
            </div>

            <div className="progresso-captura">
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                📸 Fotos: {fotosCapturaadas.length}/3
              </p>
              <div className="barra-progresso">
                <div 
                  className="barra-progresso-fill" 
                  style={{ width: `${(fotosCapturaadas.length / 3) * 100}%` }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button 
                className="btn-capturar" 
                onClick={capturarFoto}
                disabled={fotosCapturaadas.length >= 3}
                style={{ 
                  fontSize: '1.2rem', 
                  padding: '15px 40px',
                  background: fotosCapturaadas.length >= 3 ? '#6b7280' : '#10b981',
                  border: 'none',
                  color: 'white',
                  borderRadius: '10px',
                  cursor: fotosCapturaadas.length >= 3 ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                📸 CAPTURAR FOTO ({fotosCapturaadas.length + 1}/3)
              </button>
              
              <button 
                onClick={pararCamera}
                style={{ 
                  fontSize: '1.2rem', 
                  padding: '15px 40px',
                  background: '#ef4444',
                  border: 'none',
                  color: 'white',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                🛑 PARAR
              </button>
            </div>
          </div>
        )}

        {fotosCapturaadas.length > 0 && (
          <div className="fotos-preview">
            <h3>📷 Fotos {modoUpload ? 'Carregadas' : 'Capturadas'} ({fotosCapturaadas.length}/3):</h3>
            <div className="fotos-grid">
              {fotosCapturaadas.map((foto, index) => (
                <div key={index} className="foto-item">
                  <img src={foto} alt={`Foto ${index + 1}`} style={{ borderRadius: '10px', width: '100%' }} />
                  <button 
                    className="btn-refazer" 
                    onClick={() => refazerFoto(index)}
                    disabled={salvando}
                    style={{ marginTop: '10px' }}
                  >
                    🔄 Refazer {index + 1}
                  </button>
                </div>
              ))}
            </div>

            {fotosCapturaadas.length >= 3 && (
              <div style={{ marginTop: '30px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button 
                  onClick={salvarCadastro}
                  disabled={salvando}
                  style={{ 
                    fontSize: '1.2rem', 
                    padding: '15px 40px',
                    background: salvando ? '#6b7280' : '#10b981',
                    border: 'none',
                    color: 'white',
                    borderRadius: '10px',
                    cursor: salvando ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  {salvando ? '⏳ SALVANDO...' : '✅ SALVAR CADASTRO'}
                </button>
                
                {!modoUpload && (
                  <button 
                    onClick={onCancelar}
                    disabled={salvando}
                    style={{ 
                      fontSize: '1.2rem', 
                      padding: '15px 40px',
                      background: '#ef4444',
                      border: 'none',
                      color: 'white',
                      borderRadius: '10px',
                      cursor: salvando ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    ❌ CANCELAR
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
