/**
 * Página de Configuração de Autenticação Multi-Fator (2FA)
 * Fase 4 - Segurança Avançada
 */

import { useState, useEffect } from 'react';
import { Shield, Key, Copy, Check, AlertCircle, Smartphone } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:3333';

interface TwoFactorStatus {
  enabled: boolean;
  backupCodesRemaining: number;
}

interface TwoFactorSetup {
  qrCodeUrl: string;
  secret: string;
  backupCodes: string[];
  message: string;
}

export default function TwoFactorAuth() {
  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Setup
  const [setupData, setSetupData] = useState<TwoFactorSetup | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackupCode, setCopiedBackupCode] = useState<number | null>(null);

  // Buscar status ao carregar
  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/two-factor/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatus(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao buscar status do 2FA');
    }
  };

  const handleSetup = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/two-factor/setup`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSetupData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao configurar 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      setError('O código deve ter 6 dígitos');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/two-factor/verify`,
        { token: verificationCode },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setSuccess(response.data.message);
      setSetupData(null);
      setVerificationCode('');
      
      // Atualizar status
      setTimeout(() => {
        fetchStatus();
        setSuccess('');
      }, 3000);
      
    } catch (err: any) {
      setError(err.response?.data?.error || 'Código inválido');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!confirm('Tem certeza que deseja desabilitar o 2FA? Isso reduzirá a segurança da sua conta.')) {
      return;
    }

    const password = prompt('Digite sua senha para confirmar:');
    if (!password) return;

    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/two-factor/disable`,
        { password },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setSuccess('2FA desabilitado com sucesso');
      fetchStatus();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao desabilitar 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    if (!confirm('Tem certeza? Os códigos antigos serão invalidados.')) {
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/two-factor/regenerate-backup-codes`,
        {},
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setSetupData({
        ...setupData!,
        backupCodes: response.data.backupCodes,
        qrCodeUrl: '',
        secret: '',
        message: response.data.message
      });
      
      setSuccess('Códigos regenerados com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao regenerar códigos');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: 'secret' | number) => {
    navigator.clipboard.writeText(text);
    
    if (type === 'secret') {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } else {
      setCopiedBackupCode(type);
      setTimeout(() => setCopiedBackupCode(null), 2000);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600" />
          Autenticação Multi-Fator (2FA)
        </h1>
        <p className="text-gray-600 mt-2">
          Adicione uma camada extra de segurança à sua conta
        </p>
      </div>

      {/* Alertas */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start gap-2">
          <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Status Atual */}
      {status && !setupData && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Status Atual</h2>
          
          <div className="flex items-center gap-4 mb-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              status.enabled 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              <Shield className="w-5 h-5" />
              <span className="font-medium">
                {status.enabled ? '2FA Ativado' : '2FA Desativado'}
              </span>
            </div>
            
            {status.enabled && (
              <div className="flex items-center gap-2 text-gray-600">
                <Key className="w-4 h-4" />
                <span>{status.backupCodesRemaining} códigos de backup restantes</span>
              </div>
            )}
          </div>

          {!status.enabled ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Por que habilitar 2FA?</h3>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• Protege sua conta contra acesso não autorizado</li>
                  <li>• Requer código do seu celular além da senha</li>
                  <li>• Recomendado para contas de administrador</li>
                </ul>
              </div>

              <button
                onClick={handleSetup}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Configurando...' : 'Habilitar 2FA'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleRegenerateBackupCodes}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition disabled:opacity-50"
              >
                Regenerar Códigos de Backup
              </button>
              
              <button
                onClick={handleDisable}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition disabled:opacity-50"
              >
                Desabilitar 2FA
              </button>
            </div>
          )}
        </div>
      )}

      {/* Setup do 2FA */}
      {setupData && (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <h2 className="text-xl font-semibold">Configurar 2FA</h2>

          {/* QR Code */}
          {setupData.qrCodeUrl && (
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Passo 1: Escaneie o QR Code
                </h3>
                
                <div className="flex flex-col items-center gap-4">
                  <img 
                    src={setupData.qrCodeUrl} 
                    alt="QR Code 2FA" 
                    className="w-64 h-64 border-4 border-white shadow-lg rounded-lg"
                  />
                  
                  <p className="text-sm text-gray-600 text-center max-w-md">
                    Use um aplicativo autenticador como <strong>Google Authenticator</strong>, 
                    <strong> Microsoft Authenticator</strong> ou <strong>Authy</strong>
                  </p>
                </div>
              </div>

              {/* Secret Manual */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium mb-2 text-sm">Ou configure manualmente:</h4>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white px-3 py-2 rounded border border-gray-300 font-mono text-sm">
                    {setupData.secret}
                  </code>
                  <button
                    onClick={() => copyToClipboard(setupData.secret, 'secret')}
                    className="p-2 hover:bg-gray-200 rounded transition"
                    title="Copiar"
                  >
                    {copiedSecret ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Verificação */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium mb-3">Passo 2: Digite o código para verificar</h3>
                
                <div className="space-y-4">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full text-center text-2xl font-mono tracking-wider px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={6}
                  />
                  
                  <button
                    onClick={handleVerify}
                    disabled={loading || verificationCode.length !== 6}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Verificando...' : 'Verificar e Ativar 2FA'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Códigos de Backup */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="font-medium text-yellow-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Códigos de Backup - GUARDE EM LOCAL SEGURO!
            </h3>
            
            <p className="text-yellow-800 text-sm mb-4">
              Use estes códigos se perder acesso ao aplicativo autenticador. 
              Cada código só pode ser usado uma vez.
            </p>
            
            <div className="grid grid-cols-2 gap-2">
              {setupData.backupCodes.map((code, index) => (
                <div key={index} className="flex items-center gap-2 bg-white px-3 py-2 rounded border border-yellow-300">
                  <code className="flex-1 font-mono text-sm">{code}</code>
                  <button
                    onClick={() => copyToClipboard(code, index)}
                    className="p-1 hover:bg-gray-100 rounded transition"
                    title="Copiar"
                  >
                    {copiedBackupCode === index ? 
                      <Check className="w-4 h-4 text-green-600" /> : 
                      <Copy className="w-4 h-4" />
                    }
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                const text = setupData.backupCodes.join('\n');
                navigator.clipboard.writeText(text);
                setSuccess('Todos os códigos copiados!');
                setTimeout(() => setSuccess(''), 2000);
              }}
              className="mt-4 w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              Copiar Todos os Códigos
            </button>
          </div>
        </div>
      )}

      {/* Informações */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">ℹ️ Informações Importantes</h3>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• Os códigos mudam a cada 30 segundos</li>
          <li>• Códigos de backup podem ser usados apenas uma vez</li>
          <li>• Mantenha seu celular sincronizado com a hora correta</li>
          <li>• Guarde os códigos de backup em local seguro (cofre, gerenciador de senhas)</li>
        </ul>
      </div>
    </div>
  );
}
