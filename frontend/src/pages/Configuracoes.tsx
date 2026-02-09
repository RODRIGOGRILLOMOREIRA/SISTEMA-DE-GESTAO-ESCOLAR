import { useEffect, useState } from 'react'
import { Save, Upload, Moon, Sun, Calendar } from 'lucide-react'
import { configuracoesAPI, Configuracao } from '../lib/api'
import { useTheme } from '../contexts/ThemeContext'
import { useAnoLetivo } from '../contexts/AnoLetivoContext'
import SeletorAnoLetivo from '../components/SeletorAnoLetivo'
import './ModernPages.css'
import './Configuracoes.css'

const Configuracoes = () => {
  const { theme, setTheme } = useTheme()
  const { anoLetivo, setAnoLetivo } = useAnoLetivo()
  const [config, setConfig] = useState<Configuracao>({
    id: '',
    nomeEscola: '',
    redeEscolar: '',
    endereco: '',
    telefone: '',
    email: '',
    logoUrl: '',
    temaModo: 'light',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string>('')

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const response = await configuracoesAPI.get()
      setConfig(response.data)
      if (response.data.logoUrl) {
        setLogoPreview(response.data.logoUrl)
      }
      setTheme(response.data.temaModo)
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setLogoPreview(base64)
        setConfig({ ...config, logoUrl: base64 })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    console.log('📝 Salvando configurações:', config)
    
    try {
      // Remover o ID antes de enviar (não é necessário no PUT)
      const { id, createdAt, updatedAt, ...dataToSend } = config
      
      // Preparar dados com valores limpos
      const payload = {
        nomeEscola: dataToSend.nomeEscola || '',
        redeEscolar: dataToSend.redeEscolar || null,
        endereco: dataToSend.endereco || '',
        telefone: dataToSend.telefone || null,
        email: dataToSend.email || null,
        logoUrl: dataToSend.logoUrl || null,
        temaModo: theme,
      }
      
      console.log('📤 Enviando payload:', payload)
      
      const response = await configuracoesAPI.update(payload)
      
      console.log('✅ Resposta do servidor:', response.data)
      
      setConfig(response.data)
      alert('Configurações salvas com sucesso!')
      
      // Recarregar a página para aplicar mudanças
      await loadConfig()
      
      // Disparar evento para atualizar o Layout
      window.dispatchEvent(new Event('configUpdated'))
      
    } catch (error: any) {
      console.error('❌ Erro ao salvar configurações:', error)
      console.error('Detalhes do erro:', error.response?.data)
      const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message || 'Erro ao salvar configurações'
      alert(`Erro: ${errorMessage}`)
    } finally {
      setSaving(false)
    }
  }

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    setConfig({ ...config, temaModo: newTheme })
  }

  if (loading) return <div className="loading">Carregando...</div>

  return (
    <div className="configuracoes-page">
      <div className="page-header">
        <h1>Configurações</h1>
      </div>

      <div className="config-container">
        <form onSubmit={handleSubmit} className="config-form">
          
          {/* Ano Letivo Ativo - Primeira Seção */}
          <div className="config-section ano-letivo-section-config">
            <h2>
              <Calendar size={24} />
              Ano Letivo Ativo
            </h2>
            <p className="section-description">
              O ano letivo selecionado será aplicado em todo o sistema (Notas, Frequências, Boletim, Relatórios, etc.)
            </p>
            <div className="ano-letivo-selector-wrapper">
              <SeletorAnoLetivo
                anoSelecionado={anoLetivo}
                onAnoChange={setAnoLetivo}
              />
            </div>
            <div className="ano-letivo-info">
              <span className="info-badge">
                📌 Ano Letivo Atual: <strong>{anoLetivo}</strong>
              </span>
              <p className="info-text">
                Todas as páginas do sistema utilizarão este ano letivo automaticamente.
                Para visualizar ou editar dados de outros anos, altere aqui.
              </p>
            </div>
          </div>

          {/* Logo Section */}
          <div className="config-section">
            <h2>Logo da Escola</h2>
            <div className="logo-upload-area">
              {logoPreview ? (
                <div className="logo-preview">
                  <img src={logoPreview} alt="Logo da escola" />
                </div>
              ) : (
                <div className="logo-placeholder">
                  <Upload size={48} />
                  <p>Nenhuma logo carregada</p>
                </div>
              )}
              <label htmlFor="logo-upload" className="upload-btn">
                <Upload size={20} />
                Carregar Logo
              </label>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Informações da Escola */}
          <div className="config-section">
            <h2>Informações da Escola</h2>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="nomeEscola">Nome da Escola *</label>
                <input
                  id="nomeEscola"
                  type="text"
                  value={config.nomeEscola}
                  onChange={(e) => setConfig({ ...config, nomeEscola: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="redeEscolar">Rede Escolar</label>
                <input
                  id="redeEscolar"
                  type="text"
                  value={config.redeEscolar || ''}
                  onChange={(e) => setConfig({ ...config, redeEscolar: e.target.value })}
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="endereco">Endereço *</label>
                <input
                  id="endereco"
                  type="text"
                  value={config.endereco}
                  onChange={(e) => setConfig({ ...config, endereco: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="telefone">Telefone</label>
                <input
                  id="telefone"
                  type="tel"
                  value={config.telefone || ''}
                  onChange={(e) => setConfig({ ...config, telefone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">E-mail</label>
                <input
                  id="email"
                  type="email"
                  value={config.email || ''}
                  onChange={(e) => setConfig({ ...config, email: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Aparência */}
          <div className="config-section">
            <h2>Aparência</h2>
            <div className="theme-toggle-container">
              <label>Tema do Sistema</label>
              <button
                type="button"
                onClick={handleThemeToggle}
                className="theme-toggle-btn"
              >
                {theme === 'light' ? (
                  <>
                    <Sun size={20} />
                    Modo Claro
                  </>
                ) : (
                  <>
                    <Moon size={20} />
                    Modo Escuro
                  </>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="save-btn" disabled={saving}>
            <Save size={20} />
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Configuracoes
