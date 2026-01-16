/**
 * ========================================
 * SISTEMA DE GESTÃO ESCOLAR (SGE)
 * Frontend Application
 * ========================================
 * 
 * @copyright Copyright (c) 2026 Rodrigo Grillo Moreira
 * @license PROPRIETARY - Todos os direitos reservados
 * 
 * CONFIDENCIAL E PROPRIETÁRIO
 * 
 * Este código é propriedade exclusiva e contém informações
 * confidenciais. Uso não autorizado, cópia, modificação ou
 * distribuição são estritamente proibidos e sujeitos a
 * ações legais.
 * 
 * Licenciado para: [Cliente/Instituição]
 * 
 * @author Rodrigo Grillo Moreira
 * @version 1.0.0
 * @since 2026-01-10
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { AnoLetivoProvider } from './contexts/AnoLetivoContext'
import { WebSocketProvider } from './contexts/WebSocketContext'
import { Toaster } from './components/Toaster'
import { EnhancedToastContainer } from './components/EnhancedToast'
import { ScrollToTopButton } from './hooks/useSmoothScroll'
import PrivateRoute from './components/PrivateRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import UserManagement from './pages/UserManagement'
import Dashboard from './pages/Dashboard'
import EquipeDiretivaPage from './pages/EquipeDiretiva'
import FuncionariosPage from './pages/Funcionarios'
import Alunos from './pages/Alunos'
import Professores from './pages/Professores'
import RegistroPontoIntegrado from './pages/RegistroPontoIntegrado'
import Turmas from './pages/Turmas'
import Disciplinas from './pages/Disciplinas'
import Notas from './pages/Notas'
import FrequenciaPage from './pages/FrequenciaPage'
import CalendarioEscolarPage from './pages/CalendarioEscolarPage'
import GradeHorariaPage from './pages/GradeHorariaPage'
import Relatorios from './pages/Relatorios'
import RelatoriosAdministrativos from './pages/RelatoriosAdministrativos'
import Habilidades from './pages/Habilidades'
import Configuracoes from './pages/Configuracoes'
import BoletimDesempenho from './pages/BoletimDesempenho'
import NotificacoesConfig from './pages/NotificacoesConfig'
import AuditLogs from './pages/AuditLogs'
import TwoFactorAuth from './pages/TwoFactorAuth'
import SystemMonitoring from './pages/SystemMonitoring'
import RBAC from './pages/RBAC'
import Infrastructure from './pages/Infrastructure'
import DropoutPrediction from './pages/DropoutPrediction'
import CommunicationCenter from './pages/CommunicationCenter' // FASE 5: Central de Comunicação
import ImportExcel from './pages/ImportExcel' // FASE 5: Importação de Excel

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AnoLetivoProvider>
          <WebSocketProvider>
            <BrowserRouter>
              <Toaster />
              <EnhancedToastContainer />
              <ScrollToTopButton />
              <Routes>
                {/* Rotas públicas */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/user-management" element={<UserManagement />} />

              {/* Rotas privadas */}
              <Route path="/" element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="equipe-diretiva" element={<EquipeDiretivaPage />} />
                <Route path="funcionarios" element={<FuncionariosPage />} />
                <Route path="alunos" element={<Alunos />} />
                <Route path="professores" element={<Professores />} />
                <Route path="registro-ponto" element={<RegistroPontoIntegrado />} />
                <Route path="turmas" element={<Turmas />} />
                <Route path="disciplinas" element={<Disciplinas />} />
                <Route path="calendario-escolar" element={<CalendarioEscolarPage />} />
                <Route path="grade-horaria" element={<GradeHorariaPage />} />
                <Route path="notas" element={<Notas />} />
                <Route path="frequencia" element={<FrequenciaPage />} />
                <Route path="habilidades" element={<Habilidades />} />
                <Route path="boletim" element={<BoletimDesempenho />} />
                <Route path="relatorios" element={<Relatorios />} />
                <Route path="relatorios-administrativos" element={<RelatoriosAdministrativos />} />
                <Route path="configuracoes" element={<Configuracoes />} />
                <Route path="notificacoes" element={<NotificacoesConfig />} />
                <Route path="auditoria" element={<AuditLogs />} />
                <Route path="two-factor" element={<TwoFactorAuth />} />
                <Route path="monitoramento" element={<SystemMonitoring />} />
                <Route path="rbac" element={<RBAC />} />
                <Route path="infraestrutura" element={<Infrastructure />} />
                <Route path="predicao-evasao" element={<DropoutPrediction />} />
                <Route path="central-comunicacao" element={<CommunicationCenter />} /> {/* FASE 5 */}
                <Route path="importar-excel" element={<ImportExcel />} /> {/* FASE 5: Importação */}
              </Route>
            </Routes>
          </BrowserRouter>
          </WebSocketProvider>
        </AnoLetivoProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
